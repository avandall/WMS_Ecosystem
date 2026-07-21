# 📦 WMS Ecosystem: Decoupled Warehouse Orchestration Platform

Welcome to the **WMS Ecosystem**—a high-performance, clean-architecture warehouse management system. This repository acts as the parent workspace grouping three specialized Git submodules that compile, deploy, and execute independently.

---

## 🧭 Repository Index & Architecture

The ecosystem consists of the following isolated repositories:

| Repository | Purpose | Technical Stack | Documentation |
| :--- | :--- | :--- | :--- |
| **`WMS_Core`** | Core business operations, API endpoints, microservices, database transactions | FastAPI, PostgreSQL, gRPC, Redis, Alembic | [README](file:///home/avandall1999/Projects/WMS_Root/WMS_Core/README.md) |
| **`WMS_AI_Services`** | Heavy RAG queries, prompt template extraction, LangGraph agent workflows, fine-tuning LoRA adapters | LangGraph, LangChain, ChromaDB, Groq, PyTorch | [README](file:///home/avandall1999/Projects/WMS_Root/WMS_AI_Services/README.md) |
| **`WMS_MCP_Server`** | Model Context Protocol (MCP) tool provider. Exposes 19 operational tools to AI clients | MCP SDK, PostgreSQL, Stdio/SSE | [README](file:///home/avandall1999/Projects/WMS_Root/WMS_MCP_Server/README.md) |

```
WMS_Root/ (Parent Workspace)
├── docker-compose.yml       # Orchestrates the entire ecosystem (Core + AI + MCP)
├── WMS_Core/                # Submodule: Core business transactions & DBs
├── WMS_AI_Services/         # Submodule: AI RAG & LangGraph reasoning agents
└── WMS_MCP_Server/          # Submodule: Model Context Protocol Tool Provider
```

---

## 🛠️ Ecosystem Architecture

All repositories are fully decoupled and communicate across clean boundaries:
1. **gRPC Interface**: `api-gateway` routes user queries downstream to `ai-service` on port `50059`.
2. **HTTP Backend Query API**: The `ai-service` queries operational data by posting prompt templates back to `api-gateway` on `POST /api/v1/ai/backend-query`.
3. **Model Context Protocol (MCP)**: The `WMS_AI_Services` LangGraph agent connects to the `WMS_MCP_Server` using stdio transport parameters, fetching and running warehouse tools dynamically.

---

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Python 3.12+ (if running local development scripts)

### Booting the Stack

Run the operations and business monolith inside `WMS_Core`:
```bash
cd WMS_Core
docker compose up -d
```

To boot the **AI Services** in parallel, use the `ai` compose profile:
```bash
docker compose --profile ai up -d --build
```

### System Dashboards & Logs
- **API Gateway**: `http://localhost:8000`
- **Dashboard UI**: `http://localhost:8080`
- **AI Health Check**: `http://localhost:8009/health`
- **AI Metrics**: `http://localhost:8009/metrics`


### Portfolio
- **Live Link**: `https://avandall.github.io/WMS_Ecosystem`
- **GitHub**: `https://github.com/avandall/WMS_Ecosystem`   