import asyncio
import httpx
import time
import random
import uuid

TARGET_URL = "http://localhost:8000/api/v1/inventory/ingest"  # api-gateway endpoint

async def send_sensor_data(client: httpx.AsyncClient, worker_id: int, sem: asyncio.Semaphore):
    """Giả lập 1 thiết bị quét mã/robot gửi event liên tục về hệ thống"""
    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "sku": f"SKU-AI-MODEL-{random.randint(100, 105)}",
        "quantity": random.randint(1, 10),
        "trace_id": f"trace-{uuid.uuid4().hex[:8]}"
    }
    
    async with sem:
        start_time = time.perf_counter()
        try:
            # Tăng timeout lên 10.0s để chịu được đỉnh tải khi gateway bận
            response = await client.post(TARGET_URL, json=payload, timeout=20.0)
            latency = time.perf_counter() - start_time
            return response.status_code, latency
        except Exception as e:
            # Trả về 500 nếu gặp lỗi kết nối hoặc timeout
            return 500, time.perf_counter() - start_time

async def start_traffic_simulator(total_requests: int, concurrency: int):
    print(f"🚀 Starting Traffic Simulator: Sending {total_requests} events with concurrency={concurrency}")
    
    # Sử dụng Semaphore để điều phối tải thực tế từ phía client, tránh nghẽn hàng đợi kết nối của httpx
    sem = asyncio.Semaphore(concurrency)
    limits = httpx.Limits(max_keepalive_connections=concurrency, max_connections=concurrency)
    
    async with httpx.AsyncClient(limits=limits) as client:
        tasks = [send_sensor_data(client, i, sem) for i in range(total_requests)]
        
        start_bench = time.perf_counter()
        results = await asyncio.gather(*tasks)
        total_time = time.perf_counter() - start_bench
        
        # Thống kê số liệu thực tế để đưa vào Portfolio
        status_codes = [r[0] for r in results]
        latencies = [r[1] for r in results]
        
        success_count = status_codes.count(202)  # 202 Accepted từ Async Pipeline
        error_count = len(status_codes) - success_count
        avg_latency = sum(latencies) / len(latencies)
        rps = total_requests / total_time
        
        print("\n📊 --- REAL BENCHMARK REPORT ---")
        print(f"Execution Time: {total_time:.2f} seconds")
        print(f"Throughput: {rps:.2f} Requests/Second (RPS)")
        print(f"Average Latency: {avg_latency * 1000:.2f} ms")
        print(f"Success Rate: {(success_count/total_requests)*100: .2f}% | Dropped: {error_count}")

if __name__ == "__main__":
    # Chạy trên môi trường WSL để lấy chỉ số thực tế cho hệ thống WMS của bạn
    asyncio.run(start_traffic_simulator(total_requests=10000, concurrency=3000))
