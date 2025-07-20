#!/usr/bin/env node

/**
 * Performance Benchmarking Suite for 100+ Castle Generation
 * Tests unlimited scalability architecture beyond current 60-castle limitation
 * 
 * Usage: node performance-benchmark-100plus.js [options]
 * Options:
 *   --castles <number>    Number of castles to generate (default: 100)
 *   --iterations <number> Number of test iterations (default: 5)
 *   --parallel <number>   Parallel workers (default: 4)
 *   --memory             Enable memory profiling
 *   --output <file>      Output results to JSON file
 */

const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');
const os = require('os');
const cluster = require('cluster');

class ScalabilityBenchmark {
  constructor(options = {}) {
    this.options = {
      castles: parseInt(options.castles) || 100,
      iterations: parseInt(options.iterations) || 5,
      parallel: parseInt(options.parallel) || 4,
      enableMemoryProfiling: options.memory || false,
      outputFile: options.output || null,
      verbose: options.verbose || false
    };
    
    this.results = {
      systemInfo: this.getSystemInfo(),
      testConfig: this.options,
      benchmarks: [],
      summary: {}
    };
    
    this.mockCastleGenerator = new MockCastleGenerator();
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
      freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };
  }

  async runBenchmarkSuite() {
    console.log('🚀 Starting Unlimited Scalability Benchmarks');
    console.log(`📊 Target: ${this.options.castles} castles, ${this.options.iterations} iterations`);
    console.log(`💻 System: ${this.results.systemInfo.cpus} CPUs, ${this.results.systemInfo.totalMemory}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    try {
      // Benchmark 1: Single-threaded generation
      await this.benchmarkSingleThreaded();
      
      // Benchmark 2: Multi-threaded generation  
      await this.benchmarkMultiThreaded();
      
      // Benchmark 3: Memory usage profiling
      if (this.options.enableMemoryProfiling) {
        await this.benchmarkMemoryUsage();
      }
      
      // Benchmark 4: Batch size optimization
      await this.benchmarkBatchSizes();
      
      // Benchmark 5: I/O performance
      await this.benchmarkFileOperations();
      
      // Benchmark 6: Scalability limits
      await this.benchmarkScalabilityLimits();
      
      // Generate summary
      this.generateSummary();
      
      // Output results
      await this.outputResults();
      
    } catch (error) {
      console.error('❌ Benchmark failed:', error.message);
      throw error;
    }
  }

  async benchmarkSingleThreaded() {
    console.log('📈 Benchmark 1: Single-threaded Generation');
    
    const results = [];
    
    for (let i = 0; i < this.options.iterations; i++) {
      const startTime = performance.now();
      const startMemory = process.memoryUsage();
      
      // Generate castles sequentially
      const castles = await this.mockCastleGenerator.generateCastles(this.options.castles);
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      const result = {
        iteration: i + 1,
        castlesGenerated: castles.length,
        duration: endTime - startTime,
        castlesPerSecond: castles.length / ((endTime - startTime) / 1000),
        memoryDelta: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        }
      };
      
      results.push(result);
      console.log(`   Iteration ${i + 1}: ${result.castlesGenerated} castles in ${result.duration.toFixed(2)}ms (${result.castlesPerSecond.toFixed(1)} castles/sec)`);
    }
    
    this.results.benchmarks.push({
      name: 'single_threaded',
      description: 'Sequential castle generation performance',
      results: results,
      average: this.calculateAverages(results)
    });
    
    console.log(`✅ Average: ${this.calculateAverages(results).castlesPerSecond.toFixed(1)} castles/sec\n`);
  }

  async benchmarkMultiThreaded() {
    console.log('🔄 Benchmark 2: Multi-threaded Generation');
    
    if (cluster.isMaster) {
      const results = [];
      
      for (let i = 0; i < this.options.iterations; i++) {
        const startTime = performance.now();
        
        // Distribute work across workers
        const workersNeeded = Math.min(this.options.parallel, this.options.castles);
        const castlesPerWorker = Math.ceil(this.options.castles / workersNeeded);
        
        const workers = [];
        let completedWorkers = 0;
        let totalCastles = 0;
        
        const workerPromise = new Promise((resolve) => {
          for (let w = 0; w < workersNeeded; w++) {
            const worker = cluster.fork();
            workers.push(worker);
            
            worker.send({ 
              action: 'generate', 
              castles: Math.min(castlesPerWorker, this.options.castles - (w * castlesPerWorker))
            });
            
            worker.on('message', (msg) => {
              if (msg.action === 'complete') {
                totalCastles += msg.castlesGenerated;
                completedWorkers++;
                
                if (completedWorkers === workersNeeded) {
                  workers.forEach(w => w.kill());
                  resolve();
                }
              }
            });
          }
        });
        
        await workerPromise;
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const result = {
          iteration: i + 1,
          castlesGenerated: totalCastles,
          workers: workersNeeded,
          duration: duration,
          castlesPerSecond: totalCastles / (duration / 1000),
          parallelEfficiency: (totalCastles / duration) / (this.results.benchmarks[0]?.average?.castlesPerSecond || 1)
        };
        
        results.push(result);
        console.log(`   Iteration ${i + 1}: ${result.castlesGenerated} castles with ${result.workers} workers in ${result.duration.toFixed(2)}ms (${result.castlesPerSecond.toFixed(1)} castles/sec)`);
      }
      
      this.results.benchmarks.push({
        name: 'multi_threaded',
        description: 'Parallel castle generation performance',
        results: results,
        average: this.calculateAverages(results)
      });
      
      console.log(`✅ Average: ${this.calculateAverages(results).castlesPerSecond.toFixed(1)} castles/sec\n`);
      
    } else {
      // Worker process
      process.on('message', async (msg) => {
        if (msg.action === 'generate') {
          const castles = await this.mockCastleGenerator.generateCastles(msg.castles);
          process.send({ 
            action: 'complete', 
            castlesGenerated: castles.length 
          });
        }
      });
    }
  }

  async benchmarkMemoryUsage() {
    console.log('🧠 Benchmark 3: Memory Usage Profiling');
    
    const memorySnapshots = [];
    const castleCounts = [10, 25, 50, 100, 250, 500, 1000];
    
    for (const count of castleCounts) {
      if (count > this.options.castles) continue;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const startMemory = process.memoryUsage();
      
      const startTime = performance.now();
      const castles = await this.mockCastleGenerator.generateCastles(count);
      const duration = performance.now() - startTime;
      
      const endMemory = process.memoryUsage();
      
      const snapshot = {
        castleCount: count,
        duration: duration,
        memoryUsage: {
          rss: endMemory.rss,
          heapUsed: endMemory.heapUsed,
          heapTotal: endMemory.heapTotal,
          external: endMemory.external
        },
        memoryDelta: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed
        },
        memoryPerCastle: {
          rss: (endMemory.rss - startMemory.rss) / count,
          heapUsed: (endMemory.heapUsed - startMemory.heapUsed) / count
        }
      };
      
      memorySnapshots.push(snapshot);
      console.log(`   ${count} castles: ${(snapshot.memoryPerCastle.heapUsed / 1024).toFixed(1)}KB per castle, ${(snapshot.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB total`);
    }
    
    this.results.benchmarks.push({
      name: 'memory_profiling',
      description: 'Memory usage scaling analysis',
      results: memorySnapshots
    });
    
    console.log('✅ Memory profiling complete\n');
  }

  async benchmarkBatchSizes() {
    console.log('📦 Benchmark 4: Batch Size Optimization');
    
    const batchSizes = [1, 5, 10, 25, 50, 100];
    const results = [];
    
    for (const batchSize of batchSizes) {
      const iterations = Math.min(3, this.options.iterations);
      const batchResults = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const batches = Math.ceil(this.options.castles / batchSize);
        let totalGenerated = 0;
        
        for (let batch = 0; batch < batches; batch++) {
          const castlesToGenerate = Math.min(batchSize, this.options.castles - totalGenerated);
          const castles = await this.mockCastleGenerator.generateCastles(castlesToGenerate);
          totalGenerated += castles.length;
          
          if (totalGenerated >= this.options.castles) break;
        }
        
        const duration = performance.now() - startTime;
        batchResults.push({
          duration: duration,
          castlesPerSecond: totalGenerated / (duration / 1000)
        });
      }
      
      const avgResult = this.calculateAverages(batchResults);
      results.push({
        batchSize: batchSize,
        averageDuration: avgResult.duration,
        averageCastlesPerSecond: avgResult.castlesPerSecond
      });
      
      console.log(`   Batch size ${batchSize}: ${avgResult.castlesPerSecond.toFixed(1)} castles/sec`);
    }
    
    // Find optimal batch size
    const optimal = results.reduce((best, current) => 
      current.averageCastlesPerSecond > best.averageCastlesPerSecond ? current : best
    );
    
    this.results.benchmarks.push({
      name: 'batch_optimization',
      description: 'Optimal batch size analysis',
      results: results,
      optimal: optimal
    });
    
    console.log(`✅ Optimal batch size: ${optimal.batchSize} (${optimal.averageCastlesPerSecond.toFixed(1)} castles/sec)\n`);
  }

  async benchmarkFileOperations() {
    console.log('💾 Benchmark 5: File I/O Performance');
    
    const startTime = performance.now();
    
    // Generate HTML files for castles
    const castles = await this.mockCastleGenerator.generateCastles(Math.min(100, this.options.castles));
    const generationTime = performance.now() - startTime;
    
    const fileStartTime = performance.now();
    const tempDir = path.join(__dirname, 'temp_benchmark');
    
    try {
      await fs.mkdir(tempDir, { recursive: true });
      
      // Write HTML files
      const writePromises = castles.map(async (castle, index) => {
        const htmlContent = this.generateMockHTML(castle);
        const filePath = path.join(tempDir, `${castle.id}.html`);
        await fs.writeFile(filePath, htmlContent);
        return filePath;
      });
      
      const filePaths = await Promise.all(writePromises);
      const writeTime = performance.now() - fileStartTime;
      
      // Read files back
      const readStartTime = performance.now();
      const readPromises = filePaths.map(filePath => fs.readFile(filePath, 'utf8'));
      await Promise.all(readPromises);
      const readTime = performance.now() - readStartTime;
      
      // Calculate file sizes
      const stats = await Promise.all(filePaths.map(fp => fs.stat(fp)));
      const totalSize = stats.reduce((sum, stat) => sum + stat.size, 0);
      
      // Cleanup
      await Promise.all(filePaths.map(fp => fs.unlink(fp)));
      await fs.rmdir(tempDir);
      
      const ioResult = {
        castleCount: castles.length,
        generationTime: generationTime,
        writeTime: writeTime,
        readTime: readTime,
        totalSize: totalSize,
        averageFileSize: totalSize / castles.length,
        filesPerSecondWrite: castles.length / (writeTime / 1000),
        filesPerSecondRead: castles.length / (readTime / 1000),
        mbPerSecondWrite: (totalSize / 1024 / 1024) / (writeTime / 1000)
      };
      
      this.results.benchmarks.push({
        name: 'file_operations',
        description: 'File I/O performance analysis',
        results: ioResult
      });
      
      console.log(`   Generated: ${castles.length} files in ${writeTime.toFixed(2)}ms`);
      console.log(`   Write speed: ${ioResult.filesPerSecondWrite.toFixed(1)} files/sec, ${ioResult.mbPerSecondWrite.toFixed(1)} MB/sec`);
      console.log(`   Read speed: ${ioResult.filesPerSecondRead.toFixed(1)} files/sec`);
      console.log(`   Average file size: ${(ioResult.averageFileSize / 1024).toFixed(1)}KB`);
      
    } catch (error) {
      console.log(`   ❌ File I/O benchmark failed: ${error.message}`);
    }
    
    console.log('✅ File I/O benchmark complete\n');
  }

  async benchmarkScalabilityLimits() {
    console.log('🔬 Benchmark 6: Scalability Limits Analysis');
    
    const testSizes = [100, 250, 500, 1000, 2500, 5000];
    const results = [];
    
    for (const size of testSizes) {
      if (size > this.options.castles * 10) break; // Don't test beyond 10x target
      
      try {
        console.log(`   Testing ${size} castles...`);
        
        const startTime = performance.now();
        const startMemory = process.memoryUsage();
        
        // Test generation
        const castles = await this.mockCastleGenerator.generateCastles(size);
        
        const endTime = performance.now();
        const endMemory = process.memoryUsage();
        
        const result = {
          castleCount: size,
          duration: endTime - startTime,
          castlesPerSecond: size / ((endTime - startTime) / 1000),
          memoryUsed: endMemory.heapUsed - startMemory.heapUsed,
          memoryPerCastle: (endMemory.heapUsed - startMemory.heapUsed) / size,
          success: true
        };
        
        results.push(result);
        console.log(`     Success: ${size} castles in ${result.duration.toFixed(0)}ms (${result.castlesPerSecond.toFixed(1)} castles/sec)`);
        
        // Check for performance degradation
        if (results.length > 1) {
          const prevResult = results[results.length - 2];
          const performanceRatio = result.castlesPerSecond / prevResult.castlesPerSecond;
          
          if (performanceRatio < 0.5) {
            console.log(`     ⚠️  Significant performance degradation detected (${(performanceRatio * 100).toFixed(1)}% of previous)`);
          }
        }
        
      } catch (error) {
        console.log(`     ❌ Failed at ${size} castles: ${error.message}`);
        results.push({
          castleCount: size,
          success: false,
          error: error.message
        });
        break; // Stop testing larger sizes
      }
    }
    
    this.results.benchmarks.push({
      name: 'scalability_limits',
      description: 'System scalability limits analysis',
      results: results
    });
    
    console.log('✅ Scalability limits analysis complete\n');
  }

  calculateAverages(results) {
    const numeric = results.filter(r => typeof r.duration === 'number');
    if (numeric.length === 0) return {};
    
    return {
      duration: numeric.reduce((sum, r) => sum + r.duration, 0) / numeric.length,
      castlesPerSecond: numeric.reduce((sum, r) => sum + (r.castlesPerSecond || 0), 0) / numeric.length,
      memoryUsed: numeric.reduce((sum, r) => sum + (r.memoryUsed || 0), 0) / numeric.length
    };
  }

  generateSummary() {
    console.log('📊 Generating Performance Summary');
    
    const summary = {
      overallPerformance: {},
      recommendations: [],
      scalabilityInsights: {},
      systemLimits: {}
    };
    
    // Find best performing benchmark
    const singleThreaded = this.results.benchmarks.find(b => b.name === 'single_threaded');
    const multiThreaded = this.results.benchmarks.find(b => b.name === 'multi_threaded');
    
    if (singleThreaded && multiThreaded) {
      const speedup = multiThreaded.average.castlesPerSecond / singleThreaded.average.castlesPerSecond;
      summary.overallPerformance = {
        singleThreadedSpeed: singleThreaded.average.castlesPerSecond,
        multiThreadedSpeed: multiThreaded.average.castlesPerSecond,
        parallelSpeedup: speedup,
        efficiency: speedup / this.options.parallel
      };
      
      if (speedup > 2) {
        summary.recommendations.push('Multi-threading provides significant performance benefits');
      } else {
        summary.recommendations.push('Consider optimizing single-threaded performance first');
      }
    }
    
    // Memory analysis
    const memoryBenchmark = this.results.benchmarks.find(b => b.name === 'memory_profiling');
    if (memoryBenchmark && memoryBenchmark.results.length > 0) {
      const avgMemoryPerCastle = memoryBenchmark.results.reduce((sum, r) => 
        sum + r.memoryPerCastle.heapUsed, 0) / memoryBenchmark.results.length;
      
      summary.scalabilityInsights.averageMemoryPerCastle = avgMemoryPerCastle;
      summary.scalabilityInsights.estimatedMemoryFor10000 = (avgMemoryPerCastle * 10000) / 1024 / 1024; // MB
      
      if (summary.scalabilityInsights.estimatedMemoryFor10000 > 1000) {
        summary.recommendations.push('Memory optimization required for 10,000+ castle scaling');
      }
    }
    
    // I/O analysis
    const ioResult = this.results.benchmarks.find(b => b.name === 'file_operations');
    if (ioResult) {
      summary.overallPerformance.fileWriteSpeed = ioResult.results.filesPerSecondWrite;
      summary.overallPerformance.avgFileSize = ioResult.results.averageFileSize;
      
      if (ioResult.results.filesPerSecondWrite < 10) {
        summary.recommendations.push('File I/O performance may become bottleneck at scale');
      }
    }
    
    this.results.summary = summary;
    
    console.log('✅ Performance summary generated\n');
  }

  async outputResults() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 PERFORMANCE BENCHMARK RESULTS');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (this.results.summary.overallPerformance) {
      const perf = this.results.summary.overallPerformance;
      console.log(`🚀 Single-threaded: ${perf.singleThreadedSpeed?.toFixed(1) || 'N/A'} castles/sec`);
      console.log(`⚡ Multi-threaded: ${perf.multiThreadedSpeed?.toFixed(1) || 'N/A'} castles/sec`);
      console.log(`📈 Parallel speedup: ${perf.parallelSpeedup?.toFixed(2) || 'N/A'}x`);
      console.log(`💾 File write speed: ${perf.fileWriteSpeed?.toFixed(1) || 'N/A'} files/sec`);
    }
    
    if (this.results.summary.scalabilityInsights) {
      const insights = this.results.summary.scalabilityInsights;
      console.log(`🧠 Memory per castle: ${(insights.averageMemoryPerCastle / 1024)?.toFixed(1) || 'N/A'}KB`);
      console.log(`📊 Est. memory for 10K: ${insights.estimatedMemoryFor10000?.toFixed(1) || 'N/A'}MB`);
    }
    
    if (this.results.summary.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.summary.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    if (this.options.outputFile) {
      await fs.writeFile(this.options.outputFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${this.options.outputFile}`);
    }
    
    console.log('\n🎉 Benchmark suite completed successfully!');
  }

  generateMockHTML(castle) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${castle.castleName} | Castle Encyclopedia</title>
</head>
<body>
    <h1>${castle.castleName}</h1>
    <p>Location: ${castle.location}</p>
    <p>Country: ${castle.country}</p>
    <p>Style: ${castle.architecturalStyle}</p>
    <p>Built: ${castle.yearBuilt}</p>
    <p>${castle.shortDescription}</p>
</body>
</html>`;
  }
}

class MockCastleGenerator {
  constructor() {
    this.castleTemplates = [
      {
        namePattern: "Castle {name}",
        countries: ["Germany", "France", "England", "Scotland", "Spain", "Italy"],
        styles: ["Gothic", "Renaissance", "Medieval", "Baroque", "Romanesque"],
        periods: ["12th century", "13th century", "14th century", "15th century", "16th century"]
      }
    ];
    
    this.namePool = [
      "Aldenburg", "Bernstein", "Crowenhall", "Drachenfels", "Eisenhof", "Falkenstein",
      "Greifenburg", "Herzberg", "Ironhold", "Königsburg", "Löwenstein", "Morgenröte",
      "Nebelburg", "Osterberg", "Rabenstein", "Sonnenburg", "Thuringia", "Vogelburg",
      "Waldeck", "Xerxes", "Ylverstone", "Zephyrburg", "Adlerhorst", "Blutberg"
    ];
  }

  async generateCastles(count) {
    const castles = [];
    
    for (let i = 0; i < count; i++) {
      const castle = await this.generateSingleCastle(i);
      castles.push(castle);
      
      // Add small delay to simulate real generation
      if (i % 50 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    return castles;
  }

  async generateSingleCastle(index) {
    const template = this.castleTemplates[0];
    const name = this.namePool[index % this.namePool.length];
    
    return {
      id: `castle_${index}_${name.toLowerCase()}`,
      castleName: template.namePattern.replace('{name}', name),
      country: template.countries[index % template.countries.length],
      location: `${name} Region`,
      architecturalStyle: template.styles[index % template.styles.length],
      yearBuilt: template.periods[index % template.periods.length],
      shortDescription: `A magnificent ${template.styles[index % template.styles.length].toLowerCase()} castle built in the ${template.periods[index % template.periods.length]}. This fortress represents the architectural excellence of medieval European castle design.`,
      keyFeatures: [
        "Stone walls",
        "Defensive towers", 
        "Great hall",
        "Royal apartments",
        "Chapel"
      ]
    };
  }
}

// CLI Interface
if (require.main === module) {
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
  
  if (cluster.isMaster) {
    const benchmark = new ScalabilityBenchmark(options);
    benchmark.runBenchmarkSuite().catch(console.error);
  }
}

module.exports = { ScalabilityBenchmark, MockCastleGenerator };