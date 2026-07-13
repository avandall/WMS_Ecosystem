# 📦 Danh sách Công nghệ & Kiến trúc trong Hệ thống WMS Ecosystem

Tài liệu này tổng hợp toàn bộ các công nghệ, thư viện, giao thức, và các mẫu thiết kế (design patterns) được sử dụng trong hệ thống **WMS Ecosystem** (bao gồm `WMS_Core`, `WMS_AI_Services`, `WMS_MCP_Server`). Đây là tài liệu tham khảo hỗ trợ quá trình vừa học vừa xây dựng hệ thống.

---

## 1. Ngôn ngữ lập trình & Cú pháp đặc trưng (Languages & Syntax)
*   **Python 3.12+**:
    *   *Type Annotations*: Sử dụng `from __future__ import annotations` để hỗ trợ khai báo kiểu dữ liệu tĩnh nâng cao, Generic Types (`TypeVar`), và các kiểu dữ liệu phức tạp.
    *   *Asynchronous Programming*: Cú pháp `async/await` kết hợp với thư viện `asyncio` để xử lý bất đồng bộ (như `asyncio.Queue`, `asyncio.gather`, `asyncio.open_connection`).
    *   *Dataclasses*: Cú pháp `@dataclass(slots=True)` để tối ưu hóa bộ nhớ cho các cấu trúc dữ liệu truyền tải (DTO - Data Transfer Object, Event Envelope).
    *   *Context Managers*: Triển khai `@contextmanager` và `@asynccontextmanager` cho quản lý vòng đời tài nguyên (kết nối DB, channel gRPC).
*   **JavaScript (ES6+)**: Vanilla JS xử lý DOM, gửi request phi đồng bộ qua `Fetch API` và quản lý trạng thái tại giao diện người dùng dashboard.
*   **HTML5 & CSS3**: Vanilla CSS xây dựng hệ thống hiển thị (CSS Variables, CSS Grid, Flexbox, Keyframes animation, Glassmorphic UI).
*   **Protocol Buffers (Proto3)**: Ngôn ngữ đặc tả schema để sinh mã nguồn tự động cho truyền thông gRPC.
*   **SQL (PostgreSQL & SQLite dialect)**: Các câu lệnh truy vấn quan hệ, cơ chế tạo index và transaction.
*   **HCL (HashiCorp Configuration Language)**: Viết mã nguồn cấu hình hạ tầng trong Terraform.
*   **YAML**: Định cấu hình cho Ansible Playbooks, Docker Compose, Kubernetes manifests và Prometheus Alerting rules.

---

## 2. Các Framework & Thư viện Backend (Web, API & RPC)
*   **FastAPI**: Web framework bất đồng bộ, hiệu năng cao dùng để xây dựng API Gateway và proxy cho dashboard.
*   **Starlette**: ASGI toolkit nền tảng bên dưới FastAPI và MCP Server, phụ trách routing và quản lý middleware.
*   **Uvicorn & Gunicorn**: Máy chủ ASGI chạy ứng dụng Python bất đồng bộ trong môi trường sản xuất.
*   **gRPC (`grpcio` & `grpcio-tools`)**: Khung giao tiếp đồng bộ hiệu năng cao (HTTP/2) giữa các microservices bằng cách gọi hàm từ xa (Remote Procedure Call).
*   **Mangum**: Adapter hỗ trợ chạy FastAPI trên môi trường Serverless (như AWS Lambda và API Gateway).
*   **HTTPX**: Client HTTP bất đồng bộ hỗ trợ kết nối đồng thời cao để gửi truy vấn chéo giữa AI service và API Gateway.

---

