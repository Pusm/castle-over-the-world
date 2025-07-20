# Unlimited Scalability Testing Framework

Comprehensive testing suite for castle encyclopedia system supporting 10,000+ castles with external data integration.

## Quick Start

```bash
# Run complete testing suite
node test-runner.js --suite all --castles 100 --report results.json

# Quick performance test
node test-runner.js --suite performance --castles 50

# Stress testing only
node test-runner.js --suite stress --duration 120 --intensity 7
```

## Test Suites

### 1. Performance Benchmarking (`performance-benchmark-100plus.js`)
Tests generation speed and scalability limits for 100+ castles.

**Features:**
- Single-threaded vs multi-threaded performance comparison
- Memory usage profiling and optimization
- Batch size optimization analysis
- File I/O performance testing
- Scalability limits discovery

**Usage:**
```bash
node performance-benchmark-100plus.js --castles 100 --iterations 5 --memory --output perf-results.json
```

### 2. Stress Testing (`stress-testing-automation.js`)
Comprehensive system limits evaluation and failure recovery testing.

**Test Modes:**
- `memory`: Memory exhaustion testing
- `cpu`: CPU-intensive load testing  
- `io`: File I/O stress testing
- `concurrent`: Concurrent operations testing
- `burst`: Burst load testing
- `network`: Network stress simulation

**Usage:**
```bash
node stress-testing-automation.js --mode concurrent --duration 300 --intensity 8 --recovery
```

### 3. External Data Integration (`external-data-integration-testing.js`)
Tests integration with external data sources for unlimited castle expansion.

**Data Sources:**
- Wikipedia API
- Wikidata Query Service
- UNESCO World Heritage API
- OpenStreetMap Nominatim
- DBpedia SPARQL Endpoint

**Test Modes:**
- `reliability`: API uptime and response testing
- `quality`: Data completeness and accuracy analysis
- `performance`: API response time and throughput
- `integration`: End-to-end data fusion testing

**Usage:**
```bash
node external-data-integration-testing.js --sources wiki,unesco --mode integration --rate-limit
```

### 4. Master Test Runner (`test-runner.js`)
Orchestrates all test suites with consolidated reporting.

**Test Suites:**
- `all`: Complete testing suite (recommended)
- `performance`: Performance benchmarking only
- `stress`: Stress testing only
- `integration`: External data integration only
- `quick`: Fast performance test

**Usage:**
```bash
node test-runner.js --suite all --parallel --verbose --report consolidated-results.json
```

## Test Framework Architecture

```
tests/scalability/
├── unlimited-scalability-testing-framework.md    # Framework specification
├── performance-benchmark-100plus.js              # Performance testing
├── stress-testing-automation.js                  # Stress testing
├── external-data-integration-testing.js          # Data integration testing
├── test-runner.js                                # Master orchestrator
└── README.md                                     # This file
```

## Performance Targets

### Minimum Viable Performance
- ✅ Generate 100 castles in <2 seconds
- ✅ Handle 10 concurrent users
- ✅ 99.9% uptime during testing
- ✅ <1% error rate in castle generation

### Optimal Performance Targets
- 🎯 Generate 1000 castles in <30 seconds
- 🎯 Handle 100 concurrent users  
- 🎯 99.99% uptime during testing
- 🎯 <0.1% error rate in castle generation
- 🎯 Support for 10,000+ castle database

## Key Metrics Tracked

### Performance Metrics
- **Throughput**: Castles generated per second
- **Latency**: Time from request to completion
- **Memory Efficiency**: Memory usage per castle
- **Parallel Efficiency**: Speedup from multi-threading
- **I/O Performance**: File read/write speeds

### Reliability Metrics  
- **Success Rate**: Percentage of successful operations
- **Error Rate**: Percentage of failed operations
- **Recovery Time**: Time to recover from failures
- **System Stability**: Uptime percentage
- **Load Capacity**: Maximum concurrent operations

### Data Quality Metrics
- **Completeness**: Percentage of complete data fields
- **Accuracy**: Cross-validation with multiple sources
- **Consistency**: Internal data consistency
- **Timeliness**: Data freshness and update frequency
- **Validity**: Data format and range validation

## Example Test Results

```json
{
  "summary": {
    "overallResult": "PASSED",
    "performanceGrade": "B",
    "readyForProduction": true
  },
  "consolidatedMetrics": {
    "performance": {
      "maxCastlesPerSecond": 45.2,
      "parallelEfficiency": 3.1,
      "memoryEfficiency": 524288
    },
    "reliability": {
      "systemStability": 97.8,
      "failureRecovery": true
    }
  }
}
```

## Troubleshooting

### Common Issues

**Memory Exhaustion:**
```bash
# Reduce test scale
node test-runner.js --castles 50 --suite performance
```

**Network Timeouts:**
```bash
# Use offline mode for integration tests
node external-data-integration-testing.js --offline
```

**Performance Degradation:**
```bash
# Run stress tests to identify bottlenecks
node stress-testing-automation.js --mode cpu --monitor
```

### System Requirements

**Minimum:**
- Node.js 14+
- 2GB RAM
- 1GB disk space
- Internet connection (for integration tests)

**Recommended:**
- Node.js 18+
- 8GB RAM
- 5GB disk space
- High-speed internet connection

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Scalability Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node tests/scalability/test-runner.js --suite quick
      - run: node tests/scalability/test-runner.js --suite stress --duration 60
```

### Performance Monitoring
```bash
# Set up continuous monitoring
node test-runner.js --suite performance --iterations 1 > daily-perf.log 2>&1
```

## Advanced Configuration

### Custom Test Parameters
```javascript
// Example custom configuration
const customOptions = {
  performance: {
    castles: 500,
    iterations: 10,
    parallel: 8,
    memory: true
  },
  stress: {
    mode: 'concurrent',
    duration: 600,
    intensity: 9,
    recovery: true
  },
  integration: {
    sources: ['wiki', 'wikidata', 'unesco'],
    mode: 'integration',
    timeout: 30000
  }
};
```

### Environment Variables
```bash
export CASTLE_TEST_TIMEOUT=3600        # Test timeout in seconds
export CASTLE_TEST_PARALLEL=4          # Parallel workers
export CASTLE_TEST_MEMORY_LIMIT=4096   # Memory limit in MB
export CASTLE_TEST_VERBOSE=true        # Enable verbose output
```

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Include comprehensive error handling
3. Add progress monitoring for long-running tests
4. Document expected results and thresholds
5. Include cleanup procedures

### Test Development Guidelines

```javascript
// Example test structure
class NewTestSuite {
  constructor(options = {}) {
    this.options = { ...defaultOptions, ...options };
    this.results = { testConfig: this.options };
  }

  async runTest() {
    try {
      // Pre-test setup
      await this.setup();
      
      // Execute tests
      await this.executeTests();
      
      // Generate results
      await this.generateReport();
      
    } finally {
      // Cleanup
      await this.cleanup();
    }
  }
}
```

## Support

For issues or questions:

1. Check system requirements and common issues
2. Review test logs for specific error messages
3. Run individual test suites to isolate problems
4. Verify network connectivity for integration tests

## License

This testing framework is part of the Castle Encyclopedia project.