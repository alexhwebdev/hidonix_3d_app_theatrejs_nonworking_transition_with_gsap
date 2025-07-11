// A global animation ticker that runs independently of Theatre.js

class AnimationTicker {
  constructor() {
    this.subscribers = [];
    this.isRunning = false;
    this.time = 0;
    this.lastTimestamp = 0;
    this.tick = this.tick.bind(this);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTimestamp = performance.now();
      requestAnimationFrame(this.tick);
    }
  }

  tick(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    const deltaTime = (timestamp - this.lastTimestamp) * 0.001; // in seconds
    this.time += deltaTime;
    this.lastTimestamp = timestamp;
    
    // Call all subscribers
    this.subscribers.forEach(subscriber => {
      subscriber(this.time, deltaTime);
    });
    
    requestAnimationFrame(this.tick);
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
}

// Create singleton instance
export const globalTicker = new AnimationTicker();

// Start the ticker immediately
globalTicker.start();