import pytest
from unittest.mock import MagicMock, patch
from app.orchestrator.orchestrator import ContainerOrchestrator

@pytest.fixture
def mock_dependencies():
    with patch("app.orchestrator.orchestrator.namespaces") as mock_ns, \
         patch("app.orchestrator.orchestrator.cgroups") as mock_cg, \
         patch("app.orchestrator.orchestrator.network") as mock_net, \
         patch("os.makedirs") as mock_mkdirs, \
         patch("shutil.copytree") as mock_copy, \
         patch("shutil.rmtree") as mock_rm, \
         patch("os.path.exists", return_value=False):
        
        yield {
            "ns": mock_ns,
            "cg": mock_cg,
            "net": mock_net,
            "mkdirs": mock_mkdirs,
            "copy": mock_copy,
            "rm": mock_rm
        }

def test_orchestrator_init(mock_dependencies):
    # Teste si l'orchestrateur initialise bien le système
    orch = ContainerOrchestrator()
    
    mock_dependencies["cg"].init_cgroup_root.assert_called_once()
    mock_dependencies["net"].setup_bridge.assert_called_once()
    mock_dependencies["mkdirs"].assert_called()

def test_create_node(mock_dependencies):
    orch = ContainerOrchestrator()
    
    # Simulation du process retourné par namespaces.run_process_in_isolation
    mock_proc = MagicMock()
    mock_proc.pid = 12345
    mock_proc.poll.return_value = None # Process running
    mock_dependencies["ns"].run_process_in_isolation.return_value = mock_proc
    
    # Action
    result = orch.create_node(
        node_id="node_test", 
        ip="10.10.0.99", 
        cpu_limit=20, 
        mem_limit=512
    )
    
    # Vérifications
    assert result["status"] == "started"
    assert result["pid"] == 12345
    
    # Vérifier que le rootfs a été copié
    mock_dependencies["copy"].assert_called()
    
    # Vérifier que le processus a été lancé
    mock_dependencies["ns"].run_process_in_isolation.assert_called_once()
    
    # Vérifier Cgroups
    mock_dependencies["cg"].create_cgroup.assert_called_with("node_test", 20, 512)
    mock_dependencies["cg"].add_process_to_cgroup.assert_called_with("node_test", 12345)
    
    # Vérifier Réseau
    mock_dependencies["net"].setup_node_network.assert_called_with(
        "node_test", 12345, "10.10.0.99", "br0", "10.10.0.1"
    )

def test_stop_node(mock_dependencies):
    orch = ContainerOrchestrator()
    
    # On injecte manuellement un conteneur actif
    orch.active_containers["node_test"] = 12345
    
    with patch("os.kill") as mock_kill:
        result = orch.stop_node("node_test")
        
        assert result["status"] == "stopped"
        assert "node_test" not in orch.active_containers
        
        # Vérifie qu'on a tenté de tuer le processus
        assert mock_kill.call_count >= 1
        
        # Vérifie le nettoyage
        mock_dependencies["net"].cleanup_network.assert_called_with("node_test")
        mock_dependencies["cg"].remove_cgroup.assert_called_with("node_test")
        mock_dependencies["rm"].assert_called() # Suppression dossier