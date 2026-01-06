import pytest
from unittest.mock import MagicMock, call
# Correction de l'import : on utilise NodeManager
from app.orchestrator.orchestrator import NodeManager 

def test_create_node_calls_system_commands(mocker):
    """
    Vérifie que NodeManager lance bien les commandes 'ip link', 'ip netns', etc.
    """
    # 1. On MOCK (simule) subprocess.run pour ne pas toucher au vrai système
    mock_subprocess = mocker.patch('app.orchestrator.orchestrator.subprocess.run')
    mock_os_makedirs = mocker.patch('app.orchestrator.orchestrator.os.makedirs')
    mock_os_exists = mocker.patch('app.orchestrator.orchestrator.os.path.exists')

    # On fait croire que le dossier n'existe pas pour forcer le code à essayer de le créer
    mock_os_exists.return_value = False 

    # 2. Initialisation
    manager = NodeManager()
    node_id = "test-node-01"
    ip_test = "10.10.0.50"

    # 3. Action : On appelle la fonction de création
    manager.create_node(node_id, ip_test)

    # 4. Vérifications (Assertions)
    
    # A-t-il essayé de créer le dossier ?
    mock_os_makedirs.assert_called_once()

    # A-t-il lancé des commandes système ?
    assert mock_subprocess.called
    
    # Récupérons la liste de toutes les commandes lancées
    # call_args_list contient des objets 'call', on extrait les arguments (cmd)
    executed_commands = [call_obj.args[0] for call_obj in mock_subprocess.call_args_list]

    # Vérifions les commandes critiques
    print("\nCommandes interceptées :")
    for cmd in executed_commands:
        print(cmd)

    # 1. Création du namespace
    assert ["ip", "netns", "add", node_id] in executed_commands, "La commande 'ip netns add' manque"

    # 2. Création des veth
    # On cherche une commande qui contient 'ip', 'link', 'add' et le nom du node
    veth_creation = any("veth" in cmd[3] and "peer" in cmd for cmd in executed_commands)
    assert veth_creation, "La création des interfaces veth a échoué"

    # 3. Assignation de l'IP
    ip_assignment = any(f"{ip_test}/24" in cmd for cmd in executed_commands)
    assert ip_assignment, "L'assignation de l'adresse IP n'a pas été demandée"