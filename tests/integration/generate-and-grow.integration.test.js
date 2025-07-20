const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

describe('Generate-and-Grow Integration Tests', () => {
  let testDir;
  let originalDir;

  beforeEach(async () => {
    // Create isolated test environment
    originalDir = process.cwd();
    testDir = path.join(__dirname, '..', 'test-workspace');
    await fs.ensureDir(testDir);
    await fs.emptyDir(testDir);
    process.chdir(testDir);
    
    // Copy generate-and-grow.js to test directory
    const sourceFile = path.join(originalDir, 'generate-and-grow.js');
    if (await fs.pathExists(sourceFile)) {
      await fs.copy(sourceFile, path.join(testDir, 'generate-and-grow.js'));
    }
  });

  afterEach(async () => {
    process.chdir(originalDir);
    await fs.remove(testDir);
  });

  describe('Initial Project Setup', () => {
    test('should create required directory structure on first run', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      await execAsync('node generate-and-grow.js');

      // Verify directory structure
      expect(await fs.pathExists('articles')).toBe(true);
      expect(await fs.pathExists('castles.json')).toBe(true);
      expect(await fs.pathExists('style.css')).toBe(true);
      expect(await fs.pathExists('index.html')).toBe(true);
    });

    test('should initialize empty castles.json if it does not exist', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      await execAsync('node generate-and-grow.js');
      
      const castlesData = await fs.readJson('castles.json');
      expect(Array.isArray(castlesData)).toBe(true);
      expect(castlesData.length).toBeGreaterThan(0); // Should have at least one castle after first run
    });
  });

  describe('Self-Expansion Functionality', () => {
    test('should add exactly one new castle on each execution', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      // First execution
      await execAsync('node generate-and-grow.js');
      const firstRun = await fs.readJson('castles.json');
      const initialCount = firstRun.length;

      // Second execution
      await execAsync('node generate-and-grow.js');
      const secondRun = await fs.readJson('castles.json');
      
      expect(secondRun.length).toBe(initialCount + 1);
    });

    test('should not add duplicate castles', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      // Run multiple times
      for (let i = 0; i < 3; i++) {
        await execAsync('node generate-and-grow.js');
      }

      const castlesData = await fs.readJson('castles.json');
      const castleNames = castlesData.map(castle => castle.castleName);
      const uniqueNames = [...new Set(castleNames)];
      
      expect(uniqueNames.length).toBe(castleNames.length);
    });

    test('should validate castle object structure', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      await execAsync('node generate-and-grow.js');
      const castlesData = await fs.readJson('castles.json');
      
      castlesData.forEach(castle => {
        expect(castle).toHaveProperty('id');
        expect(castle).toHaveProperty('castleName');
        expect(castle).toHaveProperty('country');
        expect(castle).toHaveProperty('location');
        expect(castle).toHaveProperty('architecturalStyle');
        expect(castle).toHaveProperty('yearBuilt');
        expect(castle).toHaveProperty('shortDescription');
        expect(castle).toHaveProperty('keyFeatures');
        
        expect(typeof castle.id).toBe('string');
        expect(typeof castle.castleName).toBe('string');
        expect(typeof castle.country).toBe('string');
        expect(typeof castle.location).toBe('string');
        expect(typeof castle.architecturalStyle).toBe('string');
        expect(typeof castle.yearBuilt).toBe('string');
        expect(typeof castle.shortDescription).toBe('string');
        expect(Array.isArray(castle.keyFeatures)).toBe(true);
      });
    });
  });

  describe('Website Generation', () => {
    test('should create individual HTML pages for each castle', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      await execAsync('node generate-and-grow.js');
      const castlesData = await fs.readJson('castles.json');
      
      for (const castle of castlesData) {
        const htmlPath = path.join('articles', `${castle.id}.html`);
        expect(await fs.pathExists(htmlPath)).toBe(true);
        
        const htmlContent = await fs.readFile(htmlPath, 'utf8');
        expect(htmlContent).toContain(castle.castleName);
        expect(htmlContent).toContain('<h1>');
        expect(htmlContent).toContain('style.css');
      }
    });

    test('should create index.html with links to all castle pages', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      await execAsync('node generate-and-grow.js');
      const castlesData = await fs.readJson('castles.json');
      const indexContent = await fs.readFile('index.html', 'utf8');
      
      castlesData.forEach(castle => {
        expect(indexContent).toContain(`articles/${castle.id}.html`);
        expect(indexContent).toContain(castle.castleName);
      });
      
      expect(indexContent).toContain('style.css');
    });

    test('should regenerate entire website on each run', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      // First run
      await execAsync('node generate-and-grow.js');
      const firstRunFiles = await fs.readdir('articles');
      
      // Second run
      await execAsync('node generate-and-grow.js');
      const secondRunFiles = await fs.readdir('articles');
      const castlesData = await fs.readJson('castles.json');
      
      expect(secondRunFiles.length).toBe(castlesData.length);
      expect(secondRunFiles.length).toBeGreaterThan(firstRunFiles.length);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle corrupted castles.json gracefully', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      // Create corrupted JSON
      await fs.writeFile('castles.json', '{ invalid json }');
      
      await expect(execAsync('node generate-and-grow.js')).resolves.not.toThrow();
      
      // Verify recovery
      const castlesData = await fs.readJson('castles.json');
      expect(Array.isArray(castlesData)).toBe(true);
    });

    test('should handle missing directories gracefully', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      // Remove articles directory
      await fs.remove('articles');
      
      await expect(execAsync('node generate-and-grow.js')).resolves.not.toThrow();
      
      expect(await fs.pathExists('articles')).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle execution within reasonable time', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      const startTime = Date.now();
      await execAsync('node generate-and-grow.js');
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds
    }, 35000);

    test('should maintain performance with multiple castles', async () => {
      if (!await fs.pathExists('generate-and-grow.js')) {
        console.log('generate-and-grow.js not found, skipping test');
        return;
      }

      // Run multiple times to build up data
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await execAsync('node generate-and-grow.js');
        const executionTime = Date.now() - startTime;
        
        expect(executionTime).toBeLessThan(30000);
      }
    }, 180000);
  });
});