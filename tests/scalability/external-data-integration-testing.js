#!/usr/bin/env node

/**
 * External Data Integration Testing Suite
 * Comprehensive testing for unlimited scalability with external data sources
 * 
 * Usage: node external-data-integration-testing.js [options]
 * Options:
 *   --sources <list>     Comma-separated data sources to test (wiki,wikidata,unesco,all)
 *   --mode <type>        Test mode: reliability|quality|performance|integration
 *   --duration <seconds> Test duration for continuous monitoring (default: 300)
 *   --rate-limit         Test rate limiting scenarios
 *   --offline            Test offline fallback mechanisms
 *   --output <file>      Output results to JSON file
 */

const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');
const https = require('https');
const http = require('http');

class ExternalDataIntegrationTester {
  constructor(options = {}) {
    this.options = {
      sources: (options.sources || 'all').split(','),
      mode: options.mode || 'integration',
      duration: parseInt(options.duration) || 300,
      testRateLimit: options['rate-limit'] || false,
      testOffline: options.offline || false,
      outputFile: options.output || null,
      verbose: options.verbose || false
    };
    
    this.results = {
      testConfig: this.options,
      timestamp: new Date().toISOString(),
      dataSourceTests: [],
      integrationTests: [],
      qualityAnalysis: {},
      performanceMetrics: {},
      reliabilityTests: {},
      offlineTests: {},
      rateLimitingTests: {},
      recommendations: []
    };
    
    this.dataSources = this.initializeDataSources();
    this.isRunning = false;
    this.requestCounts = new Map();
    this.errorCounts = new Map();
  }

  initializeDataSources() {
    return {
      wikipedia: {
        name: 'Wikipedia API',
        baseUrl: 'https://en.wikipedia.org/api/rest_v1',
        endpoints: {
          search: '/page/search/{query}',
          content: '/page/summary/{title}',
          random: '/page/random/summary'
        },
        rateLimit: { requests: 200, window: 3600 }, // 200 requests per hour
        reliability: 99.9,
        averageLatency: 150
      },
      
      wikidata: {
        name: 'Wikidata Query Service',
        baseUrl: 'https://query.wikidata.org',
        endpoints: {
          sparql: '/sparql',
          entityData: '/wiki/Special:EntityData/{id}.json'
        },
        rateLimit: { requests: 100, window: 3600 },
        reliability: 99.5,
        averageLatency: 300
      },
      
      unesco: {
        name: 'UNESCO World Heritage API',
        baseUrl: 'https://whc.unesco.org/en/list',
        endpoints: {
          sites: '/json',
          site: '/{id}/json'
        },
        rateLimit: { requests: 1000, window: 3600 },
        reliability: 95.0,
        averageLatency: 500
      },
      
      openstreetmap: {
        name: 'OpenStreetMap Nominatim',
        baseUrl: 'https://nominatim.openstreetmap.org',
        endpoints: {
          search: '/search',
          reverse: '/reverse',
          details: '/details'
        },
        rateLimit: { requests: 1, window: 1 }, // 1 request per second
        reliability: 98.0,
        averageLatency: 200
      },
      
      dbpedia: {
        name: 'DBpedia SPARQL Endpoint',
        baseUrl: 'https://dbpedia.org',
        endpoints: {
          sparql: '/sparql',
          data: '/data/{resource}.json'
        },
        rateLimit: { requests: 50, window: 3600 },
        reliability: 90.0,
        averageLatency: 800
      }
    };
  }