## 3. Trí tuệ nhân tạo & RAG (AI, Vector DB & LLM Agents)
*   **LangGraph**: Xây dựng quy trình tác vụ Agent AI phức tạp dạng đồ thị trạng thái (`StateGraph`, `ToolNode`), cho phép lặp, rẽ nhánh có điều kiện và lưu giữ trạng thái hội thoại.
*   **LangChain (`langchain-core`, `langchain-community`)**: Cung cấp các cấu trúc trừu tượng cho AI: Prompt Templates, Message Types (`HumanMessage`, `AIMessage`), và cơ chế bind công cụ (`bind_tools`).
*   **Groq Cloud (`langchain-groq`)**: Tích hợp mô hình ngôn ngữ lớn (LLaMA) thông qua Groq API để suy luận với tốc độ cực nhanh và chi phí thấp.
*   **ChromaDB (`langchain-chroma`)**: Cơ sở dữ liệu Vector (Vector Database) lưu trữ các vector đại diện cho dữ liệu tài liệu kho hàng để truy vấn ngữ cảnh.
*   **Sentence-Transformers (`HuggingFaceEmbeddings`)**: Thư viện chạy cục bộ để tạo Vector Embeddings từ dữ liệu văn bản.
*   **PyTorch (`torch`) & Hugging Face Transformers**: Framework nền tảng chạy dưới các thư viện AI phục vụ tính toán tensor và tải cấu trúc mạng neural.
*   **PEFT (Parameter-Efficient Fine-Tuning)**: Thư viện quản lý LoRA Adapters phục vụ quá trình huấn luyện/tinh chỉnh mô hình AI cho nghiệp vụ WMS.
*   **Rank-BM25**: Thuật toán tìm kiếm văn bản dựa trên tần suất xuất hiện của từ khóa (Keyword-based search), làm thành phần đối trọng cho Vector Search.
*   **Model Context Protocol (MCP) SDK**: Giao thức mã nguồn mở chuẩn hóa việc kết nối các mô hình AI trực tiếp tới hệ thống dữ liệu doanh nghiệp thông qua Stdio và Server-Sent Events (SSE).

---

## 4. Cơ sở dữ liệu, Caching & Event Bus (Database & Messaging)
*   **PostgreSQL**: Cơ sở dữ liệu quan hệ chính lưu giữ thông tin hàng hóa, kho bãi, khách hàng và lịch sử kiểm toán.
*   **asyncpg**: Thư viện driver PostgreSQL bất đồng bộ hiệu năng cao chạy trong MCP Server để giảm thiểu tài nguyên chặn luồng.
*   **SQLAlchemy 2.0**: Thư viện ORM ánh xạ bảng dữ liệu quan hệ thành Object trong Python theo phong cách hiện đại.
*   **Alembic**: Công cụ quản lý và áp dụng các phiên bản di cư cơ sở dữ liệu (Database Migrations).
*   **SQLite & aiosqlite**: Database dạng file gọn nhẹ dùng cho việc chạy unit test nhanh cục bộ không cần Docker.
*   **Redis**: Cơ sở dữ liệu lưu trữ trên RAM dùng cho Caching, phân tán Lock và Event Bus.
*   **Redis Streams**: Cơ chế truyền tin phi tập trung dựa trên log để hiện thực hóa Event Bus, hỗ trợ phát lại sự kiện (Replay) và các nhóm người tiêu dùng (Consumer Groups).
*   **RabbitMQ (`aio-pika`)**: Hệ thống hàng đợi tin nhắn trung gian (Message Broker) dựa trên giao thức AMQP 0-9-1 hỗ trợ cơ chế tự động kết nối lại (`RobustConnection`/`RobustChannel`) và hàng đợi bền vững (Durable Queues).

---

## 5. Xác thực, Bảo mật & Tiện ích (Security & Utilities)
*   **JWT (JSON Web Tokens via `pyjwt`)**: Xác thực không trạng thái (stateless authentication) để cấp mã truy cập an toàn giữa client và microservices.
*   **bcrypt (`passlib[bcrypt]`)**: Thuật toán băm (hash) một chiều chuyên dụng để lưu mật khẩu người dùng an toàn.
*   **Pydantic V2**: Khai báo schema định dạng dữ liệu, tự động kiểm tra tính hợp lệ đầu vào/đầu ra (Data Validation) và quản lý cấu hình hệ thống (`pydantic-settings`).
*   **Faker**: Thư viện sinh ngẫu nhiên tên tuổi, địa chỉ, số điện thoại để thực hiện chèn dữ liệu mẫu (Database Seeding).
*   **BeautifulSoup4 (`bs4`)**: Parse và phân tích cấu trúc dữ liệu HTML từ các trang web phục vụ RAG.
*   **Pandas**: Xử lý dữ liệu dạng bảng lớn, thực hiện phân tích báo cáo kho hàng.
*   **SheetJS (`xlsx.min.js`)**: Thư viện Javascript chạy trực tiếp trên trình duyệt để đọc và ghi file Excel/CSV không cần máy chủ.

