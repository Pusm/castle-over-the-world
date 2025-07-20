#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, skipped: 0 },
      integration: { passed: 0, failed: 0, skipped: 0 },
      system: { passed: 0, failed: 0, skipped: 0 }
    };
  }

  async runTests(testType = 'all') {
    console.log('🏰 Castles Over The World - Testing Framework');
    console.log('============================================');
    
    // Check if generate-and-grow.js exists
    const mainScript = path.join(__dirname, 'generate-and-grow.js');
    const scriptExists = await fs.pathExists(mainScript);
    
    if (!scriptExists) {
      console.log('⚠️  generate-and-grow.js not found - Limited testing available');
      console.log('   Some integration and system tests will be skipped');
    }

    try {
      switch (testType) {
        case 'unit':
          await this.runUnitTests();
          break;
        case 'integration':
          await this.runIntegrationTests();
          break;
        case 'system':
          await this.runSystemTests();
          break;
        case 'all':
        default:
          await this.runUnitTests();
          await this.runIntegrationTests();
          await this.runSystemTests();
          break;
      }
      
      this.printSummary();
      
      // Exit with non-zero if any tests failed
      const totalFailed = this.results.unit.failed + 
                         this.results.integration.failed + 
                         this.results.system.failed;
      
      if (totalFailed > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    }
  }

  async runUnitTests() {
    console.log('\n📋 Running Unit Tests...');
    console.log('-------------------------');
    
    const unitTests = [
      'tests/unit/castle-validation.test.js',
      'tests/unit/html-generation.test.js', 
      'tests/unit/file-operations.test.js',
      'tests/unit/error-handling.test.js'
    ];
    
    for (const testFile of unitTests) {
      if (await fs.pathExists(testFile)) {
        await this.runJestTest(testFile, 'unit');
      } else {
        console.log(`⚠️  Unit test not found: ${testFile}`);
        this.results.unit.skipped++;
      }
    }
  }

  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    console.log('--------------------------------');
    
    const integrationTests = [
      'tests/integration/generate-and-grow.integration.test.js'
    ];
    
    for (const testFile of integrationTests) {
      if (await fs.pathExists(testFile)) {
        await this.runJestTest(testFile, 'integration');
      } else {
        console.log(`⚠️  Integration test not found: ${testFile}`);
        this.results.integration.skipped++;
      }
    }
  }

  async runSystemTests() {
    console.log('\n🌐 Running System Tests...');
    console.log('---------------------------');
    
    const systemTests = [
      'tests/system/full-system.test.js'
    ];
    
    for (const testFile of systemTests) {
      if (await fs.pathExists(testFile)) {
        await this.runJestTest(testFile, 'system');
      } else {
        console.log(`⚠️  System test not found: ${testFile}`);
        this.results.system.skipped++;
      }
    }
  }

  runJestTest(testFile, category) {
    return new Promise((resolve) => {
      console.log(`   Running: ${path.basename(testFile)}`);
      
      const jest = spawn('npx', ['jest', testFile, '--verbose'], {
        stdio: 'pipe'
      });
      
      let output = '';
      
      jest.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      jest.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      jest.on('close', (code) => {
        if (code === 0) {
          console.log(`   ✅ Passed: ${path.basename(testFile)}`);
          this.results[category].passed++;
        } else {
          console.log(`   ❌ Failed: ${path.basename(testFile)}`);
          console.log(`      Exit code: ${code}`);
          this.results[category].failed++;
          
          // Print error output for debugging
          if (output.includes('Error') || output.includes('Failed')) {
            console.log('      Error details:');
            const lines = output.split('\n');
            lines.slice(-10).forEach(line => {
              if (line.trim()) console.log(`      ${line}`);
            });
          }
        }
        resolve();
      });
    });
  }

  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('===============');
    
    const categories = ['unit', 'integration', 'system'];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    
    categories.forEach(category => {
      const result = this.results[category];
      const total = result.passed + result.failed + result.skipped;
      
      if (total > 0) {
        console.log(`${category.toUpperCase()} Tests:`);
        console.log(`   ✅ Passed: ${result.passed}`);
        console.log(`   ❌ Failed: ${result.failed}`);
        console.log(`   ⚠️  Skipped: ${result.skipped}`);
        console.log(`   Total: ${total}`);
        console.log('');
      }
      
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalSkipped += result.skipped;
    });
    
    console.log('OVERALL RESULTS:');
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`⚠️  Total Skipped: ${totalSkipped}`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n💥 ${totalFailed} test(s) failed`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const testType = process.argv[2] || 'all';
  const runner = new TestRunner();
  runner.runTests(testType);
}

module.exports = TestRunner;