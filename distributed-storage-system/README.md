# Distributed Storage System

A full-stack distributed object storage system built from scratch in Python and TypeScript.
This project implements its own container engine (using Linux Namespaces and Cgroups v2) to simulate storage nodes, bypassing high-level tools like Docker or Kubernetes to demonstrate deep system-level understanding.

## 🏗 Architecture

The system is divided into three distinct layers to ensure security and scalability:

1.  **Control Plane (Root Privileges):**
    * **Orchestrator Daemon:** Manages the lifecycle of custom containers (Nodes).
    * **System Calls:** Uses `unshare`, `nsenter`, `mount`, and `tc` for isolation and QoS.
    * **IPC Server:** Listens on a Unix Socket for commands from the Web API.

2.  **User Plane (User Privileges):**
    * **FastAPI Backend:** Handles Authentication (JWT), File Metadata, and Client Requests.
    * **Storage Logic:** Implements chunking, replication (RAID-like), and placement algorithms.
    * **Workers:** Background tasks for rebalancing and data integrity checks.

3.  **Frontend (Next.js):**
    * **Dashboard:** Real-time monitoring of node resources (CPU/RAM/Disk).
    * **File Explorer:** Drag-and-drop upload/download interface.
    * **Visualization:** Live status of chunk distribution across nodes.

```text
[Browser] <-> [Next.js UI] <-> [FastAPI] <-> [IPC Socket] <-> [Orchestrator (Root)]
                                    |                                 |
                                 [SQLite]                       [Linux Containers]
                                                                 /      |      \
                                                            [Node1]  [Node2]  [Node3]