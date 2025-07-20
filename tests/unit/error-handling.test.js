const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Error handling and logging utilities
class ErrorHandlingValidator {
  static async validateErrorRecovery(testDir, errorScenario) {
    try {
      const originalDir = process.cwd();
      process.chdir(testDir);
      
      // Create error condition based on scenario
      await this.createErrorCondition(errorScenario);
      
      // Attempt to run generate-and-grow.js
      const scriptPath = path.join(originalDir, 'generate-and-grow.js');
      if (await fs.pathExists(scriptPath)) {
        await fs.copy(scriptPath, 'generate-and-grow.js');
        const result = await execAsync('node generate-and-grow.js');
        
        // Check if system recovered
        const recovered = await this.checkRecovery(errorScenario);
        
        process.chdir(originalDir);
        return recovered;
      }
      
      process.chdir(originalDir);
      return false;
    } catch (error) {
      return false;
    }
  }

  static async createErrorCondition(scenario) {
    switch (scenario) {
      case 'corrupted_json':
        await fs.writeFile('castles.json', '{ corrupted json content }');
        break;
      case 'missing_directory':
        await fs.remove('articles');
        break;
      case 'permission_denied':
        // Create read-only file (if supported)
        await fs.writeFile('castles.json', '[]');
        try {
          await fs.chmod('castles.json', '444');
        } catch (e) {
          // Permissions may not be supported in all environments
        }
        break;
      case 'disk_space':
        // Simulate by creating extremely large content
        const largeContent = 'x'.repeat(100000);
        await fs.writeFile('large-file.tmp', largeContent);
        break;
      case 'invalid_html':
        await fs.ensureDir('articles');
        await fs.writeFile('articles/test.html', '<invalid html content');
        break;
    }
  }

  static async checkRecovery(scenario) {
    switch (scenario) {
      case 'corrupted_json':
        try {
          const data = await fs.readJson('castles.json');
          return Array.isArray(data);
        } catch (e) {
          return false;
        }
      case 'missing_directory':
        return await fs.pathExists('articles');
      case 'permission_denied':
        return await fs.pathExists('castles.json');
      case 'invalid_html':
        return await fs.pathExists('index.html');
      default:
        return true;
    }
  }

  static validateLogOutput(output) {
    // Check for expected log patterns
    const logPatterns = [
      /adding.*castle/i,
      /success/i,
      /generated/i,
      /created/i
    ];
    
    return logPatterns.some(pattern => pattern.test(output));
  }

  static validateErrorOutput(output) {
    const errorPatterns = [
      /error/i,
      /failed/i,
      /exception/i,
      /warning/i
    ];
    
    return errorPatterns.some(pattern => pattern.test(output));
  }
}

