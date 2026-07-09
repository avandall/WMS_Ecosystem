// GLOBAL VARIABLES & SIMULATION PARAMETERS
let isAsyncMode = true;        // Toggle state: Async vs Sync
let ingressRate = 10000;       // Ingress load (req/sec) controlled by slider
let currentQueueSize = 0;      // Number of buffered events
const maxQueueSize = 150000;   // Queue buffer limit
const workerCapacity = 10000;  // Event capacity per worker per second
let activeWorkers = 1;         // Number of scaled workers
let throughputRate = 10000;    // Processed events per second
let latencyVal = 110;          // Latency value
let latencyUnit = "µs";        // Latency unit (us or ms)
let totalDropped = 0;          // Total dropped events
let droppedRateThisTick = 0;   // Dropped events/sec in this tick

// Data streams for the chart
const maxDataPoints = 60;
const ingressHistory = Array(maxDataPoints).fill(10000);
const processHistory = Array(maxDataPoints).fill(10000);
const droppedHistory = Array(maxDataPoints).fill(0);

// DOM Elements
const loadSlider = document.getElementById('load-slider');
const currentLoadText = document.getElementById('current-load-text');
const statIngress = document.getElementById('stat-ingress');
const statQueue = document.getElementById('stat-queue');
const statWorkers = document.getElementById('stat-workers');
const statThroughput = document.getElementById('stat-throughput');
const statLatency = document.getElementById('stat-latency');
const statDropped = document.getElementById('stat-dropped');
const queueBarFill = document.getElementById('queue-bar-fill');
const queueIndicator = document.getElementById('queue-indicator');
const workerChipsContainer = document.getElementById('worker-chips');
const dashboardContainer = document.getElementById('dashboard-container');
const mainControlCard = document.getElementById('main-control-card');
const latencyIndicator = document.getElementById('latency-indicator');
const legendDroppedItem = document.getElementById('legend-dropped-item');

// Card elements to mute in Sync mode
const cardQueueDepth = document.getElementById('card-queue-depth');
const cardActiveWorkers = document.getElementById('card-active-workers');
const cardDroppedEvents = document.getElementById('card-dropped-events');
const droppedBadge = document.getElementById('dropped-badge');
const droppedDesc = document.getElementById('dropped-desc');

// Canvas context
const canvas = document.getElementById('liveChart');
const ctx = canvas.getContext('2d');

// SVG Elements for Ingestion Flow Animation
const svgLoadText = document.getElementById('svg-load-text');
const svgQueueDepthText = document.getElementById('svg-queue-depth');
const svgGatewayModeText = document.getElementById('svg-gateway-mode');
const particleIngest = document.getElementById('particle-ingest');
const particleQueue = document.getElementById('particle-queue');
const svgQueueNode = document.getElementById('svg-queue-node');
const workerNode1 = document.getElementById('svg-worker-node1');
const workerNode2 = document.getElementById('svg-worker-node2');
const workerNode3 = document.getElementById('svg-worker-node3');

// INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Slider listener
    loadSlider.addEventListener('input', (e) => {
        updateLoad(parseInt(e.target.value));
        // Clear active classes on presets since user dragged manual
        document.querySelectorAll('.presets-container .btn').forEach(btn => btn.classList.remove('active'));
    });

    // Start simulation ticks
    setInterval(simulationTick, 50); // 20 times per second
    setInterval(updateChartData, 200); // 5 times per second
    
    // Start chart drawing loop
    requestAnimationFrame(drawChart);
});

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.style.width = '100%';
}