---

## 6. DevOps, Triển khai & Giám sát (Infrastructure & Observability)
*   **Docker & Docker Compose**: Đóng gói ứng dụng thành các container độc lập và điều phối cụm microservices cục bộ thông qua Docker Compose Profiles.
*   **Kubernetes**: Cung cấp các file cấu hình triển khai cụm (Deployment, Service, Ingress) cho môi trường production.
*   **Terraform (Infrastructure as Code - IaC)**: Tự động khởi tạo toàn bộ hạ tầng AWS gồm VPC, Subnets, EC2, RDS PostgreSQL, ElastiCache Redis, CloudWatch và SNS.
*   **Ansible**: Tự động hóa quá trình cấu hình server, triển khai code và thiết lập hệ thống sao lưu định kỳ lên AWS S3.
*   **Prometheus & Prometheus Alertmanager**: Thu thập các chỉ số vận hành (metrics) của hệ thống và kích hoạt cảnh báo qua email/chat khi phát hiện lỗi hoặc quá tải.
*   **OpenTelemetry (OTel)**: Framework thu thập dữ liệu giám sát phân tán (Distributed Tracing) giúp theo dõi một request đi qua những microservices nào và mất bao nhiêu thời gian.

---

## 7. Các Mẫu thiết kế & Kiến trúc tinh tế (Architectural & Design Patterns)

Học cú pháp chỉ giúp bạn viết code, nhưng học các mẫu thiết kế dưới đây sẽ giúp bạn xây dựng được hệ thống lớn, chịu tải cao và bền bỉ:

