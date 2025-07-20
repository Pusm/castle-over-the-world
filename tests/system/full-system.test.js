const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { testUtils, mockCastles } = require('../fixtures/mock-data');
const CastleValidator = require('../unit/castle-validation.test');
const HTMLValidator = require('../unit/html-generation.test');
const FileSystemValidator = require('../unit/file-operations.test');

const execAsync = promisify(exec);

describe('Full System Integration Tests', () => {
  let testDir;
  let originalDir;

  beforeAll(async () => {
    originalDir = process.cwd();
    testDir = path.join(__dirname, '..', 'full-system-test');
    await fs.ensureDir(testDir);
    await fs.emptyDir(testDir);
  });

  afterAll(async () => {
    process.chdir(originalDir);
    await fs.remove(testDir);
  });

  describe('Complete System Validation', () => {
    test('should validate entire generate-and-grow.js workflow', async () => {
      const sourceFile = path.join(originalDir, 'generate-and-grow.js');
      
      if (!await fs.pathExists(sourceFile)) {
        console.log('generate-and-grow.js not found - System integration pending Worker1 completion');
        return;
      }

      process.chdir(testDir);
      await fs.copy(sourceFile, 'generate-and-grow.js');

      // Run the script multiple times to test self-expansion
      for (let i = 0; i < 3; i++) {
        const { stdout, stderr } = await execAsync('node generate-and-grow.js');
        
        // Validate output logging
        expect(stdout || stderr).toMatch(/castle|success|generated|added/i);
        
        // Validate file system state
        expect(await FileSystemValidator.validateDirectoryStructure('.')).toBe(true);
        
        // Validate castle data
        const castlesData = await fs.readJson('castles.json');
        expect(castlesData.length).toBe(i + 1);
        
        castlesData.forEach(castle => {
          expect(CastleValidator.validateStructure(castle)).toBe(true);
          expect(CastleValidator.validateTypes(castle)).toBe(true);
          expect(CastleValidator.validateIdFormat(castle.id)).toBe(true);
        });
        
        expect(CastleValidator.validateUniqueness(castlesData)).toBe(true);
        
        // Validate HTML generation
        const indexContent = await fs.readFile('index.html', 'utf8');
        expect(HTMLValidator.validateHTMLStructure(indexContent)).toBe(true);
        expect(HTMLValidator.validateCSSLinking(indexContent)).toBe(true);
        expect(HTMLValidator.validateIndexLinks(indexContent, castlesData)).toBe(true);
        
        // Validate individual castle pages
        for (const castle of castlesData) {
          const articlePath = path.join('articles', `${castle.id}.html`);
          expect(await fs.pathExists(articlePath)).toBe(true);
          
          const articleContent = await fs.readFile(articlePath, 'utf8');
          expect(HTMLValidator.validateHTMLStructure(articleContent)).toBe(true);
          expect(HTMLValidator.validateCastleContent(articleContent, castle)).toBe(true);
        }
        
        // Validate CSS
        expect(await FileSystemValidator.validateCSSFile('style.css')).toBe(true);
      }

      process.chdir(originalDir);
    }, 60000);

    test('should handle error recovery in full system', async () => {
      const sourceFile = path.join(originalDir, 'generate-and-grow.js');
      
      if (!await fs.pathExists(sourceFile)) {
        console.log('generate-and-grow.js not found - Error recovery testing pending');
        return;
      }

      process.chdir(testDir);
      await fs.copy(sourceFile, 'generate-and-grow.js');
      
      // First run to establish baseline
      await execAsync('node generate-and-grow.js');
      
      // Corrupt the JSON file
      await fs.writeFile('castles.json', '{ corrupted json }');
      
      // Run again - should recover
      await execAsync('node generate-and-grow.js');
      
      // Validate recovery
      const recoveredData = await fs.readJson('castles.json');
      expect(Array.isArray(recoveredData)).toBe(true);
      expect(recoveredData.length).toBeGreaterThan(0);
      
      process.chdir(originalDir);
    }, 30000);

    test('should maintain performance with multiple executions', async () => {
      const sourceFile = path.join(originalDir, 'generate-and-grow.js');
      
      if (!await fs.pathExists(sourceFile)) {
        console.log('generate-and-grow.js not found - Performance testing pending');
        return;
      }

      process.chdir(testDir);
      await fs.copy(sourceFile, 'generate-and-grow.js');
      
      const executionTimes = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await execAsync('node generate-and-grow.js');
        const executionTime = Date.now() - startTime;
        
        executionTimes.push(executionTime);
        expect(executionTime).toBeLessThan(30000);
      }
      
      // Performance should not degrade significantly
      const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      expect(avgTime).toBeLessThan(15000);
      
      process.chdir(originalDir);
    }, 180000);
  });

  describe('Production Readiness Validation', () => {
    test('should validate SEO and accessibility', async () => {
      const sourceFile = path.join(originalDir, 'generate-and-grow.js');
      
      if (!await fs.pathExists(sourceFile)) {
        console.log('generate-and-grow.js not found - SEO validation pending');
        return;
      }

      process.chdir(testDir);
      await fs.copy(sourceFile, 'generate-and-grow.js');
      await execAsync('node generate-and-grow.js');
      
      // Validate index page SEO
      const indexContent = await fs.readFile('index.html', 'utf8');
      expect(HTMLValidator.validateAccessibility(indexContent)).toBe(true);
      expect(indexContent).toMatch(/<title>/i);
      expect(indexContent).toMatch(/meta.*charset/i);
      expect(indexContent).toMatch(/meta.*viewport/i);
      
      // Validate castle pages SEO
      const castlesData = await fs.readJson('castles.json');
      for (const castle of castlesData) {
        const articlePath = path.join('articles', `${castle.id}.html`);
        const articleContent = await fs.readFile(articlePath, 'utf8');
        expect(HTMLValidator.validateAccessibility(articleContent)).toBe(true);
        expect(articleContent).toContain(castle.castleName);
      }
      
      process.chdir(originalDir);
    });

    test('should validate mobile responsiveness indicators', async () => {
      const sourceFile = path.join(originalDir, 'generate-and-grow.js');
      
      if (!await fs.pathExists(sourceFile)) {
        console.log('generate-and-grow.js not found - Mobile validation pending');
        return;
      }

      process.chdir(testDir);
      await fs.copy(sourceFile, 'generate-and-grow.js');
      await execAsync('node generate-and-grow.js');
      
      const cssContent = await fs.readFile('style.css', 'utf8');
      
      // Check for responsive design indicators
      const responsivePatterns = [
        /@media/i,
        /viewport/i,
        /max-width/i,
        /min-width/i
      ];
      
      const hasResponsiveDesign = responsivePatterns.some(pattern => 
        pattern.test(cssContent)
      );
      
      expect(hasResponsiveDesign).toBe(true);
      
      process.chdir(originalDir);
    });
  });
});