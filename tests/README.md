# Testing Framework for Generate-and-Grow.js

Complete testing suite for the self-expanding Castles Over The World encyclopedia system.

## Framework Structure

```
tests/
├── unit/                           # Unit tests for individual components
│   ├── castle-validation.test.js   # Castle data validation logic
│   ├── html-generation.test.js     # HTML output validation  
│   ├── file-operations.test.js     # File system operations
│   └── error-handling.test.js      # Error recovery mechanisms
├── integration/                    # Integration tests
│   └── generate-and-grow.integration.test.js  # Full workflow testing
├── system/                         # End-to-end system tests
│   └── full-system.test.js         # Complete system validation
└── fixtures/                       # Test data and utilities
    └── mock-data.js                # Mock castles, HTML, CSS, test utilities
```

## Test Categories

### Unit Tests (Component Level)
- **Castle Validation**: Structure, types, uniqueness, real-world data validation
- **HTML Generation**: Semantic structure, CSS linking, accessibility, content validation  
- **File Operations**: Directory structure, JSON handling, CSS validation, permissions
- **Error Handling**: Corruption recovery, missing files, concurrent operations

### Integration Tests (Workflow Level)
- **Self-Expansion**: Adding new castles without duplicates
- **Website Regeneration**: Complete HTML rebuilding on each run
- **Performance**: Execution time limits and scalability
- **Error Recovery**: Graceful handling of various failure scenarios

### System Tests (End-to-End)
- **Complete Workflow**: Full generate-and-grow.js execution cycle
- **Production Readiness**: SEO, accessibility, mobile responsiveness
- **Multi-Run Validation**: Continuous expansion verification

## Running Tests

### Prerequisites
```bash
npm install  # Install Jest and dependencies
```

### Test Execution Options

```bash
# Run all tests
node test-runner.js
# or
npm test

# Run specific test categories
node test-runner.js unit
node test-runner.js integration  
node test-runner.js system

# Run with Jest directly
npm run test:unit
npm run test:integration
npm run test:coverage
```

### Test Dependencies

Tests are designed to work with or without generate-and-grow.js:
- **With script**: Full integration and system testing
- **Without script**: Unit tests and validation logic testing
- **Missing dependencies**: Graceful degradation with informative messages

## Test Scenarios

### Self-Expansion Validation
- Verifies exactly one new castle added per execution
- Prevents duplicate castle entries (by ID and name)
- Validates castle data structure and types
- Ensures real-world castle data (no mock/test content)

### File Generation Testing
- Validates complete directory structure creation
- Tests individual castle HTML page generation
- Verifies index.html with all castle links
- Confirms CSS file creation and validity

### Website Output Validation
- HTML5 structure and semantic markup
- CSS linking and responsive design indicators
- Accessibility compliance (titles, alt text, lang attributes)
- SEO-friendly meta tags and structure

### Error Handling Coverage
- JSON corruption recovery
- Missing directory recreation
- Permission-denied scenarios
- Large file handling
- Concurrent operation safety

## Mock Data and Fixtures

### Available Test Data
- **Valid Castles**: Neuschwanstein, Edinburgh, Windsor with complete data
- **Invalid Castles**: Missing fields, wrong types, empty values
- **Suspicious Data**: Test/mock content detection
- **HTML Templates**: Valid/invalid castle pages and index
- **CSS Templates**: Complete styling with responsive design
- **File System Mocks**: Project structure simulation

### Test Utilities
- `createMockProject()`: Sets up complete test environment
- `createCorruptedProject()`: Creates error conditions for testing  
- `randomCastle()`: Generates unique test castle data
- Validation helpers for all components

## Integration with CI/CD

### Exit Codes
- `0`: All tests passed
- `1`: One or more tests failed
- Error output includes detailed failure information

### Coverage Reports
```bash
npm run test:coverage  # Generates coverage reports in coverage/
```

### Performance Benchmarks
- Individual execution: < 30 seconds
- Multiple runs: < 15 seconds average
- Large datasets: Handles 1000+ castles efficiently

## Testing Philosophy

### Comprehensive Coverage
Tests validate both success and failure scenarios with emphasis on:
- Data integrity and validation
- File system resilience  
- HTML/CSS output quality
- Performance and scalability
- Error recovery and logging

### Production Readiness
Tests ensure the generated website meets production standards:
- SEO optimization
- Accessibility compliance
- Mobile responsiveness
- Performance optimization

### Continuous Validation
Framework supports ongoing development with:
- Automated test execution
- Detailed error reporting
- Performance monitoring
- Regression prevention

## Framework Features

### Adaptive Testing
- Tests run with or without main script
- Graceful degradation for missing components
- Informative skip messages for pending features

### Isolated Environments
- Each test runs in clean workspace
- No interference between test runs
- Automatic cleanup after execution

### Comprehensive Logging
- Detailed test execution reporting
- Error output with debugging information
- Performance metrics and timing data

This testing framework ensures the generate-and-grow.js system maintains reliability, performance, and quality as it continuously expands the castle encyclopedia.