// TOGGLE SYNC VS ASYNC
function toggleMode(asyncMode) {
    isAsyncMode = asyncMode;
    
    const btnAsync = document.getElementById('btn-mode-async');
    const btnSync = document.getElementById('btn-mode-sync');
    
    if (asyncMode) {
        btnAsync.classList.add('active');
        btnSync.classList.remove('active');
        
        // Restore opacity on cards
        cardQueueDepth.style.opacity = '1';
        cardActiveWorkers.style.opacity = '1';
        
        // Restore SVG Elements
        svgQueueNode.style.opacity = '1';
        svgGatewayModeText.textContent = 'Async Mode';
        svgGatewayModeText.setAttribute('fill', '#a855f7');
        
        // Reset Dropped
        totalDropped = 0;
        droppedRateThisTick = 0;
        legendDroppedItem.style.display = 'none';
        
        // Reset card color
        cardDroppedEvents.className = 'stat-card highlight-emerald';
        droppedBadge.className = 'badge badge-success';
        droppedBadge.textContent = '100% Reliable';
        droppedDesc.textContent = 'Absorbed by durable streams backpressure';
        mainControlCard.classList.remove('card-error-state');
    } else {
        btnSync.classList.add('active');
        btnAsync.classList.remove('active');
        
        // Mute irrelevant stats in Sync mode
        cardQueueDepth.style.opacity = '0.35';
        cardActiveWorkers.style.opacity = '0.35';
        
        // Update SVG Elements to show sync connection bypasses queue
        svgQueueNode.style.opacity = '0.15';
        svgGatewayModeText.textContent = 'Sync Mode';
        svgGatewayModeText.setAttribute('fill', '#ef4444');
        svgQueueDepthText.textContent = 'N/A (Bypassed)';
        
        // Enable Dropped in chart legend
        legendDroppedItem.style.display = 'flex';
        currentQueueSize = 0;
    }
}

// UPDATE FUNCTIONS
function updateLoad(val) {
    ingressRate = val;
    loadSlider.value = val;
    currentLoadText.textContent = formatNumber(val);
    svgLoadText.textContent = formatNumber(val) + ' req/s';
    
    // Update path 1 particle speed
    const duration = Math.max(0.1, 1.5 - (val / 100000) * 1.4);
    particleIngest.style.animationDuration = `${duration}s`;
}