*   **Clean Architecture**: Phân tách mã nguồn thành 4 lớp rõ ràng: *Domain* (Nghiệp vụ cốt lõi), *Core/Use Cases* (Ứng dụng), *Application/Interfaces* (Cổng giao tiếp), và *Infrastructure* (Cơ sở dữ liệu, mạng). Xem ví dụ tại [SQLAlchemy Database configurations in app/shared/core/database.py](file:///home/avandall1999/Projects/WMS_Root/WMS_Core/Services/warehouse-service/src/app/shared/core/database.py).
*   **Domain-Driven Design (DDD)**: Thiết kế hệ thống xoay quanh nghiệp vụ thực tế với các khái niệm Bounded Context (Ranh giới ngữ cảnh), Aggregates (Cụm thực thể), Entities và Repositories.
*   **Circuit Breaker (Ngắt mạch)**: Triển khai trong API Gateway để tự động ngắt kết nối tới các gRPC service hạ nguồn khi chúng bị sập, tránh gây nghẽn và làm đổ vỡ toàn bộ Gateway. Xem chi tiết tại [Circuit Breaker in api_gateway/grpc_clients.py](file:///home/avandall1999/Projects/WMS_Root/WMS_Core/Services/api-gateway/src/api_gateway/grpc_clients.py#L38-L98).
*   **Retry with Exponential Backoff**: Cơ chế tự động thử lại khi gRPC bị lỗi mạng với thời gian chờ tăng dần theo lũy thừa cơ số 2 để tránh làm quá tải thêm cho hệ thống đang lỗi.
*   **Micro-batching (Gom cụm vi mô)**: Kỹ thuật gom các sự kiện đơn lẻ vào một hàng đợi `asyncio.Queue` trong một khoảng thời gian cực ngắn (ví dụ: 20 miligiây) rồi ghi hàng loạt (batch write) vào Redis Streams qua cơ chế socket pipeline để tăng Throughput (số lượng request xử lý thành công trên giây). Xem mã nguồn tại [IngestBuffer in api-gateway/ingest_buffer.py](file:///home/avandall1999/Projects/WMS_Root/WMS_Core/Services/api-gateway/src/api_gateway/ingest_buffer.py).
*   **Custom Socket RESP Parser**: Thay vì dùng thư viện Redis tiêu chuẩn, Gateway tự tạo kết nối TCP qua socket raw và parse giao thức RESP bằng Python để đạt hiệu năng tối ưu nhất. Xem chi tiết tại [AsyncRedisSocketPool in api-gateway/routes.py](file:///home/avandall1999/Projects/WMS_Root/WMS_Core/Services/api-gateway/src/api_gateway/routes.py#L58-L148).
*   **Idempotency Key**: Sử dụng UUIDv4 đi kèm mỗi request để máy chủ đối chiếu và ngăn chặn việc xử lý trùng lặp một yêu cầu (như quét mã vạch nhập kho 2 lần liên tục do lỗi cảm biến).
*   **Distributed Lock (Khóa phân tán)**: Sử dụng lệnh Redis `SET NX EX` để khóa tài nguyên và sử dụng **Lua Script** nguyên tử (atomic) nhằm đảm bảo chỉ có worker sở hữu khóa mới được phép mở khóa. Xem chi tiết tại [Redis Client Distributed Locking in app/clients/redis_client.py](file:///home/avandall1999/Projects/WMS_Root/WMS_MCP_Server/app/clients/redis_client.py#L150-L200).
*   **Slow Query Logging**: Lắng nghe sự kiện của SQLAlchemy (`before_cursor_execute` và `after_cursor_execute`) để tính thời gian chạy của SQL và tự động ghi log cảnh báo đối với các câu truy vấn chậm hơn 200 miligiây.
*   **Hybrid / Ensemble Retrieval (Truy xuất hỗn hợp)**: Kết hợp kết quả tìm kiếm ngữ nghĩa của Vector DB (ChromaDB) với tìm kiếm từ khóa truyền thống (BM25) theo các trọng số cấu hình trước nhằm tối ưu độ chính xác cho AI. Xem chi tiết tại [HybridRetriever in ai_engine/retrieval/hybrid_retriever.py](file:///home/avandall1999/Projects/WMS_Root/WMS_AI_Services/src/ai_engine/retrieval/hybrid_retriever.py).
*   **RAG Quality Control & Fallback Gate**: Dùng LLM làm giám khảo tự động chấm điểm độ liên quan của tài liệu truy xuất được, thực hiện chuyển đổi câu hỏi (Query Transformation) khi điểm kém, hoặc trả về kết quả dự phòng thân thiện (Fallback Response) thay vì thông báo lỗi hệ thống. Xem chi tiết tại [AdvancedRAGWorkflow in ai_engine/workflows/rag_workflow.py](file:///home/avandall1999/Projects/WMS_Root/WMS_AI_Services/src/ai_engine/workflows/rag_workflow.py).
*   **Role-Based Access Control (RBAC)**: Phân quyền người dùng dựa trên Roles và Permissions cụ thể.

---

## 8. Công cụ Kiểm thử & Định dạng Code (Testing & Quality Assurance)
*   **Pytest, pytest-asyncio, pytest-cov**: Viết và chạy unit test cho mã nguồn đồng bộ và bất đồng bộ, đồng thời xuất báo cáo tỷ lệ bao phủ dòng code (Test Coverage).
*   **Playwright (`@playwright/test`)**: Framework viết kiểm thử tự động trực tiếp trên trình duyệt (E2E testing) giả lập thao tác của người dùng click, nhập thông tin trên dashboard.
*   **Ruff**: Công cụ thực hiện kiểm tra lỗi cú pháp (Linter) và định dạng code (Formatter) cực nhanh viết bằng Rust.
*   **Black**: Công cụ định dạng code Python theo chuẩn PEP 8.
*   **Mypy**: Công cụ phân tích mã nguồn tĩnh để phát hiện các lỗi sai kiểu dữ liệu trước khi chạy chương trình.
