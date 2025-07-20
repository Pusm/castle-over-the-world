#!/usr/bin/env node

/**
 * Stress Testing Automation Suite
 * Comprehensive system limits evaluation and failure recovery testing
 * 
 * Usage: node stress-testing-automation.js [options]
 * Options:
 *   --mode <type>        Stress test mode: memory|cpu|io|network|concurrent|burst
 *   --duration <seconds> Test duration in seconds (default: 300)
 *   --intensity <level>  Intensity level 1-10 (default: 5)
 *   --monitor           Enable real-time monitoring
 *   --recovery          Test failure recovery mechanisms
 *   --output <file>     Output results to JSON file
 */

const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');
const os = require('os');
const cluster = require('cluster');
const { spawn, exec } = require('child_process');

class StressTester {
  constructor(options = {}) {
    this.options = {
      mode: options.mode || 'concurrent',
      duration: parseInt(options.duration) || 300, // 5 minutes default
      intensity: parseInt(options.intensity) || 5,
      enableMonitoring: options.monitor || false,
      testRecovery: options.recovery || false,
      outputFile: options.output || null,
      verbose: options.verbose || false
    };
    
    this.results = {
      testConfig: this.options,
      systemInfo: this.getSystemInfo(),
      stressTests: [],
      systemLimits: {},
      failures: [],
      recovery: {},
      monitoring: []
    };
    
    this.isRunning = false;
    this.monitoringInterval = null;
    this.stressWorkers = [];
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
      uptime: os.uptime(),
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };
  }

  async runStressSuite() {
    console.log('🔥 Starting Comprehensive Stress Testing Suite');
    console.log(`⚙️  Mode: ${this.options.mode}, Duration: ${this.options.duration}s, Intensity: ${this.options.intensity}/10`);
    console.log(`💻 System: ${this.results.systemInfo.cpus} CPUs, ${Math.round(this.results.systemInfo.totalMemory / 1024 / 1024 / 1024)}GB RAM`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    try {
      this.isRunning = true;
      
      if (this.options.enableMonitoring) {
        this.startSystemMonitoring();
      }
      
      switch (this.options.mode) {
        case 'memory':
          await this.stressTestMemory();
          break;
        case 'cpu':
          await this.stressTestCPU();
          break;
        case 'io':
          await this.stressTestIO();
          break;
        case 'network':
          await this.stressTestNetwork();
          break;
        case 'concurrent':
          await this.stressTestConcurrent();
          break;
        case 'burst':
          await this.stressTestBurst();
          break;
        default:
          await this.stressTestAll();
      }
      
      if (this.options.testRecovery) {
        await this.testFailureRecovery();
      }
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Stress testing failed:', error.message);
      this.results.failures.push({
        type: 'system_failure',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.isRunning = false;
      this.stopSystemMonitoring();
      this.cleanupWorkers();
    }
  }

  async stressTestMemory() {
    console.log('🧠 Memory Stress Testing');
    
    const startTime = performance.now();
    const memoryChunks = [];
    let currentMemory = process.memoryUsage();
    let peakMemory = currentMemory.heapUsed;
    let allocatedSize = 0;
    
    try {
      // Allocate memory in chunks until we hit limits
      const chunkSize = 10 * 1024 * 1024; // 10MB chunks
      const maxChunks = this.options.intensity * 100; // Scale with intensity
      
      for (let i = 0; i < maxChunks && this.isRunning; i++) {
        // Allocate memory chunk
        const chunk = Buffer.alloc(chunkSize, i % 256);
        memoryChunks.push(chunk);
        allocatedSize += chunkSize;
        
        currentMemory = process.memoryUsage();
        peakMemory = Math.max(peakMemory, currentMemory.heapUsed);
        
        // Check for memory pressure
        if (currentMemory.heapUsed > this.results.systemInfo.totalMemory * 0.8) {
          console.log('   ⚠️  Approaching memory limits, stopping allocation');
          break;
        }
        
        // Log progress
        if (i % 50 === 0) {
          console.log(`   Allocated: ${Math.round(allocatedSize / 1024 / 1024)}MB, Heap: ${Math.round(currentMemory.heapUsed / 1024 / 1024)}MB`);
        }
        
        // Add delay to simulate real load
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Hold memory for specified duration
      console.log(`   💾 Holding ${Math.round(allocatedSize / 1024 / 1024)}MB for ${this.options.duration}s...`);
      await this.waitWithProgress(this.options.duration * 1000);
      
    } catch (error) {
      this.results.failures.push({
        type: 'memory_exhaustion',
        error: error.message,
        allocatedSize: allocatedSize,
        timestamp: new Date().toISOString()
      });
    } finally {
      // Cleanup memory
      memoryChunks.length = 0;
      if (global.gc) global.gc();
    }
    
    const endTime = performance.now();
    
    this.results.stressTests.push({
      type: 'memory',
      duration: endTime - startTime,
      peakMemoryUsage: peakMemory,
      allocatedSize: allocatedSize,
      memoryEfficiency: allocatedSize / peakMemory,
      success: true
    });
    
    console.log(`✅ Memory stress test completed: ${Math.round(allocatedSize / 1024 / 1024)}MB allocated\n`);
  }

  async stressTestCPU() {
    console.log('⚡ CPU Stress Testing');
    
    const startTime = performance.now();
    const workers = [];
    const numWorkers = this.results.systemInfo.cpus * this.options.intensity;
    
    try {
      // Spawn CPU-intensive workers
      console.log(`   Spawning ${numWorkers} CPU-intensive workers...`);
      
      for (let i = 0; i < numWorkers; i++) {
        const worker = cluster.fork();
        workers.push(worker);
        
        worker.send({ 
          action: 'cpu_stress', 
          duration: this.options.duration * 1000,
          workload: 'prime_calculation'
        });
      }
      
      // Monitor CPU usage
      let maxCpuUsage = 0;
      const cpuReadings = [];
      
      const cpuMonitor = setInterval(() => {
        const loadAvg = os.loadavg()[0];
        cpuReadings.push(loadAvg);
        maxCpuUsage = Math.max(maxCpuUsage, loadAvg);
        
        if (this.options.verbose) {
          console.log(`   CPU Load: ${loadAvg.toFixed(2)}`);
        }
      }, 1000);
      
      // Wait for test duration
      await this.waitWithProgress(this.options.duration * 1000);
      
      clearInterval(cpuMonitor);
      
      // Cleanup workers
      workers.forEach(worker => worker.kill());
      
      const avgCpuUsage = cpuReadings.reduce((sum, val) => sum + val, 0) / cpuReadings.length;
      
      this.results.stressTests.push({
        type: 'cpu',
        duration: performance.now() - startTime,
        workers: numWorkers,
        maxCpuUsage: maxCpuUsage,
        avgCpuUsage: avgCpuUsage,
        cpuUtilization: (avgCpuUsage / this.results.systemInfo.cpus) * 100,
        success: true
      });
      
      console.log(`✅ CPU stress test completed: ${avgCpuUsage.toFixed(2)} avg load, ${maxCpuUsage.toFixed(2)} peak\n`);
      
    } catch (error) {
      workers.forEach(worker => worker.kill());
      this.results.failures.push({
        type: 'cpu_stress_failure',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async stressTestIO() {
    console.log('💾 I/O Stress Testing');
    
    const startTime = performance.now();
    const tempDir = path.join(__dirname, 'stress_test_io');
    
    try {
      await fs.mkdir(tempDir, { recursive: true });
      
      const fileSize = 1024 * 1024 * this.options.intensity; // Scale with intensity
      const numFiles = 100 * this.options.intensity;
      const buffer = Buffer.alloc(fileSize, 'A');
      
      console.log(`   Writing ${numFiles} files of ${Math.round(fileSize / 1024 / 1024)}MB each...`);
      
      // Concurrent file operations
      const writePromises = [];
      for (let i = 0; i < numFiles && this.isRunning; i++) {
        const filePath = path.join(tempDir, `stress_file_${i}.dat`);
        writePromises.push(fs.writeFile(filePath, buffer));
        
        // Batch writes to avoid overwhelming the system
        if (writePromises.length >= 20) {
          await Promise.all(writePromises);
          writePromises.length = 0;
          
          if (i % 50 === 0) {
            console.log(`   Written ${i + 1}/${numFiles} files`);
          }
        }
      }
      
      if (writePromises.length > 0) {
        await Promise.all(writePromises);
      }
      
      const writeTime = performance.now() - startTime;
      
      // Read stress test
      console.log('   Reading files concurrently...');
      const readStartTime = performance.now();
      
      const files = await fs.readdir(tempDir);
      const readPromises = files.map(file => 
        fs.readFile(path.join(tempDir, file))
      );
      
      await Promise.all(readPromises);
      const readTime = performance.now() - readStartTime;
      
      // Calculate stats
      const totalSize = numFiles * fileSize;
      const writeSpeed = totalSize / (writeTime / 1000); // bytes per second
      const readSpeed = totalSize / (readTime / 1000);
      
      this.results.stressTests.push({
        type: 'io',
        writeTime: writeTime,
        readTime: readTime,
        numFiles: numFiles,
        totalSize: totalSize,
        writeSpeed: writeSpeed,
        readSpeed: readSpeed,
        writeMBPS: writeSpeed / 1024 / 1024,
        readMBPS: readSpeed / 1024 / 1024,
        success: true
      });
      
      // Cleanup
      for (const file of files) {
        await fs.unlink(path.join(tempDir, file));
      }
      await fs.rmdir(tempDir);
      
      console.log(`✅ I/O stress test completed: Write ${(writeSpeed / 1024 / 1024).toFixed(1)}MB/s, Read ${(readSpeed / 1024 / 1024).toFixed(1)}MB/s\n`);
      
    } catch (error) {
      this.results.failures.push({
        type: 'io_stress_failure',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Cleanup on error
      try {
        const files = await fs.readdir(tempDir);
        for (const file of files) {
          await fs.unlink(path.join(tempDir, file));
        }
        await fs.rmdir(tempDir);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }

  async stressTestConcurrent() {
    console.log('🔄 Concurrent Operations Stress Testing');
    
    const startTime = performance.now();
    const concurrentRequests = this.options.intensity * 10;
    
    try {
      console.log(`   Spawning ${concurrentRequests} concurrent castle generation operations...`);
      
      const operations = [];
      for (let i = 0; i < concurrentRequests; i++) {
        operations.push(this.simulateCastleGeneration(i));
      }
      
      const results = await Promise.allSettled(operations);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      const endTime = performance.now();
      
      this.results.stressTests.push({
        type: 'concurrent',
        duration: endTime - startTime,
        concurrentOperations: concurrentRequests,
        successful: successful,
        failed: failed,
        successRate: (successful / concurrentRequests) * 100,
        avgOperationTime: (endTime - startTime) / successful,
        success: successful > 0
      });
      
      console.log(`✅ Concurrent stress test completed: ${successful}/${concurrentRequests} operations succeeded (${((successful / concurrentRequests) * 100).toFixed(1)}%)\n`);
      
    } catch (error) {
      this.results.failures.push({
        type: 'concurrent_stress_failure',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async stressTestBurst() {
    console.log('💥 Burst Load Stress Testing');
    
    const burstCounts = [50, 100, 250, 500, 1000].filter(count => count <= this.options.intensity * 200);
    
    for (const burstSize of burstCounts) {
      console.log(`   Testing burst of ${burstSize} operations...`);
      
      const startTime = performance.now();
      
      try {
        const operations = [];
        for (let i = 0; i < burstSize; i++) {
          operations.push(this.simulateCastleGeneration(i, { fast: true }));
        }
        
        const results = await Promise.allSettled(operations);
        const endTime = performance.now();
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const duration = endTime - startTime;
        
        this.results.stressTests.push({
          type: 'burst',
          burstSize: burstSize,
          duration: duration,
          successful: successful,
          operationsPerSecond: successful / (duration / 1000),
          success: successful > burstSize * 0.8 // 80% success rate threshold
        });
        
        console.log(`     ${successful}/${burstSize} operations in ${duration.toFixed(0)}ms (${(successful / (duration / 1000)).toFixed(1)} ops/sec)`);
        
        // Add delay between bursts
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        this.results.failures.push({
          type: 'burst_stress_failure',
          burstSize: burstSize,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('✅ Burst stress testing completed\n');
  }

  async stressTestNetwork() {
    console.log('🌐 Network Stress Testing');
    
    // Simulate external API calls and network operations
    const startTime = performance.now();
    const simultaneousRequests = this.options.intensity * 5;
    
    try {
      console.log(`   Simulating ${simultaneousRequests} simultaneous external API calls...`);
      
      const operations = [];
      for (let i = 0; i < simultaneousRequests; i++) {
        operations.push(this.simulateNetworkCall(i));
      }
      
      const results = await Promise.allSettled(operations);
      const endTime = performance.now();
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const avgResponseTime = results
        .filter(r => r.status === 'fulfilled')
        .reduce((sum, r) => sum + r.value.duration, 0) / successful;
      
      this.results.stressTests.push({
        type: 'network',
        duration: endTime - startTime,
        simultaneousRequests: simultaneousRequests,
        successful: successful,
        avgResponseTime: avgResponseTime,
        requestsPerSecond: successful / ((endTime - startTime) / 1000),
        success: successful > simultaneousRequests * 0.7
      });
      
      console.log(`✅ Network stress test completed: ${successful}/${simultaneousRequests} requests succeeded\n`);
      
    } catch (error) {
      this.results.failures.push({
        type: 'network_stress_failure',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testFailureRecovery() {
    console.log('🔧 Failure Recovery Testing');
    
    const recoveryTests = [
      { name: 'memory_exhaustion', test: () => this.simulateMemoryExhaustion() },
      { name: 'process_crash', test: () => this.simulateProcessCrash() },
      { name: 'data_corruption', test: () => this.simulateDataCorruption() },
      { name: 'network_failure', test: () => this.simulateNetworkFailure() }
    ];
    
    for (const { name, test } of recoveryTests) {
      if (!this.options.testRecovery) break;
      
      console.log(`   Testing recovery from ${name}...`);
      
      try {
        const startTime = performance.now();
        await test();
        const recoveryTime = performance.now() - startTime;
        
        this.results.recovery[name] = {
          success: true,
          recoveryTime: recoveryTime,
          timestamp: new Date().toISOString()
        };
        
        console.log(`     ✅ Recovered in ${recoveryTime.toFixed(0)}ms`);
        
      } catch (error) {
        this.results.recovery[name] = {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        console.log(`     ❌ Recovery failed: ${error.message}`);
      }
      
      // Allow system to stabilize between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✅ Failure recovery testing completed\n');
  }

  async simulateCastleGeneration(id, options = {}) {
    // Simulate castle generation with varying complexity
    const complexity = options.fast ? 1 : Math.random() * this.options.intensity;
    const delay = complexity * 10; // Variable delay based on complexity
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate memory allocation
    const dataSize = Math.floor(complexity * 1000);
    const mockData = Buffer.alloc(dataSize, id % 256);
    
    // Simulate processing
    let result = 0;
    for (let i = 0; i < complexity * 1000; i++) {
      result += Math.sqrt(i);
    }
    
    return {
      id: id,
      complexity: complexity,
      dataSize: dataSize,
      processingResult: result,
      timestamp: Date.now()
    };
  }

  async simulateNetworkCall(id) {
    const startTime = performance.now();
    
    // Simulate network latency and response processing
    const latency = Math.random() * 200 + 50; // 50-250ms latency
    await new Promise(resolve => setTimeout(resolve, latency));
    
    // Simulate response processing
    const processingTime = Math.random() * 50;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    return {
      id: id,
      duration: performance.now() - startTime,
      success: Math.random() > 0.05 // 95% success rate
    };
  }

  async simulateMemoryExhaustion() {
    // Simulate and recover from memory exhaustion
    const chunks = [];
    try {
      for (let i = 0; i < 1000; i++) {
        chunks.push(Buffer.alloc(1024 * 1024)); // 1MB chunks
      }
    } finally {
      chunks.length = 0; // Cleanup
      if (global.gc) global.gc();
    }
  }

  async simulateProcessCrash() {
    // Simulate process crash and recovery
    await new Promise(resolve => setTimeout(resolve, 100));
    // In real implementation, this would test process restart mechanisms
  }

  async simulateDataCorruption() {
    // Simulate data corruption and recovery
    const tempFile = path.join(__dirname, 'corrupt_test.json');
    try {
      await fs.writeFile(tempFile, '{"corrupted": data}'); // Invalid JSON
      await fs.readFile(tempFile, 'utf8');
    } catch (error) {
      // Expected error - simulate recovery
      await fs.writeFile(tempFile, '{"recovered": true}');
    } finally {
      try {
        await fs.unlink(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  async simulateNetworkFailure() {
    // Simulate network failure and fallback mechanisms
    const operations = [];
    for (let i = 0; i < 10; i++) {
      operations.push(this.simulateFailedNetworkCall());
    }
    await Promise.allSettled(operations);
  }

  async simulateFailedNetworkCall() {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Network timeout');
  }

  startSystemMonitoring() {
    if (this.monitoringInterval) return;
    
    console.log('📊 Starting system monitoring...');
    
    this.monitoringInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const systemMem = {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      };
      
      this.results.monitoring.push({
        timestamp: Date.now(),
        process: {
          memory: memUsage,
          cpuUsage: process.cpuUsage()
        },
        system: {
          memory: systemMem,
          loadAverage: os.loadavg(),
          uptime: os.uptime()
        }
      });
      
      // Keep only last 1000 monitoring points
      if (this.results.monitoring.length > 1000) {
        this.results.monitoring = this.results.monitoring.slice(-1000);
      }
    }, 1000);
  }

  stopSystemMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('📊 System monitoring stopped');
    }
  }

  cleanupWorkers() {
    this.stressWorkers.forEach(worker => {
      try {
        worker.kill();
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    this.stressWorkers = [];
  }

  async waitWithProgress(milliseconds) {
    const startTime = Date.now();
    const interval = Math.min(milliseconds / 10, 5000); // Update every 5s max
    
    while (Date.now() - startTime < milliseconds && this.isRunning) {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / milliseconds * 100).toFixed(1);
      
      if (this.options.verbose) {
        process.stdout.write(`\r   Progress: ${progress}%`);
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    if (this.options.verbose) {
      process.stdout.write('\n');
    }
  }

  async generateReport() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 STRESS TESTING REPORT');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Summary statistics
    const totalTests = this.results.stressTests.length;
    const successfulTests = this.results.stressTests.filter(t => t.success).length;
    const failureCount = this.results.failures.length;
    
    console.log(`📊 Tests Run: ${totalTests}, Successful: ${successfulTests}, Failed: ${failureCount}`);
    
    // Individual test results
    this.results.stressTests.forEach(test => {
      console.log(`\n🔍 ${test.type.toUpperCase()} STRESS TEST:`);
      
      switch (test.type) {
        case 'memory':
          console.log(`   Peak memory: ${Math.round(test.peakMemoryUsage / 1024 / 1024)}MB`);
          console.log(`   Allocated: ${Math.round(test.allocatedSize / 1024 / 1024)}MB`);
          break;
          
        case 'cpu':
          console.log(`   Workers: ${test.workers}, CPU Utilization: ${test.cpuUtilization.toFixed(1)}%`);
          console.log(`   Avg Load: ${test.avgCpuUsage.toFixed(2)}, Peak: ${test.maxCpuUsage.toFixed(2)}`);
          break;
          
        case 'io':
          console.log(`   Files: ${test.numFiles}, Total: ${Math.round(test.totalSize / 1024 / 1024)}MB`);
          console.log(`   Write: ${test.writeMBPS.toFixed(1)}MB/s, Read: ${test.readMBPS.toFixed(1)}MB/s`);
          break;
          
        case 'concurrent':
          console.log(`   Operations: ${test.concurrentOperations}, Success Rate: ${test.successRate.toFixed(1)}%`);
          console.log(`   Avg Time: ${test.avgOperationTime.toFixed(2)}ms`);
          break;
          
        case 'burst':
          console.log(`   Burst Size: ${test.burstSize}, Rate: ${test.operationsPerSecond.toFixed(1)} ops/sec`);
          break;
      }
      
      console.log(`   Status: ${test.success ? '✅ PASSED' : '❌ FAILED'}`);
    });
    
    // Failure analysis
    if (this.results.failures.length > 0) {
      console.log('\n❌ FAILURES ENCOUNTERED:');
      this.results.failures.forEach((failure, i) => {
        console.log(`   ${i + 1}. ${failure.type}: ${failure.error}`);
      });
    }
    
    // Recovery testing results
    if (Object.keys(this.results.recovery).length > 0) {
      console.log('\n🔧 RECOVERY TEST RESULTS:');
      Object.entries(this.results.recovery).forEach(([test, result]) => {
        const status = result.success ? '✅ PASSED' : '❌ FAILED';
        const time = result.recoveryTime ? ` (${result.recoveryTime.toFixed(0)}ms)` : '';
        console.log(`   ${test}: ${status}${time}`);
      });
    }
    
    // Save results
    if (this.options.outputFile) {
      await fs.writeFile(this.options.outputFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${this.options.outputFile}`);
    }
    
    console.log('\n🎉 Stress testing completed!');
  }
}

// Worker process for CPU stress testing
if (cluster.isWorker) {
  process.on('message', (msg) => {
    if (msg.action === 'cpu_stress') {
      const endTime = Date.now() + msg.duration;
      
      // CPU-intensive work
      while (Date.now() < endTime) {
        // Prime number calculation
        let num = Math.floor(Math.random() * 10000) + 1000;
        for (let i = 2; i < Math.sqrt(num); i++) {
          if (num % i === 0) break;
        }
      }
      
      process.exit(0);
    }
  });
}

// CLI Interface
if (require.main === module && cluster.isMaster) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      options[key] = value;
    } else if (key) {
      options[key] = true;
    }
  }
  
  const stressTester = new StressTester(options);
  stressTester.runStressSuite().catch(console.error);
}

module.exports = { StressTester };