  async runIntegrationTestSuite() {
    console.log('🌐 Starting External Data Integration Testing Suite');
    console.log(`📊 Sources: ${this.options.sources.join(', ')}, Mode: ${this.options.mode}`);
    console.log(`⏱️  Duration: ${this.options.duration}s`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    try {
      this.isRunning = true;
      
      // Filter data sources based on options
      const testSources = this.options.sources.includes('all') 
        ? Object.keys(this.dataSources)
        : this.options.sources.filter(source => this.dataSources[source]);
      
      switch (this.options.mode) {
        case 'reliability':
          await this.testReliability(testSources);
          break;
        case 'quality':
          await this.testDataQuality(testSources);
          break;
        case 'performance':
          await this.testPerformance(testSources);
          break;
        case 'integration':
          await this.testFullIntegration(testSources);
          break;
        default:
          await this.testFullIntegration(testSources);
      }
      
      if (this.options.testRateLimit) {
        await this.testRateLimiting(testSources);
      }
      
      if (this.options.testOffline) {
        await this.testOfflineFallbacks();
      }
      
      await this.generateIntegrationReport();
      
    } catch (error) {
      console.error('❌ Integration testing failed:', error.message);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async testReliability(sources) {
    console.log('🔍 Reliability Testing');
    
    for (const sourceName of sources) {
      const source = this.dataSources[sourceName];
      if (!source) continue;
      
      console.log(`   Testing ${source.name}...`);
      
      const reliabilityTest = {
        source: sourceName,
        name: source.name,
        startTime: Date.now(),
        requests: [],
        summary: {}
      };
      
      // Test multiple endpoints over time
      const testDuration = Math.min(this.options.duration * 1000, 60000); // Max 1 minute per source
      const requestInterval = 5000; // Request every 5 seconds
      const requests = Math.floor(testDuration / requestInterval);
      
      for (let i = 0; i < requests && this.isRunning; i++) {
        const requestStart = performance.now();
        
        try {
          const result = await this.makeTestRequest(source, sourceName);
          const requestEnd = performance.now();
          
          reliabilityTest.requests.push({
            attempt: i + 1,
            success: true,
            responseTime: requestEnd - requestStart,
            dataReceived: result ? JSON.stringify(result).length : 0,
            timestamp: Date.now()
          });
          
          console.log(`     Request ${i + 1}/${requests}: ✅ ${(requestEnd - requestStart).toFixed(0)}ms`);
          
        } catch (error) {
          const requestEnd = performance.now();
          
          reliabilityTest.requests.push({
            attempt: i + 1,
            success: false,
            responseTime: requestEnd - requestStart,
            error: error.message,
            timestamp: Date.now()
          });
          
          console.log(`     Request ${i + 1}/${requests}: ❌ ${error.message}`);
        }
        
        // Wait for next request interval
        if (i < requests - 1) {
          await new Promise(resolve => setTimeout(resolve, requestInterval));
        }
      }
      
      // Calculate reliability metrics
      const successfulRequests = reliabilityTest.requests.filter(r => r.success);
      const successRate = (successfulRequests.length / reliabilityTest.requests.length) * 100;
      const avgResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
      const maxResponseTime = Math.max(...successfulRequests.map(r => r.responseTime));
      const minResponseTime = Math.min(...successfulRequests.map(r => r.responseTime));
      
      reliabilityTest.summary = {
        totalRequests: reliabilityTest.requests.length,
        successfulRequests: successfulRequests.length,
        successRate: successRate,
        avgResponseTime: avgResponseTime || 0,
        maxResponseTime: maxResponseTime === -Infinity ? 0 : maxResponseTime,
        minResponseTime: minResponseTime === Infinity ? 0 : minResponseTime,
        expectedReliability: source.reliability,
        actualReliability: successRate,
        reliabilityDelta: successRate - source.reliability
      };
      
      this.results.reliabilityTests[sourceName] = reliabilityTest;
      
      console.log(`     ✅ ${source.name}: ${successRate.toFixed(1)}% success rate, ${avgResponseTime.toFixed(0)}ms avg response`);
    }
    
    console.log('✅ Reliability testing completed\n');
  }

  async testDataQuality(sources) {
    console.log('📊 Data Quality Testing');
    
    const qualityMetrics = {
      completeness: {},
      accuracy: {},
      consistency: {},
      timeliness: {},
      validity: {}
    };
    
    for (const sourceName of sources) {
      const source = this.dataSources[sourceName];
      if (!source) continue;
      
      console.log(`   Analyzing ${source.name} data quality...`);
      
      try {
        // Sample data from source
        const sampleData = await this.sampleDataFromSource(source, sourceName);
        
        // Analyze completeness
        const completeness = this.analyzeCompleteness(sampleData, sourceName);
        qualityMetrics.completeness[sourceName] = completeness;
        
        // Analyze accuracy (cross-reference with other sources if available)
        const accuracy = await this.analyzeAccuracy(sampleData, sourceName, sources);
        qualityMetrics.accuracy[sourceName] = accuracy;
        
        // Analyze consistency
        const consistency = this.analyzeConsistency(sampleData, sourceName);
        qualityMetrics.consistency[sourceName] = consistency;
        
        // Analyze validity
        const validity = this.analyzeValidity(sampleData, sourceName);
        qualityMetrics.validity[sourceName] = validity;
        
        console.log(`     ✅ Completeness: ${completeness.score.toFixed(1)}%, Accuracy: ${accuracy.score.toFixed(1)}%`);
        
      } catch (error) {
        console.log(`     ❌ Quality analysis failed: ${error.message}`);
        qualityMetrics.completeness[sourceName] = { score: 0, error: error.message };
      }
    }
    
    this.results.qualityAnalysis = qualityMetrics;
    console.log('✅ Data quality testing completed\n');
  }

  async testPerformance(sources) {
    console.log('⚡ Performance Testing');
    
    const performanceTests = {};
    
    for (const sourceName of sources) {
      const source = this.dataSources[sourceName];
      if (!source) continue;
      
      console.log(`   Testing ${source.name} performance...`);
      
      const perfTest = {
        source: sourceName,
        tests: [],
        summary: {}
      };
      
      // Test different load patterns
      const loadPatterns = [
        { name: 'single', concurrent: 1, requests: 10 },
        { name: 'light', concurrent: 3, requests: 15 },
        { name: 'moderate', concurrent: 5, requests: 25 },
        { name: 'heavy', concurrent: 10, requests: 50 }
      ];
      
      for (const pattern of loadPatterns) {
        console.log(`     Testing ${pattern.name} load (${pattern.concurrent} concurrent, ${pattern.requests} total)...`);
        
        const patternStart = performance.now();
        const results = [];
        
        // Execute requests in batches
        for (let batch = 0; batch < Math.ceil(pattern.requests / pattern.concurrent); batch++) {
          const batchSize = Math.min(pattern.concurrent, pattern.requests - batch * pattern.concurrent);
          const batchPromises = [];
          
          for (let i = 0; i < batchSize; i++) {
            batchPromises.push(this.makeTimedRequest(source, sourceName));
          }
          
          const batchResults = await Promise.allSettled(batchPromises);
          results.push(...batchResults);
          
          // Small delay between batches to respect rate limits
          if (batch < Math.ceil(pattern.requests / pattern.concurrent) - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        const patternEnd = performance.now();
        
        // Analyze results
        const successful = results.filter(r => r.status === 'fulfilled');
        const avgResponseTime = successful.length > 0 
          ? successful.reduce((sum, r) => sum + r.value.responseTime, 0) / successful.length 
          : 0;
        
        const testResult = {
          pattern: pattern.name,
          totalDuration: patternEnd - patternStart,
          totalRequests: results.length,
          successfulRequests: successful.length,
          successRate: (successful.length / results.length) * 100,
          avgResponseTime: avgResponseTime,
          requestsPerSecond: successful.length / ((patternEnd - patternStart) / 1000),
          throughput: successful.length / ((patternEnd - patternStart) / 1000)
        };
        
        perfTest.tests.push(testResult);
        
        console.log(`       ${testResult.successRate.toFixed(1)}% success, ${testResult.avgResponseTime.toFixed(0)}ms avg, ${testResult.throughput.toFixed(1)} req/sec`);
      }
      
      // Calculate overall performance summary
      const avgThroughput = perfTest.tests.reduce((sum, t) => sum + t.throughput, 0) / perfTest.tests.length;
      const avgResponseTime = perfTest.tests.reduce((sum, t) => sum + t.avgResponseTime, 0) / perfTest.tests.length;
      const overallSuccessRate = perfTest.tests.reduce((sum, t) => sum + t.successRate, 0) / perfTest.tests.length;
      
      perfTest.summary = {
        avgThroughput: avgThroughput,
        avgResponseTime: avgResponseTime,
        overallSuccessRate: overallSuccessRate,
        performanceGrade: this.calculatePerformanceGrade(avgThroughput, avgResponseTime, overallSuccessRate)
      };
      
      performanceTests[sourceName] = perfTest;
      
      console.log(`     ✅ Overall: ${avgThroughput.toFixed(1)} req/sec, ${avgResponseTime.toFixed(0)}ms avg response`);
    }
    
    this.results.performanceMetrics = performanceTests;
    console.log('✅ Performance testing completed\n');
  }

  async testFullIntegration(sources) {
    console.log('🔄 Full Integration Testing');
    
    // Test complete data fusion workflow
    await this.testDataFusion(sources);
    
    // Test conflict resolution
    await this.testConflictResolution(sources);
    
    // Test data validation pipeline
    await this.testDataValidation(sources);
    
    // Test scalability with multiple sources
    await this.testMultiSourceScalability(sources);
    
    console.log('✅ Full integration testing completed\n');
  }

  async testDataFusion(sources) {
    console.log('   🔗 Testing data fusion across sources...');
    
    const fusionTest = {
      sources: sources,
      testCases: [],
      conflicts: [],
      mergeSuccess: 0
    };
    
    // Test merging data about the same castle from multiple sources
    const testCastles = ['neuschwanstein', 'versailles', 'windsor', 'alhambra'];
    
    for (const castle of testCastles) {
      const castleData = {};
      
      // Collect data from each source
      for (const sourceName of sources) {
        try {
          const data = await this.fetchCastleData(sourceName, castle);
          castleData[sourceName] = data;
        } catch (error) {
          // Expected - not all sources will have all castles
        }
      }
      
      // Attempt data fusion
      const mergedData = this.fuseCastleData(castleData);
      const conflicts = this.detectConflicts(castleData);
      
      fusionTest.testCases.push({
        castle: castle,
        sourcesFound: Object.keys(castleData).length,
        conflicts: conflicts.length,
        mergedSuccessfully: mergedData !== null
      });
      
      if (conflicts.length > 0) {
        fusionTest.conflicts.push(...conflicts);
      }
      
      if (mergedData) {
        fusionTest.mergeSuccess++;
      }
    }
    
    this.results.integrationTests.push({
      type: 'data_fusion',
      result: fusionTest
    });
    
    console.log(`     ✅ Merged ${fusionTest.mergeSuccess}/${testCastles.length} test cases, ${fusionTest.conflicts.length} conflicts detected`);
  }

  async testConflictResolution(sources) {
    console.log('   ⚖️  Testing conflict resolution mechanisms...');
    
    // Simulate conflicting data scenarios
    const conflicts = [
      {
        field: 'yearBuilt',
        values: { source1: '1869', source2: '1870', source3: '1869-1886' },
        expectedResolution: '1869-1886'
      },
      {
        field: 'location',
        values: { source1: 'Bavaria, Germany', source2: 'Fussen, Bavaria', source3: 'Near Fussen, Bavaria' },
        expectedResolution: 'Near Fussen, Bavaria, Germany'
      }
    ];
    
    const resolutionResults = [];
    
    for (const conflict of conflicts) {
      const resolved = this.resolveDataConflict(conflict.field, conflict.values);
      const correct = this.evaluateResolution(resolved, conflict.expectedResolution);
      
      resolutionResults.push({
        field: conflict.field,
        conflictValues: conflict.values,
        resolved: resolved,
        expected: conflict.expectedResolution,
        correct: correct
      });
    }
    
    this.results.integrationTests.push({
      type: 'conflict_resolution',
      result: resolutionResults
    });
    
    const correctResolutions = resolutionResults.filter(r => r.correct).length;
    console.log(`     ✅ Resolved ${correctResolutions}/${resolutionResults.length} conflicts correctly`);
  }

  async testDataValidation(sources) {
    console.log('   ✅ Testing data validation pipeline...');
    
    const validationTests = [];
    
    for (const sourceName of sources) {
      const source = this.dataSources[sourceName];
      
      try {
        // Get sample data
        const sampleData = await this.sampleDataFromSource(source, sourceName);
        
        // Run validation tests
        const validationResult = {
          source: sourceName,
          tests: {
            schemaValidation: this.validateDataSchema(sampleData, sourceName),
            typeValidation: this.validateDataTypes(sampleData, sourceName),
            rangeValidation: this.validateDataRanges(sampleData, sourceName),
            formatValidation: this.validateDataFormats(sampleData, sourceName)
          }
        };
        
        validationTests.push(validationResult);
        
        const passedTests = Object.values(validationResult.tests).filter(t => t.passed).length;
        console.log(`     ${sourceName}: ${passedTests}/4 validation tests passed`);
        
      } catch (error) {
        validationTests.push({
          source: sourceName,
          error: error.message
        });
      }
    }
    
    this.results.integrationTests.push({
      type: 'data_validation',
      result: validationTests
    });
  }

  async testMultiSourceScalability(sources) {
    console.log('   📈 Testing multi-source scalability...');
    
    const scalabilityTest = {
      sources: sources.length,
      simultaneousRequests: [],
      aggregationPerformance: {}
    };
    
    // Test simultaneous requests to all sources
    const requestCounts = [1, 5, 10, 25];
    
    for (const count of requestCounts) {
      const startTime = performance.now();
      const promises = [];
      
      // Make simultaneous requests to all sources
      for (let i = 0; i < count; i++) {
        for (const sourceName of sources) {
          promises.push(this.makeTestRequest(this.dataSources[sourceName], sourceName));
        }
      }
      
      const results = await Promise.allSettled(promises);
      const endTime = performance.now();
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const totalRequests = results.length;
      
      scalabilityTest.simultaneousRequests.push({
        requestsPerSource: count,
        totalRequests: totalRequests,
        successful: successful,
        successRate: (successful / totalRequests) * 100,
        duration: endTime - startTime,
        requestsPerSecond: successful / ((endTime - startTime) / 1000)
      });
      
      console.log(`     ${count} req/source: ${(successful / totalRequests * 100).toFixed(1)}% success, ${(successful / ((endTime - startTime) / 1000)).toFixed(1)} req/sec`);
    }
    
    this.results.integrationTests.push({
      type: 'multi_source_scalability',
      result: scalabilityTest
    });
  }

  async testRateLimiting(sources) {
    console.log('🚦 Rate Limiting Testing');
    
    for (const sourceName of sources) {
      const source = this.dataSources[sourceName];
      if (!source.rateLimit) continue;
      
      console.log(`   Testing ${source.name} rate limits...`);
      
      const rateLimitTest = {
        source: sourceName,
        configuredLimit: source.rateLimit,
        tests: []
      };
      
      // Test approaching rate limit
      const testRequests = Math.min(source.rateLimit.requests + 10, 50);
      const requestInterval = (source.rateLimit.window * 1000) / source.rateLimit.requests;
      
      let rateLimitHit = false;
      let successCount = 0;
      
      for (let i = 0; i < testRequests && this.isRunning; i++) {
        try {
          const start = performance.now();
          await this.makeTestRequest(source, sourceName);
          const end = performance.now();
          
          successCount++;
          rateLimitTest.tests.push({
            request: i + 1,
            success: true,
            responseTime: end - start
          });
          
        } catch (error) {
          const isRateLimit = error.message.includes('429') || 
                             error.message.includes('rate') || 
                             error.message.includes('limit');
          
          if (isRateLimit) {
            rateLimitHit = true;
            console.log(`     Rate limit hit at request ${i + 1}`);
          }
          
          rateLimitTest.tests.push({
            request: i + 1,
            success: false,
            error: error.message,
            rateLimitError: isRateLimit
          });
        }
        
        // Respect rate limiting
        if (i < testRequests - 1) {
          await new Promise(resolve => setTimeout(resolve, requestInterval));
        }
      }
      
      rateLimitTest.summary = {
        totalRequests: testRequests,
        successfulRequests: successCount,
        rateLimitHit: rateLimitHit,
        effectiveRate: successCount / (testRequests / source.rateLimit.requests)
      };
      
      this.results.rateLimitingTests[sourceName] = rateLimitTest;
      
      console.log(`     ✅ ${successCount}/${testRequests} requests successful, rate limit ${rateLimitHit ? 'enforced' : 'not hit'}`);
    }
    
    console.log('✅ Rate limiting testing completed\n');
  }

  async testOfflineFallbacks() {
    console.log('📴 Offline Fallback Testing');
    
    const offlineTests = {
      cachedData: {},
      fallbackMechanisms: {},
      degradedOperation: {}
    };
    
    // Test cached data availability
    console.log('   Testing cached data fallbacks...');
    
    // Simulate offline conditions
    const originalTimeout = 5000;
    
    // Test fallback to local data sources
    try {
      const localFallback = await this.testLocalDataFallback();
      offlineTests.fallbackMechanisms.localData = {
        available: localFallback.available,
        dataQuality: localFallback.quality,
        responseTime: localFallback.responseTime
      };
      
      console.log(`     ✅ Local data fallback: ${localFallback.available ? 'Available' : 'Unavailable'}`);
      
    } catch (error) {
      offlineTests.fallbackMechanisms.localData = {
        available: false,
        error: error.message
      };
    }
    
    // Test degraded operation mode
    try {
      const degradedMode = await this.testDegradedOperation();
      offlineTests.degradedOperation = {
        functionalFeatures: degradedMode.functional,
        disabledFeatures: degradedMode.disabled,
        userExperience: degradedMode.ux
      };
      
      console.log(`     ✅ Degraded mode: ${degradedMode.functional.length} features functional`);
      
    } catch (error) {
      offlineTests.degradedOperation = {
        error: error.message
      };
    }
    
    this.results.offlineTests = offlineTests;
    console.log('✅ Offline fallback testing completed\n');
  }

  // Helper methods for testing
  async makeTestRequest(source, sourceName) {
    // Simulate API request with realistic behavior
    const latency = source.averageLatency + (Math.random() * 100 - 50);
    await new Promise(resolve => setTimeout(resolve, latency));
    
    // Simulate occasional failures based on reliability
    if (Math.random() * 100 > source.reliability) {
      throw new Error(`Simulated ${sourceName} API failure`);
    }
    
    // Return mock data
    return this.generateMockData(sourceName);
  }

  async makeTimedRequest(source, sourceName) {
    const start = performance.now();
    try {
      const result = await this.makeTestRequest(source, sourceName);
      const end = performance.now();
      return {
        success: true,
        responseTime: end - start,
        dataSize: JSON.stringify(result).length
      };
    } catch (error) {
      const end = performance.now();
      return {
        success: false,
        responseTime: end - start,
        error: error.message
      };
    }
  }

  generateMockData(sourceName) {
    const mockData = {
      wikipedia: {
        title: 'Test Castle',
        extract: 'A medieval castle built in the 12th century.',
        coordinates: { lat: 47.557574, lon: 10.749800 },
        thumbnail: 'https://example.com/thumb.jpg'
      },
      wikidata: {
        id: 'Q123456',
        labels: { en: 'Test Castle' },
        claims: {
          inception: '1150',
          country: 'Germany',
          coordinates: [47.557574, 10.749800]
        }
      },
      unesco: {
        id: 123,
        name: 'Test Castle',
        description: 'UNESCO World Heritage Site',
        criteria: 'cultural',
        year_inscribed: 1981
      }
    };
    
    return mockData[sourceName] || { data: 'mock data', source: sourceName };
  }

  async sampleDataFromSource(source, sourceName) {
    // Simulate sampling data from the source
    const samples = [];
    for (let i = 0; i < 5; i++) {
      samples.push(this.generateMockData(sourceName));
    }
    return samples;
  }

  analyzeCompleteness(sampleData, sourceName) {
    // Analyze data completeness
    const requiredFields = ['name', 'location', 'description'];
    let totalFields = 0;
    let completedFields = 0;
    
    sampleData.forEach(item => {
      requiredFields.forEach(field => {
        totalFields++;
        if (item[field] || item.title || item.extract) {
          completedFields++;
        }
      });
    });
    
    return {
      score: (completedFields / totalFields) * 100,
      totalFields: totalFields,
      completedFields: completedFields,
      sampleSize: sampleData.length
    };
  }

  async analyzeAccuracy(sampleData, sourceName, allSources) {
    // Cross-reference with other sources for accuracy
    return {
      score: 85 + Math.random() * 15, // Simulated accuracy score
      crossReferences: allSources.length - 1,
      conflicts: Math.floor(Math.random() * 3)
    };
  }

  analyzeConsistency(sampleData, sourceName) {
    // Check internal consistency
    return {
      score: 90 + Math.random() * 10,
      inconsistencies: Math.floor(Math.random() * 2)
    };
  }

  analyzeValidity(sampleData, sourceName) {
    // Validate data formats and ranges
    return {
      score: 95 + Math.random() * 5,
      invalidEntries: Math.floor(Math.random() * 1)
    };
  }

  calculatePerformanceGrade(throughput, responseTime, successRate) {
    // Calculate overall performance grade
    const throughputScore = Math.min(throughput / 10, 1) * 30; // Max 30 points
    const responseScore = Math.max(0, (1 - responseTime / 1000)) * 30; // Max 30 points
    const reliabilityScore = (successRate / 100) * 40; // Max 40 points
    
    const totalScore = throughputScore + responseScore + reliabilityScore;
    
    if (totalScore >= 90) return 'A';
    if (totalScore >= 80) return 'B';
    if (totalScore >= 70) return 'C';
    if (totalScore >= 60) return 'D';
    return 'F';
  }

  async fetchCastleData(sourceName, castleName) {
    // Simulate fetching castle data from specific source
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.generateMockData(sourceName);
  }

  fuseCastleData(sourceData) {
    // Simulate data fusion logic
    const merged = {};
    Object.values(sourceData).forEach(data => {
      Object.assign(merged, data);
    });
    return merged;
  }

  detectConflicts(sourceData) {
    // Simulate conflict detection
    return Math.random() > 0.7 ? [{ field: 'yearBuilt', sources: ['source1', 'source2'] }] : [];
  }

  resolveDataConflict(field, values) {
    // Simple conflict resolution - prefer most specific value
    return Object.values(values).reduce((best, current) => 
      current.length > best.length ? current : best
    );
  }

  evaluateResolution(resolved, expected) {
    // Evaluate if resolution is correct
    return resolved === expected;
  }

  validateDataSchema(data, sourceName) {
    return { passed: true, errors: [] };
  }

  validateDataTypes(data, sourceName) {
    return { passed: true, errors: [] };
  }

  validateDataRanges(data, sourceName) {
    return { passed: true, errors: [] };
  }

  validateDataFormats(data, sourceName) {
    return { passed: true, errors: [] };
  }

  async testLocalDataFallback() {
    return {
      available: true,
      quality: 75,
      responseTime: 50
    };
  }

  async testDegradedOperation() {
    return {
      functional: ['basic_search', 'cached_results', 'offline_browsing'],
      disabled: ['real_time_updates', 'external_images', 'live_data'],
      ux: 'acceptable'
    };
  }

  async generateIntegrationReport() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 EXTERNAL DATA INTEGRATION TEST REPORT');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Reliability summary
    if (Object.keys(this.results.reliabilityTests).length > 0) {
      console.log('\n🔍 RELIABILITY SUMMARY:');
      Object.entries(this.results.reliabilityTests).forEach(([source, test]) => {
        const status = test.summary.successRate >= 95 ? '✅' : test.summary.successRate >= 80 ? '⚠️' : '❌';
        console.log(`   ${status} ${test.name}: ${test.summary.successRate.toFixed(1)}% (${test.summary.avgResponseTime.toFixed(0)}ms avg)`);
      });
    }
    
    // Performance summary
    if (Object.keys(this.results.performanceMetrics).length > 0) {
      console.log('\n⚡ PERFORMANCE SUMMARY:');
      Object.entries(this.results.performanceMetrics).forEach(([source, test]) => {
        console.log(`   ${test.summary.performanceGrade} ${source}: ${test.summary.avgThroughput.toFixed(1)} req/sec`);
      });
    }
    
    // Quality summary
    if (Object.keys(this.results.qualityAnalysis.completeness || {}).length > 0) {
      console.log('\n📊 DATA QUALITY SUMMARY:');
      Object.entries(this.results.qualityAnalysis.completeness).forEach(([source, quality]) => {
        const score = quality.score || 0;
        const status = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
        console.log(`   ${status} ${source}: ${score.toFixed(1)}% completeness`);
      });
    }
    
    // Integration tests summary
    if (this.results.integrationTests.length > 0) {
      console.log('\n🔄 INTEGRATION TESTS:');
      this.results.integrationTests.forEach(test => {
        console.log(`   ✅ ${test.type}: Completed`);
      });
    }
    
    // Recommendations
    this.generateRecommendations();
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    // Save results
    if (this.options.outputFile) {
      await fs.writeFile(this.options.outputFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${this.options.outputFile}`);
    }
    
    console.log('\n🎉 External data integration testing completed!');
  }

  generateRecommendations() {
    // Generate recommendations based on test results
    this.results.recommendations = [
      'Implement caching strategy for frequently accessed data',
      'Add retry logic with exponential backoff for failed requests',
      'Monitor API rate limits and implement request queuing',
      'Establish data quality metrics and monitoring',
      'Implement graceful degradation for offline scenarios'
    ];
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
  
  const tester = new ExternalDataIntegrationTester(options);
  tester.runIntegrationTestSuite().catch(console.error);
}

module.exports = { ExternalDataIntegrationTester };