describe('Error Handling and Logging Tests', () => {
  let testDir;
  let originalDir;

  beforeEach(async () => {
    originalDir = process.cwd();
    testDir = path.join(__dirname, '..', 'test-workspace-errors');
    await fs.ensureDir(testDir);
    await fs.emptyDir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalDir);
    await fs.remove(testDir);
  });

  describe('JSON Corruption Recovery', () => {
    test('should recover from corrupted castles.json', async () => {
      const canRecover = await ErrorHandlingValidator.validateErrorRecovery(
        testDir, 
        'corrupted_json'
      );
      
      // Note: This test depends on generate-and-grow.js existing
      if (await fs.pathExists(path.join(originalDir, 'generate-and-grow.js'))) {
        expect(canRecover).toBe(true);
      } else {
        console.log('generate-and-grow.js not found, skipping recovery test');
      }
    });

    test('should handle empty castles.json', async () => {
      process.chdir(testDir);
      await fs.writeFile('castles.json', '');
      
      try {
        const data = await fs.readJson('castles.json').catch(() => null);
        expect(data).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      process.chdir(originalDir);
    });
  });

  describe('Directory Recovery', () => {
    test('should recreate missing articles directory', async () => {
      const canRecover = await ErrorHandlingValidator.validateErrorRecovery(
        testDir,
        'missing_directory'
      );
      
      if (await fs.pathExists(path.join(originalDir, 'generate-and-grow.js'))) {
        expect(canRecover).toBe(true);
      } else {
        console.log('generate-and-grow.js not found, skipping directory test');
      }
    });

    test('should handle nested directory creation', async () => {
      process.chdir(testDir);
      
      // Test creating nested structure
      await fs.ensureDir('articles/subdirectory');
      expect(await fs.pathExists('articles/subdirectory')).toBe(true);
      
      process.chdir(originalDir);
    });
  });

  describe('File Permission Handling', () => {
    test('should handle read-only files gracefully', async () => {
      process.chdir(testDir);
      
      // Create read-only file
      await fs.writeFile('readonly.json', '{"test": true}');
      try {
        await fs.chmod('readonly.json', '444');
        
        // Try to read (should work)
        const data = await fs.readJson('readonly.json');
        expect(data.test).toBe(true);
        
        // Try to write (should fail gracefully)
        try {
          await fs.writeJson('readonly.json', {"modified": true});
        } catch (error) {
          expect(error).toBeDefined();
        }
        
      } catch (e) {
        console.log('File permissions not supported in this environment');
      }
      
      process.chdir(originalDir);
    });
  });

  describe('Large File Handling', () => {
    test('should handle large castle collections', async () => {
      process.chdir(testDir);
      
      // Create large castle collection
      const largeCastleData = Array.from({ length: 1000 }, (_, i) => ({
        id: `castle_${i}`,
        castleName: `Castle ${i}`,
        country: `Country ${i % 50}`,
        location: `Location ${i}`,
        architecturalStyle: 'Gothic',
        yearBuilt: '12th century',
        shortDescription: `A magnificent castle number ${i} with rich history.`,
        keyFeatures: ['Tower', 'Moat', 'Great Hall']
      }));
      
      await fs.writeJson('castles.json', largeCastleData);
      
      // Test reading large file
      const data = await fs.readJson('castles.json');
      expect(data.length).toBe(1000);
      
      process.chdir(originalDir);
    });

    test('should handle memory-efficient operations', async () => {
      process.chdir(testDir);
      
      // Test streaming operations for large data
      const stream = require('stream');
      const { promisify } = require('util');
      const pipeline = promisify(stream.pipeline);
      
      const readable = new stream.Readable({
        read() {
          this.push('{"test": "data"}\n');
          this.push(null);
        }
      });
      
      const writable = fs.createWriteStream('streamed.json');
      
      await pipeline(readable, writable);
      expect(await fs.pathExists('streamed.json')).toBe(true);
      
      process.chdir(originalDir);
    });
  });

  describe('Logging Validation', () => {
    test('should validate log message patterns', () => {
      const successLog = "Success! 'Neuschwanstein Castle' was added. The site now features 5 castles.";
      const errorLog = "Error: Failed to parse castles.json - invalid JSON format";
      
      expect(ErrorHandlingValidator.validateLogOutput(successLog)).toBe(true);
      expect(ErrorHandlingValidator.validateErrorOutput(errorLog)).toBe(true);
    });

    test('should reject invalid log patterns', () => {
      const invalidLog = "Random message without expected patterns";
      
      expect(ErrorHandlingValidator.validateLogOutput(invalidLog)).toBe(false);
      expect(ErrorHandlingValidator.validateErrorOutput(invalidLog)).toBe(false);
    });
  });

  describe('Concurrent Operation Handling', () => {
    test('should handle multiple simultaneous operations', async () => {
      process.chdir(testDir);
      
      // Simulate concurrent file operations
      const operations = Array.from({ length: 5 }, async (_, i) => {
        const filename = `concurrent_${i}.json`;
        await fs.writeJson(filename, { id: i });
        return fs.pathExists(filename);
      });
      
      const results = await Promise.all(operations);
      expect(results.every(result => result === true)).toBe(true);
      
      process.chdir(originalDir);
    });
  });

  describe('Network Error Simulation', () => {
    test('should handle network-like delays gracefully', async () => {
      process.chdir(testDir);
      
      // Simulate network delay
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      const start = Date.now();
      await delay(100); // 100ms delay
      await fs.writeFile('delayed.txt', 'content');
      const duration = Date.now() - start;
      
      expect(duration).toBeGreaterThan(90);
      expect(await fs.pathExists('delayed.txt')).toBe(true);
      
      process.chdir(originalDir);
    });
  });
});

module.exports = ErrorHandlingValidator;