function setPreset(val, element) {
    updateLoad(val);
    document.querySelectorAll('.presets-container .btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// HELPER FOR NUMBER FORMATTING
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// MAIN SIMULATION LOOP (RUNS AT 20Hz / 50ms)
function simulationTick() {
    const delta = 0.05; // 50ms in seconds
    
    if (isAsyncMode) {
        // --- ASYNC PIPELINE SIMULATION ---
        droppedRateThisTick = 0;
        
        // 1. Add ingress traffic to the Queue
        const incomingEvents = ingressRate * delta;
        currentQueueSize += incomingEvents;
        
        // 2. Worker Scaling Logic
        let targetWorkers = 1;
        if (currentQueueSize > 5000) targetWorkers = 2;
        if (currentQueueSize > 15000) targetWorkers = 3;
        if (currentQueueSize > 35000) targetWorkers = 5;
        if (currentQueueSize > 65000) targetWorkers = 8;
        if (currentQueueSize > 100000) targetWorkers = 10;
        
        const minWorkersRequired = Math.ceil(ingressRate / workerCapacity);
        if (targetWorkers < minWorkersRequired) {
            targetWorkers = minWorkersRequired;
        }
        
        // Autoscale
        if (targetWorkers > activeWorkers) {
            activeWorkers = targetWorkers;
        } else if (targetWorkers < activeWorkers) {
            if (Math.random() < 0.1) activeWorkers--;
        }
        activeWorkers = Math.max(1, Math.min(10, activeWorkers));
        
        // 3. Process events
        const processingCapacity = activeWorkers * workerCapacity * delta;
        const processedEvents = Math.min(currentQueueSize, processingCapacity);
        currentQueueSize -= processedEvents;

        if (currentQueueSize < 0) currentQueueSize = 0;
        if (currentQueueSize > maxQueueSize) currentQueueSize = maxQueueSize;
        
        throughputRate = Math.round(processedEvents / delta);
        
        // Queue Delay calculation (90us + queuing latency)
        const queueDelay = (currentQueueSize / 1000) * 0.8;
        latencyVal = Math.round(90 + queueDelay + Math.random() * 8);
        latencyUnit = "µs";
        latencyIndicator.className = "stat-indicator pulse-yellow";
        
        // Update Queue progress UI
        const queueRatio = (currentQueueSize / maxQueueSize) * 100;
        queueBarFill.style.width = `${queueRatio}%`;
        if (queueRatio < 15) {
            queueIndicator.className = 'stat-indicator pulse-emerald';
            queueBarFill.style.backgroundColor = 'var(--color-emerald)';
        } else if (queueRatio < 55) {
            queueIndicator.className = 'stat-indicator pulse-yellow';
            queueBarFill.style.backgroundColor = 'var(--color-yellow)';
        } else {
            queueIndicator.className = 'stat-indicator pulse-red';
            queueBarFill.style.backgroundColor = 'var(--color-red)';
        }
        
        svgQueueDepthText.textContent = `${formatNumber(Math.round(currentQueueSize))} buffered`;
        
        // Update particle queue display
        if (currentQueueSize > 100) {
            const queueDuration = Math.max(0.1, 1.2 - (throughputRate / 100000) * 1.1);
            particleQueue.style.display = 'block';
            particleQueue.style.animationDuration = `${queueDuration}s`;
        } else {
            particleQueue.style.display = 'none';
        }
        
        // Dynamic worker UI chip updating
        updateWorkerChips();
        updateSvgWorkerNodes();

    } else {
        // --- SYNC PIPELINE SIMULATION ---
        currentQueueSize = 0;
        activeWorkers = 1;
        particleQueue.style.display = 'none';
        
        // Database connection pool bottlenecks around 15,000 requests/sec max
        const dbWriteCapacity = 15000;
        
        if (ingressRate <= dbWriteCapacity) {
            // Processing keeps up with incoming load
            throughputRate = ingressRate;
            droppedRateThisTick = 0;
            
            // Base sync write latency in milliseconds
            latencyVal = Math.round(12 + (ingressRate / dbWriteCapacity) * 38 + Math.random() * 5);
            latencyUnit = "ms";
            latencyIndicator.className = "stat-indicator pulse-yellow";
            
            // Maintain UI states
            cardDroppedEvents.className = 'stat-card highlight-emerald';
            droppedBadge.className = 'badge badge-success';
            droppedBadge.textContent = 'Healthy Ingestion';
            droppedDesc.textContent = 'Database processing under load limit';
            statDropped.className = 'stat-value text-emerald';
            mainControlCard.classList.remove('card-error-state');
        } else {
            // Database is throttled. Throughput caps, latency rises, and events drop!
            throughputRate = dbWriteCapacity + Math.round(Math.random() * 500 - 250);
            droppedRateThisTick = ingressRate - throughputRate;
            totalDropped += droppedRateThisTick * delta;
            
            // Parabolic latency spike representing thread pool locks (Gateway timeouts)
            // (e.g. 50ms base + (excess rate / 20k)^2 * 1000ms)
            const excessRate = ingressRate - dbWriteCapacity;
            latencyVal = Math.min(5000, Math.round(50 + Math.pow(excessRate / 18000, 2) * 800 + Math.random() * 150));
            latencyUnit = "ms";
            latencyIndicator.className = "stat-indicator pulse-red";
            
            // Alert warning states
            cardDroppedEvents.className = 'stat-card highlight-red';
            droppedBadge.className = 'badge badge-danger';
            droppedBadge.textContent = 'Event Loss Alert';
            droppedDesc.textContent = 'DB pool timeout. Gateway timed out (504).';
            statDropped.className = 'stat-value text-red';
            mainControlCard.classList.add('card-error-state');
        }
        
        // Reset worker UI
        workerChipsContainer.innerHTML = `<span class="worker-chip active" style="border-color: var(--color-red); color: var(--color-red); background: rgba(239,68,68,0.08);">Sync Thread</span>`;
        
        // Reset SVG Node opacity
        workerNode1.style.opacity = '1';
        workerNode1.querySelector('.worker-node-rect').style.stroke = 'var(--color-red)';
        workerNode1.querySelector('.worker-node-rect').style.fill = 'rgba(239, 68, 68, 0.08)';
        workerNode2.style.opacity = '0.05';
        workerNode3.style.opacity = '0.05';
    }

    // Common Telemetry UI updates
    statIngress.innerHTML = `${formatNumber(ingressRate)} <span class="stat-unit">/s</span>`;
    statThroughput.innerHTML = `${formatNumber(throughputRate)} <span class="stat-unit">/s</span>`;
    statLatency.innerHTML = `${latencyVal} <span class="stat-unit">${latencyUnit}</span>`;
    
    if (isAsyncMode) {
        statDropped.innerHTML = `0 <span class="stat-unit">events (0.00%)</span>`;
    } else {
        const dropPercent = (droppedRateThisTick / ingressRate) * 100;
        statDropped.innerHTML = `${formatNumber(Math.round(totalDropped))} <span class="stat-unit">events (${dropPercent.toFixed(1)}%)</span>`;
    }
}

function updateWorkerChips() {
    let html = '';
    for (let i = 1; i <= 10; i++) {
        const activeClass = i <= activeWorkers ? 'active' : '';
        html += `<span class="worker-chip ${activeClass}">W${i}</span>`;
    }
    workerChipsContainer.innerHTML = html;
}

function updateSvgWorkerNodes() {
    if (activeWorkers >= 1) {
        workerNode1.style.opacity = '1';
        workerNode1.querySelector('.worker-node-rect').style.stroke = 'var(--color-emerald)';
        workerNode1.querySelector('.worker-node-rect').style.fill = 'rgba(16, 185, 129, 0.1)';
    } else {
        workerNode1.style.opacity = '0.3';
    }

    if (activeWorkers >= 2) {
        workerNode2.style.opacity = '1';
        workerNode2.querySelector('.worker-node-rect').style.stroke = 'var(--color-purple)';
        workerNode2.querySelector('.worker-node-rect').style.fill = 'rgba(139, 92, 246, 0.1)';
    } else {
        workerNode2.style.opacity = '0.3';
        workerNode2.querySelector('.worker-node-rect').style.stroke = '#6b7280';
        workerNode2.querySelector('.worker-node-rect').style.fill = 'rgba(30, 41, 59, 0.8)';
    }

    if (activeWorkers >= 4) {
        workerNode3.style.opacity = '1';
        workerNode3.querySelector('.worker-node-rect').style.stroke = 'var(--color-pink)';
        workerNode3.querySelector('.worker-node-rect').style.fill = 'rgba(217, 70, 239, 0.1)';
        workerNode3.querySelector('text').textContent = `W3 - W${activeWorkers}`;
    } else {
        workerNode3.style.opacity = '0.3';
        workerNode3.querySelector('.worker-node-rect').style.stroke = '#6b7280';
        workerNode3.querySelector('.worker-node-rect').style.fill = 'rgba(30, 41, 59, 0.8)';
        workerNode3.querySelector('text').textContent = 'Worker 3';
    }
}

// LOG CHART HISTORIC DATA (RUNS AT 5Hz / 200ms)
function updateChartData() {
    ingressHistory.push(ingressRate);
    ingressHistory.shift();
    
    processHistory.push(throughputRate);
    processHistory.shift();
    
    droppedHistory.push(droppedRateThisTick);
    droppedHistory.shift();
}

// CHART ANIMATION RENDER (RUNS AT 60FPS via requestAnimationFrame)
function drawChart() {
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridRows = 4;
    const gridCols = 10;
    
    // Horizontal lines
    for (let i = 1; i < gridRows; i++) {
        const y = (height / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    // Vertical lines
    for (let i = 1; i < gridCols; i++) {
        const x = (width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Draw Line 1 (Ingress - Cyan)
    drawLine(ingressHistory, 'rgba(6, 182, 212, 0.85)', 'rgba(6, 182, 212, 0.03)', 3);
    
    // Draw Line 2 (Processing - Purple/Emerald)
    const procColor = isAsyncMode ? 'rgba(139, 92, 246, 0.85)' : 'rgba(16, 185, 129, 0.85)';
    const procFill = isAsyncMode ? 'rgba(139, 92, 246, 0.03)' : 'rgba(16, 185, 129, 0.02)';
    drawLine(processHistory, procColor, procFill, 3);
    
    // Draw Line 3 (Dropped - Red) only in Sync Mode
    if (!isAsyncMode) {
        drawLine(droppedHistory, 'rgba(239, 68, 68, 0.85)', 'rgba(239, 68, 68, 0.08)', 2.5);
    }
    
    requestAnimationFrame(drawChart);
}

function drawLine(data, strokeStyle, fillStyle, lineWidth) {
    const width = canvas.width;
    const height = canvas.height;
    const maxVal = 110000;
    
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = (width / (data.length - 1)) * i;
        const valRatio = data[i] / maxVal;
        const y = height - (valRatio * (height - 30)) - 10;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = fillStyle;
    ctx.fill();
}

// CONTACT FORM SUBMISSION
function handleFormSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('form-submit-btn');
    const successAlert = document.getElementById('form-success-alert');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Message...';
    
    setTimeout(() => {
        submitBtn.textContent = 'Message Sent!';
        successAlert.className = 'alert-success';
        
        document.getElementById('contact-form').reset();
        
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
            successAlert.className = 'alert-success style-hidden';
        }, 3000);
    }, 1200);
}
