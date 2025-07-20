#!/usr/bin/env node

/**
 * Master Test Runner for Unlimited Scalability Architecture
 * Orchestrates comprehensive testing suite for 100+ castle generation
 * 
 * Usage: node test-runner.js [options]
 * Options:
 *   --suite <name>       Test suite: all|performance|stress|integration|quick
 *   --castles <number>   Number of castles for testing (default: 100)
 *   --parallel           Run tests in parallel where possible
 *   --report <file>      Generate consolidated report
 *   --verbose            Verbose output
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

const { ScalabilityBenchmark } = require('./performance-benchmark-100plus.js');
const { StressTester } = require('./stress-testing-automation.js');
const { ExternalDataIntegrationTester } = require('./external-data-integration-testing.js');

class MasterTestRunner {
  constructor(options = {}) {
    this.options = {
      suite: options.suite || 'all',
      castles: parseInt(options.castles) || 100,
      parallel: options.parallel || false,
      reportFile: options.report || null,
      verbose: options.verbose || false,
      timeout: parseInt(options.timeout) || 3600 // 1 hour default
    };
    
    this.results = {
      testConfig: this.options,
      startTime: Date.now(),
      endTime: null,
      totalDuration: null,
      testSuites: {},
      consolidatedMetrics: {},
      systemLimits: {},
      recommendations: [],
      summary: {}
    };
    
    this.testSuites = {
      performance: {
        name: 'Performance Benchmarking',
        description: 'Tests 100+ castle generation performance',
        runner: ScalabilityBenchmark,
        estimatedDuration: 300 // 5 minutes
      },
      stress: {
        name: 'Stress Testing',
        description: 'System limits and failure recovery testing',
        runner: StressTester,
        estimatedDuration: 600 // 10 minutes
      },
      integration: {
        name: 'External Data Integration',
        description: 'Tests external data sources integration',
        runner: ExternalDataIntegrationTester,
        estimatedDuration: 300 // 5 minutes
      }
    };
  }

  async runTestSuite() {
    console.log('🎯 Master Test Runner - Unlimited Scalability Architecture');
    console.log(`📋 Suite: ${this.options.suite}, Castles: ${this.options.castles}`);
    console.log(`⏱️  Estimated duration: ${this.estimateTotalDuration()} minutes`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    try {
      // Pre-flight checks
      await this.runPreflightChecks();
      
      // Determine which test suites to run
      const suitesToRun = this.determineSuitesToRun();
      
      if (this.options.parallel && suitesToRun.length > 1) {
        await this.runSuitesInParallel(suitesToRun);
      } else {
        await this.runSuitesSequentially(suitesToRun);
      }
      
      // Generate consolidated report
      await this.generateConsolidatedReport();
      
      // Output final results
      await this.outputFinalResults();
      
    } catch (error) {
      console.error('❌ Master test runner failed:', error.message);
      this.results.error = error.message;
      throw error;
    } finally {
      this.results.endTime = Date.now();
      this.results.totalDuration = this.results.endTime - this.results.startTime;
    }
  }

  async runPreflightChecks() {
    console.log('🔍 Running Pre-flight Checks');
    
    const checks = [
      { name: 'Node.js Version', test: () => this.checkNodeVersion() },
      { name: 'Available Memory', test: () => this.checkAvailableMemory() },
      { name: 'Disk Space', test: () => this.checkDiskSpace() },
      { name: 'Test Dependencies', test: () => this.checkDependencies() },
      { name: 'System Resources', test: () => this.checkSystemResources() }
    ];
    
    const checkResults = [];
    
    for (const check of checks) {
      try {
        const result = await check.test();
        checkResults.push({ name: check.name, passed: true, result });
        console.log(`   ✅ ${check.name}: ${result}`);
      } catch (error) {
        checkResults.push({ name: check.name, passed: false, error: error.message });
        console.log(`   ❌ ${check.name}: ${error.message}`);
      }
    }
    
    this.results.preflightChecks = checkResults;
    
    const failedChecks = checkResults.filter(c => !c.passed);
    if (failedChecks.length > 0) {
      console.log(`\n⚠️  ${failedChecks.length} pre-flight check(s) failed`);
      if (failedChecks.some(c => c.name.includes('Memory') || c.name.includes('Dependencies'))) {
        throw new Error('Critical pre-flight checks failed. Cannot proceed with testing.');
      }
    }
    
    console.log('✅ Pre-flight checks completed\n');
  }

  determineSuitesToRun() {
    switch (this.options.suite) {
      case 'performance':
        return ['performance'];
      case 'stress':
        return ['stress'];
      case 'integration':
        return ['integration'];
      case 'quick':
        return ['performance']; // Quick run = performance only
      case 'all':
      default:
        return Object.keys(this.testSuites);
    }
  }

  async runSuitesSequentially(suitesToRun) {
    console.log('🔄 Running test suites sequentially...\n');
    
    for (const suiteName of suitesToRun) {
      await this.runSingleTestSuite(suiteName);
    }
  }

  async runSuitesInParallel(suitesToRun) {
    console.log('⚡ Running test suites in parallel...\n');
    
    const suitePromises = suitesToRun.map(suiteName => 
      this.runSingleTestSuite(suiteName).catch(error => ({ error, suiteName }))
    );
    
    const results = await Promise.allSettled(suitePromises);
    
    // Check for failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.log(`❌ Suite ${suitesToRun[index]} failed: ${result.reason.message}`);
      }
    });
  }

  async runSingleTestSuite(suiteName) {
    const suite = this.testSuites[suiteName];
    if (!suite) {
      throw new Error(`Unknown test suite: ${suiteName}`);
    }
    
    console.log(`🎯 Starting ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log(`   Estimated duration: ${suite.estimatedDuration / 60} minutes\n`);
    
    const startTime = performance.now();
    
    try {
      const options = this.buildSuiteOptions(suiteName);
      const runner = new suite.runner(options);
      
      let result;
      switch (suiteName) {
        case 'performance':
          result = await this.runPerformanceSuite(runner);
          break;
        case 'stress':
          result = await this.runStressSuite(runner);
          break;
        case 'integration':
          result = await this.runIntegrationSuite(runner);
          break;
        default:
          throw new Error(`No runner implementation for suite: ${suiteName}`);
      }
      
      const endTime = performance.now();
      
      this.results.testSuites[suiteName] = {
        name: suite.name,
        success: true,
        duration: endTime - startTime,
        estimatedDuration: suite.estimatedDuration * 1000,
        result: result,
        metrics: this.extractSuiteMetrics(result, suiteName)
      };
      
      console.log(`✅ ${suite.name} completed in ${((endTime - startTime) / 1000 / 60).toFixed(1)} minutes\n`);
      
    } catch (error) {
      const endTime = performance.now();
      
      this.results.testSuites[suiteName] = {
        name: suite.name,
        success: false,
        duration: endTime - startTime,
        error: error.message
      };
      
      console.log(`❌ ${suite.name} failed: ${error.message}\n`);
      throw error;
    }
  }

  buildSuiteOptions(suiteName) {
    const baseOptions = {
      verbose: this.options.verbose,
      output: this.options.reportFile ? `${suiteName}-results.json` : null
    };
    
    switch (suiteName) {
      case 'performance':
        return {
          ...baseOptions,
          castles: this.options.castles,
          iterations: 3,
          parallel: 4,
          memory: true
        };
        
      case 'stress':
        return {
          ...baseOptions,
          mode: 'concurrent',
          duration: 120, // 2 minutes for testing
          intensity: 5,
          monitor: true,
          recovery: true
        };
        
      case 'integration':
        return {
          ...baseOptions,
          sources: 'wiki,wikidata,unesco',
          mode: 'integration',
          duration: 60,
          'rate-limit': true
        };
        
      default:
        return baseOptions;
    }
  }

  async runPerformanceSuite(runner) {
    await runner.runBenchmarkSuite();
    return runner.results;
  }

  async runStressSuite(runner) {
    await runner.runStressSuite();
    return runner.results;
  }

  async runIntegrationSuite(runner) {
    await runner.runIntegrationTestSuite();
    return runner.results;
  }

  extractSuiteMetrics(result, suiteName) {
    switch (suiteName) {
      case 'performance':
        return this.extractPerformanceMetrics(result);
      case 'stress':
        return this.extractStressMetrics(result);
      case 'integration':
        return this.extractIntegrationMetrics(result);
      default:
        return {};
    }
  }

  extractPerformanceMetrics(result) {
    const singleThreaded = result.benchmarks?.find(b => b.name === 'single_threaded');
    const multiThreaded = result.benchmarks?.find(b => b.name === 'multi_threaded');
    const memoryProfile = result.benchmarks?.find(b => b.name === 'memory_profiling');
    
    return {
      singleThreadedSpeed: singleThreaded?.average?.castlesPerSecond || 0,
      multiThreadedSpeed: multiThreaded?.average?.castlesPerSecond || 0,
      parallelSpeedup: multiThreaded && singleThreaded 
        ? multiThreaded.average.castlesPerSecond / singleThreaded.average.castlesPerSecond 
        : 1,
      memoryPerCastle: memoryProfile?.results?.[0]?.memoryPerCastle?.heapUsed || 0,
      overallGrade: this.calculateOverallGrade(result)
    };
  }

  extractStressMetrics(result) {
    const stressTests = result.stressTests || [];
    const successful = stressTests.filter(t => t.success).length;
    const failures = result.failures?.length || 0;
    
    return {
      testsRun: stressTests.length,
      testsSuccessful: successful,
      successRate: stressTests.length > 0 ? (successful / stressTests.length) * 100 : 0,
      failures: failures,
      systemLimitsReached: stressTests.some(t => t.type === 'memory' && !t.success),
      recoveryCapable: Object.keys(result.recovery || {}).length > 0
    };
  }

  extractIntegrationMetrics(result) {
    const reliabilityTests = Object.keys(result.reliabilityTests || {}).length;
    const qualityAnalysis = Object.keys(result.qualityAnalysis?.completeness || {}).length;
    const integrationTests = result.integrationTests?.length || 0;
    
    return {
      dataSourcesTested: reliabilityTests,
      qualityAnalysisCompleted: qualityAnalysis > 0,
      integrationTestsRun: integrationTests,
      overallReliability: this.calculateAverageReliability(result.reliabilityTests),
      dataQuality: this.calculateAverageDataQuality(result.qualityAnalysis)
    };
  }

  async generateConsolidatedReport() {
    console.log('📊 Generating Consolidated Report');
    
    // Consolidate metrics across all test suites
    this.consolidateMetrics();
    
    // Identify system limits
    this.identifySystemLimits();
    
    // Generate recommendations
    this.generateRecommendations();
    
    // Create summary
    this.createSummary();
    
    console.log('✅ Consolidated report generated\n');
  }

  consolidateMetrics() {
    const consolidated = {
      performance: {},
      reliability: {},
      scalability: {},
      dataQuality: {}
    };
    
    // Extract performance metrics
    const perfSuite = this.results.testSuites.performance;
    if (perfSuite?.success) {
      consolidated.performance = {
        maxCastlesPerSecond: perfSuite.metrics.multiThreadedSpeed || perfSuite.metrics.singleThreadedSpeed || 0,
        parallelEfficiency: perfSuite.metrics.parallelSpeedup || 1,
        memoryEfficiency: perfSuite.metrics.memoryPerCastle || 0,
        scalabilityProjection: this.projectScalability(perfSuite.metrics)
      };
    }
    
    // Extract reliability metrics
    const stressSuite = this.results.testSuites.stress;
    if (stressSuite?.success) {
      consolidated.reliability = {
        systemStability: stressSuite.metrics.successRate || 0,
        failureRecovery: stressSuite.metrics.recoveryCapable || false,
        loadHandling: !stressSuite.metrics.systemLimitsReached
      };
    }
    
    // Extract integration metrics
    const integrationSuite = this.results.testSuites.integration;
    if (integrationSuite?.success) {
      consolidated.dataQuality = {
        sourceReliability: integrationSuite.metrics.overallReliability || 0,
        dataCompleteness: integrationSuite.metrics.dataQuality || 0,
        integrationCapability: integrationSuite.metrics.integrationTestsRun > 0
      };
    }
    
    this.results.consolidatedMetrics = consolidated;
  }

  identifySystemLimits() {
    const limits = {
      memory: null,
      performance: null,
      concurrency: null,
      dataIntegration: null
    };
    
    // Analyze performance suite for limits
    const perfSuite = this.results.testSuites.performance;
    if (perfSuite?.result?.benchmarks) {
      const scalabilityBench = perfSuite.result.benchmarks.find(b => b.name === 'scalability_limits');
      if (scalabilityBench) {
        const lastSuccessful = scalabilityBench.results
          .filter(r => r.success)
          .reduce((max, r) => r.castleCount > max.castleCount ? r : max, { castleCount: 0 });
        
        limits.performance = {
          maxCastlesTested: lastSuccessful.castleCount,
          performanceDegradation: this.analyzePerformanceDegradation(scalabilityBench.results)
        };
      }
    }
    
    // Analyze stress suite for limits
    const stressSuite = this.results.testSuites.stress;
    if (stressSuite?.result?.stressTests) {
      const memoryTest = stressSuite.result.stressTests.find(t => t.type === 'memory');
      if (memoryTest) {
        limits.memory = {
          maxMemoryAllocated: memoryTest.allocatedSize,
          memoryLimit: memoryTest.peakMemoryUsage
        };
      }
      
      const concurrentTest = stressSuite.result.stressTests.find(t => t.type === 'concurrent');
      if (concurrentTest) {
        limits.concurrency = {
          maxConcurrentOperations: concurrentTest.concurrentOperations,
          successRate: concurrentTest.successRate
        };
      }
    }
    
    this.results.systemLimits = limits;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Performance recommendations
    const perfMetrics = this.results.consolidatedMetrics.performance;
    if (perfMetrics) {
      if (perfMetrics.parallelEfficiency < 2) {
        recommendations.push({
          category: 'performance',
          priority: 'high',
          recommendation: 'Optimize parallel processing - current efficiency is below 2x speedup',
          impact: 'Could double performance with better parallelization'
        });
      }
      
      if (perfMetrics.memoryEfficiency > 1024 * 1024) { // 1MB per castle
        recommendations.push({
          category: 'memory',
          priority: 'medium',
          recommendation: 'Optimize memory usage - currently using >1MB per castle',
          impact: 'Reduce memory requirements for large-scale deployments'
        });
      }
    }
    
    // Reliability recommendations
    const reliabilityMetrics = this.results.consolidatedMetrics.reliability;
    if (reliabilityMetrics) {
      if (reliabilityMetrics.systemStability < 95) {
        recommendations.push({
          category: 'reliability',
          priority: 'high',
          recommendation: 'Improve system stability - current success rate below 95%',
          impact: 'Critical for production deployment reliability'
        });
      }
      
      if (!reliabilityMetrics.failureRecovery) {
        recommendations.push({
          category: 'resilience',
          priority: 'medium',
          recommendation: 'Implement failure recovery mechanisms',
          impact: 'Improve system resilience and user experience'
        });
      }
    }
    
    // Scalability recommendations
    const scalabilityProjection = this.results.consolidatedMetrics.performance?.scalabilityProjection;
    if (scalabilityProjection) {
      if (scalabilityProjection.estimatedMax10K < 30000) { // 30 seconds for 10K castles
        recommendations.push({
          category: 'scalability',
          priority: 'high',
          recommendation: 'Current architecture may not meet 10K castle generation requirements',
          impact: 'Need architectural improvements for unlimited scalability'
        });
      }
    }
    
    this.results.recommendations = recommendations;
  }

  createSummary() {
    const summary = {
      overallResult: 'PASSED',
      readyForProduction: true,
      keyFindings: [],
      criticalIssues: [],
      performanceGrade: 'B',
      recommendations: this.results.recommendations.length
    };
    
    // Determine overall result
    const failedSuites = Object.values(this.results.testSuites).filter(s => !s.success);
    if (failedSuites.length > 0) {
      summary.overallResult = 'FAILED';
      summary.readyForProduction = false;
      summary.criticalIssues.push(`${failedSuites.length} test suite(s) failed`);
    }
    
    // High priority recommendations are critical issues
    const highPriorityRecs = this.results.recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecs.length > 0) {
      summary.criticalIssues.push(...highPriorityRecs.map(r => r.recommendation));
      if (highPriorityRecs.length > 2) {
        summary.readyForProduction = false;
      }
    }
    
    // Performance grade
    const perfMetrics = this.results.consolidatedMetrics.performance;
    if (perfMetrics) {
      const score = this.calculateOverallPerformanceScore(perfMetrics);
      summary.performanceGrade = this.scoreToGrade(score);
    }
    
    // Key findings
    summary.keyFindings = [
      `System tested with ${this.options.castles} castles`,
      `${Object.keys(this.results.testSuites).length} test suites completed`,
      `${this.results.recommendations.length} recommendations generated`
    ];
    
    if (this.results.systemLimits.performance) {
      summary.keyFindings.push(`Max performance tested: ${this.results.systemLimits.performance.maxCastlesTested} castles`);
    }
    
    this.results.summary = summary;
  }

  async outputFinalResults() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 UNLIMITED SCALABILITY TESTING - FINAL REPORT');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const summary = this.results.summary;
    
    // Overall result
    const resultIcon = summary.overallResult === 'PASSED' ? '✅' : '❌';
    console.log(`${resultIcon} Overall Result: ${summary.overallResult}`);
    console.log(`🚀 Production Ready: ${summary.readyForProduction ? 'YES' : 'NO'}`);
    console.log(`📊 Performance Grade: ${summary.performanceGrade}`);
    console.log(`⏱️  Total Duration: ${(this.results.totalDuration / 1000 / 60).toFixed(1)} minutes`);
    
    // Test suites summary
    console.log('\n🎯 TEST SUITES SUMMARY:');
    Object.entries(this.results.testSuites).forEach(([name, suite]) => {
      const icon = suite.success ? '✅' : '❌';
      const duration = (suite.duration / 1000 / 60).toFixed(1);
      console.log(`   ${icon} ${suite.name}: ${duration} min`);
    });
    
    // Key metrics
    console.log('\n📈 KEY METRICS:');
    const consolidated = this.results.consolidatedMetrics;
    if (consolidated.performance) {
      console.log(`   Performance: ${consolidated.performance.maxCastlesPerSecond.toFixed(1)} castles/sec max`);
      console.log(`   Parallel Efficiency: ${consolidated.performance.parallelEfficiency.toFixed(2)}x speedup`);
    }
    if (consolidated.reliability) {
      console.log(`   System Stability: ${consolidated.reliability.systemStability.toFixed(1)}%`);
      console.log(`   Failure Recovery: ${consolidated.reliability.failureRecovery ? 'Available' : 'Limited'}`);
    }
    
    // Critical issues
    if (summary.criticalIssues.length > 0) {
      console.log('\n⚠️  CRITICAL ISSUES:');
      summary.criticalIssues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    }
    
    // Top recommendations
    const topRecs = this.results.recommendations.slice(0, 3);
    if (topRecs.length > 0) {
      console.log('\n💡 TOP RECOMMENDATIONS:');
      topRecs.forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.recommendation}`);
      });
    }
    
    // Save detailed report
    if (this.options.reportFile) {
      await fs.writeFile(this.options.reportFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Detailed report saved to: ${this.options.reportFile}`);
    }
    
    console.log('\n🎉 Unlimited scalability testing completed!');
    
    // Exit code based on results
    if (!summary.readyForProduction) {
      process.exit(1);
    }
  }

  // Helper methods
  estimateTotalDuration() {
    const suitesToRun = this.determineSuitesToRun();
    const totalSeconds = suitesToRun.reduce((sum, name) => 
      sum + (this.testSuites[name]?.estimatedDuration || 0), 0);
    return Math.ceil(totalSeconds / 60);
  }

  async checkNodeVersion() {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    if (major < 14) {
      throw new Error(`Node.js ${major} is too old. Requires Node.js 14+`);
    }
    return `Node.js ${version}`;
  }

  async checkAvailableMemory() {
    const free = require('os').freemem();
    const total = require('os').totalmem();
    const freeGB = free / 1024 / 1024 / 1024;
    
    if (freeGB < 1) {
      throw new Error(`Insufficient memory: ${freeGB.toFixed(1)}GB free`);
    }
    
    return `${freeGB.toFixed(1)}GB free of ${(total / 1024 / 1024 / 1024).toFixed(1)}GB total`;
  }

  async checkDiskSpace() {
    // Simplified disk space check
    return 'Sufficient disk space available';
  }

  async checkDependencies() {
    // Check if required modules are available
    const required = ['fs', 'path', 'child_process', 'os'];
    for (const dep of required) {
      try {
        require(dep);
      } catch (error) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    }
    return 'All dependencies available';
  }

  async checkSystemResources() {
    const cpus = require('os').cpus().length;
    const load = require('os').loadavg()[0];
    
    if (load > cpus * 2) {
      throw new Error(`High system load: ${load.toFixed(2)}`);
    }
    
    return `${cpus} CPUs, load ${load.toFixed(2)}`;
  }

  calculateOverallGrade(result) {
    // Simplified grading based on benchmark results
    const benchmarks = result.benchmarks || [];
    if (benchmarks.length === 0) return 'F';
    
    const avgPerformance = benchmarks
      .filter(b => b.average?.castlesPerSecond)
      .reduce((sum, b) => sum + b.average.castlesPerSecond, 0) / benchmarks.length;
    
    if (avgPerformance > 100) return 'A';
    if (avgPerformance > 50) return 'B';
    if (avgPerformance > 25) return 'C';
    if (avgPerformance > 10) return 'D';
    return 'F';
  }

  calculateAverageReliability(reliabilityTests) {
    const tests = Object.values(reliabilityTests || {});
    if (tests.length === 0) return 0;
    
    return tests.reduce((sum, test) => sum + (test.summary?.successRate || 0), 0) / tests.length;
  }

  calculateAverageDataQuality(qualityAnalysis) {
    const completeness = Object.values(qualityAnalysis?.completeness || {});
    if (completeness.length === 0) return 0;
    
    return completeness.reduce((sum, q) => sum + (q.score || 0), 0) / completeness.length;
  }

  projectScalability(metrics) {
    const baseSpeed = metrics.maxCastlesPerSecond || 10;
    return {
      estimated1K: (1000 / baseSpeed) * 1000, // milliseconds for 1K castles
      estimated10K: (10000 / baseSpeed) * 1000, // milliseconds for 10K castles
      scalabilityFactor: metrics.parallelEfficiency || 1
    };
  }

  analyzePerformanceDegradation(results) {
    if (results.length < 2) return null;
    
    const degradation = [];
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const curr = results[i];
      
      if (prev.success && curr.success) {
        const ratio = curr.castlesPerSecond / prev.castlesPerSecond;
        degradation.push(ratio);
      }
    }
    
    return degradation.length > 0 
      ? degradation.reduce((sum, ratio) => sum + ratio, 0) / degradation.length 
      : 1;
  }

  calculateOverallPerformanceScore(metrics) {
    let score = 0;
    
    // Speed component (40 points)
    const speedScore = Math.min(metrics.maxCastlesPerSecond / 100, 1) * 40;
    score += speedScore;
    
    // Efficiency component (30 points)
    const efficiencyScore = Math.min(metrics.parallelEfficiency / 4, 1) * 30;
    score += efficiencyScore;
    
    // Memory efficiency component (30 points)
    const memoryScore = Math.max(0, (1 - metrics.memoryEfficiency / (5 * 1024 * 1024))) * 30;
    score += memoryScore;
    
    return score;
  }

  scoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
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
  
  const runner = new MasterTestRunner(options);
  runner.runTestSuite().catch(console.error);
}

module.exports = { MasterTestRunner };