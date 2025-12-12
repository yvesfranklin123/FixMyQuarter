import random
from typing import List, Optional
from sqlalchemy.orm import Session
from ..database.models import Node

def select_best_nodes(db: Session, replication_factor: int, exclude_node_ids: List[str] = None, required_size: int = 0) -> List[Node]:
    """
    Sélectionne les meilleurs nœuds pour stocker un chunk.
    Critères:
    1. Le nœud doit être ONLINE.
    2. Le nœud doit avoir assez d'espace disque (via quota ou capacité physique).
    3. On évite les nœuds déjà présents dans exclude_node_ids.
    """
    if exclude_node_ids is None:
        exclude_node_ids = []

    # 1. Filtrer les candidats
    candidates = db.query(Node).filter(
        Node.status == "ONLINE",
        Node.id.notin_(exclude_node_ids)
    ).all()

    valid_candidates = []
    for node in candidates:
        # Vérification basique de l'espace (si stats dispos)
        # On suppose que 0 signifie "pas d'info", donc on accepte par défaut
        free_space = node.stats.get("disk_free", float('inf')) if node.stats else float('inf')
        
        if free_space > required_size:
            valid_candidates.append(node)

    if len(valid_candidates) < replication_factor:
        # Pas assez de nœuds, on retourne ce qu'on a (le caller devra gérer l'erreur ou le mode dégradé)
        return valid_candidates

    # 2. Algorithme de sélection
    # Ici: Weighted Random basé sur l'espace libre pour éviter de remplir le même nœud
    # On pourrait ajouter la charge CPU ou le réseau plus tard.
    
    # Simple shuffle pour l'instant (Load Balancing basique)
    random.shuffle(valid_candidates)
    
    return valid_candidates[:replication_factor]