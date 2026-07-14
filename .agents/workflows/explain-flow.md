---
name: explain-flow
description: Trace a business operation across API Gateway, microservices, gRPC interfaces, and Event Bus.
---

# System Business Flow Explainer

## Step 1: Tìm kiếm điểm bắt đầu (API Entry point)
1. Quét file `WMS_Core/Services/api-gateway` để tìm router nhận API.
2. Xác định cấu trúc Request/Response.

## Step 2: Tìm downstream gRPC calls
1. Xác định API Gateway gọi gRPC service nào.
2. Đọc file `.proto` tương ứng để giải thích gRPC Contract.

## Step 3: Tìm Event Publication (Nếu có)
1. Kiểm tra xem service xử lý có bắn Event gì lên Redis Stream (`wms.events`) không.
2. Tìm xem service nào đang Subscribe/Consume event đó (ví dụ audit-service hoặc inventory-service).

## Step 4: Vẽ Sơ đồ & Tổng hợp kiến thức
1. Vẽ sơ đồ Mermaid biểu diễn luồng đi của dữ liệu.
2. Giải thích 3 điểm cốt lõi về mặt kiến trúc hệ thống mà lập trình viên cần lưu ý đối với luồng nghiệp vụ này.
