// Optimized animation worker with faster increments

let isRunning = true;
let time = 0;

// Start animation loop with smoother updates
function animate() {
  if (!isRunning) return;
  
  // Increment time value (larger step for more visible animation)
  time += 0.005; // Increased from 0.01 to 0.05
  
  // Send time value back to main thread
  self.postMessage({ time });
  
  // Schedule next update - making it faster too
  setTimeout(animate, 16); // Back to 60fps for more responsive animation
}

// Listen for commands from main thread
self.onmessage = function(e) {
  if (e.data.command === 'start') {
    console.log("[Worker] Animation started");
    isRunning = true;
    animate();
  } else if (e.data.command === 'stop') {
    console.log("[Worker] Animation stopped");
    isRunning = false;
  }
};

// Log on worker init
console.log("[Worker] Initialized");