# ⚡ IoT Ingestion Platform: Smart Warehouse Benchmark Simulator

This is a high-performance, single-page developer portfolio designed to immediately demonstrate backend performance engineering concepts. It models a smart warehouse IoT telemetry system, reframing the core warehouse management context into a data ingestion pipeline handling writes from **50,000 barcode scanners and autonomous robots**.

The portfolio features a live interactive sandbox comparing traditional synchronous database writes against asynchronous message-queue buffering under extreme concurrency.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, Vanilla CSS, Canvas API (for 60FPS real-time graphs), inline SVG vectors (with CSS path keyframe animations).
- **Simulation Logic**: Vanilla JavaScript (decoupled simulation loops, latency computations, and autoscaling equations).
- **Backend Load Generator**: Python 3.12, `asyncio`, `httpx` (for physical server stress testing).
- **Hosting**: Handcrafted structure and pure styles, optimized for sub-second load times on serverless environments (GitHub Pages, Vercel).

---

## 🧭 Core Interactive Features

### 1. Ingestion Load Controller
An interactive range slider that adjusts ingress load from **1,000 to 100,000 requests/second** in real-time. Includes load presets simulating distinct operation scenarios:
- **Normal Operation** (1k req/s)
- **Megasale Spikes** (35k req/s)
- **System Stress Peak** (100k req/s)

### 2. Sync vs. Async Mode Comparison
A selector switch to toggle the pipeline architecture:
*   **Sync Mode (Direct-to-DB Write)**: Simulates blocking SQL inserts. Latency spikes parabolically up to **$5,000\text{ms}$** under load as the database connection pool chokes, causing **dropped events (up to 15% event loss)**.
*   **Async Mode (Redis Streams)**: Simulates non-blocking memory buffers. Latency remains flat ($< 150\text{µs}$) as events are enqueued instantly. Workers autoscale up to **10 background threads** to clear backlog queues, guaranteeing **zero event loss**.

### 3. Integrated Stress-Test Script
Includes the Python script `benchmark_stress_test.py` used to perform actual physical load testing against the `WMS_Core` API Gateway. Visitors can download and audit the script directly from the webpage.

---

## 📂 File Directory

- `index.html` — Layout structure, telemetry card layouts, inline animated SVG flowcharts, and technical copywriting.
- `styles.css` — Sleek cyberpunk styling system using HSL color variables, glowing border keyframes, responsive grid utilities, and glassmorphism.
- `script.js` — Core simulation loop calculating latency curves and queue depth buffering, and rendering line charts onto canvas.
- `benchmark_stress_test.py` — Python script using `asyncio` and `httpx` to stress-test real backend endpoints.

---

## 🚀 Running Locally

Serve the portfolio directory using any lightweight web server:

```bash
# Using Python
python3 -m http.server 8085 --directory portfolio/
```

Open your browser and navigate to `http://localhost:8085`.
