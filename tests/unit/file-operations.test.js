const fs = require('fs-extra');
const path = require('path');

// File operations utilities
class FileSystemValidator {
  static async validateDirectoryStructure(basePath) {
    try {
      const requiredDirs = ['articles'];
      const requiredFiles = ['castles.json', 'style.css', 'index.html'];
      
      for (const dir of requiredDirs) {
        const dirPath = path.join(basePath, dir);
        if (!await fs.pathExists(dirPath) || !await fs.stat(dirPath).then(s => s.isDirectory())) {
          return false;
        }
      }
      
      for (const file of requiredFiles) {
        const filePath = path.join(basePath, file);
        if (!await fs.pathExists(filePath) || !await fs.stat(filePath).then(s => s.isFile())) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  static async validateJSONFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      JSON.parse(content);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async validateCastlesJSON(filePath) {
    try {
      const data = await fs.readJson(filePath);
      return Array.isArray(data);
    } catch (error) {
      return false;
    }
  }

  static async validateCSSFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Basic CSS validation - check for common CSS patterns
      const cssPatterns = [
        /[a-zA-Z-]+\s*:\s*[^;]+;/,  // property: value;
        /[.#]?[a-zA-Z-]+\s*\{/,      // selector {
        /\}/                          // closing brace
      ];
      
      return cssPatterns.some(pattern => pattern.test(content));
    } catch (error) {
      return false;
    }
  }

  static async validateArticleFiles(articlesDir, expectedCastles) {
    try {
      if (!Array.isArray(expectedCastles)) return false;
      
      for (const castle of expectedCastles) {
        const articlePath = path.join(articlesDir, `${castle.id}.html`);
        if (!await fs.pathExists(articlePath)) {
          return false;
        }
        
        const content = await fs.readFile(articlePath, 'utf8');
        if (!content.includes(castle.castleName)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  static async validateFilePermissions(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      // Check if file is readable and writable
      await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  static async validateFileEncoding(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Check for BOM or encoding issues
      const hasBOM = content.charCodeAt(0) === 0xFEFF;
      const hasValidUTF8 = !content.includes('\uFFFD'); // Replacement character
      
      return hasValidUTF8;
    } catch (error) {
      return false;
    }
  }

  static async cleanupTestFiles(testDir) {
    try {
      if (await fs.pathExists(testDir)) {
        await fs.remove(testDir);
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}

describe('File Operations Unit Tests', () => {
  let testDir;

  beforeEach(async () => {
    testDir = path.join(__dirname, '..', 'test-workspace-file-ops');
    await fs.ensureDir(testDir);
    await fs.emptyDir(testDir);
  });

  afterEach(async () => {
    await FileSystemValidator.cleanupTestFiles(testDir);
  });

  describe('Directory Structure Validation', () => {
    test('should validate complete directory structure', async () => {
      // Create required structure
      await fs.ensureDir(path.join(testDir, 'articles'));
      await fs.writeFile(path.join(testDir, 'castles.json'), '[]');
      await fs.writeFile(path.join(testDir, 'style.css'), 'body { font-family: Arial; }');
      await fs.writeFile(path.join(testDir, 'index.html'), '<!DOCTYPE html><html></html>');

      const isValid = await FileSystemValidator.validateDirectoryStructure(testDir);
      expect(isValid).toBe(true);
    });

    test('should reject incomplete directory structure', async () => {
      // Create only partial structure
      await fs.writeFile(path.join(testDir, 'castles.json'), '[]');

      const isValid = await FileSystemValidator.validateDirectoryStructure(testDir);
      expect(isValid).toBe(false);
    });
  });

  describe('JSON File Validation', () => {
    test('should validate proper JSON files', async () => {
      const jsonPath = path.join(testDir, 'test.json');
      await fs.writeFile(jsonPath, '{"test": "value"}');

      const isValid = await FileSystemValidator.validateJSONFile(jsonPath);
      expect(isValid).toBe(true);
    });

    test('should reject invalid JSON files', async () => {
      const jsonPath = path.join(testDir, 'invalid.json');
      await fs.writeFile(jsonPath, '{ invalid json }');

      const isValid = await FileSystemValidator.validateJSONFile(jsonPath);
      expect(isValid).toBe(false);
    });

    test('should validate castles.json as array', async () => {
      const castlesPath = path.join(testDir, 'castles.json');
      await fs.writeFile(castlesPath, '[]');

      const isValid = await FileSystemValidator.validateCastlesJSON(castlesPath);
      expect(isValid).toBe(true);
    });

    test('should reject castles.json with non-array content', async () => {
      const castlesPath = path.join(testDir, 'castles.json');
      await fs.writeFile(castlesPath, '{"not": "array"}');

      const isValid = await FileSystemValidator.validateCastlesJSON(castlesPath);
      expect(isValid).toBe(false);
    });
  });

  describe('CSS File Validation', () => {
    test('should validate proper CSS files', async () => {
      const cssPath = path.join(testDir, 'style.css');
      const cssContent = `
        body {
          font-family: Georgia, serif;
          background-color: #f5f5f5;
        }
        
        h1 {
          color: #333;
          text-align: center;
        }
      `;
      await fs.writeFile(cssPath, cssContent);

      const isValid = await FileSystemValidator.validateCSSFile(cssPath);
      expect(isValid).toBe(true);
    });

    test('should reject invalid CSS files', async () => {
      const cssPath = path.join(testDir, 'style.css');
      await fs.writeFile(cssPath, 'This is not CSS content');

      const isValid = await FileSystemValidator.validateCSSFile(cssPath);
      expect(isValid).toBe(false);
    });
  });

  describe('Article Files Validation', () => {
    test('should validate article files match castle data', async () => {
      const articlesDir = path.join(testDir, 'articles');
      await fs.ensureDir(articlesDir);

      const testCastles = [
        { id: 'castle1', castleName: 'First Castle' },
        { id: 'castle2', castleName: 'Second Castle' }
      ];

      // Create article files
      for (const castle of testCastles) {
        const articlePath = path.join(articlesDir, `${castle.id}.html`);
        const content = `<html><body><h1>${castle.castleName}</h1></body></html>`;
        await fs.writeFile(articlePath, content);
      }

      const isValid = await FileSystemValidator.validateArticleFiles(articlesDir, testCastles);
      expect(isValid).toBe(true);
    });

    test('should reject missing article files', async () => {
      const articlesDir = path.join(testDir, 'articles');
      await fs.ensureDir(articlesDir);

      const testCastles = [
        { id: 'castle1', castleName: 'First Castle' },
        { id: 'castle2', castleName: 'Second Castle' }
      ];

      // Create only one article file
      const articlePath = path.join(articlesDir, `${testCastles[0].id}.html`);
      const content = `<html><body><h1>${testCastles[0].castleName}</h1></body></html>`;
      await fs.writeFile(articlePath, content);

      const isValid = await FileSystemValidator.validateArticleFiles(articlesDir, testCastles);
      expect(isValid).toBe(false);
    });
  });

  describe('File Permissions and Encoding', () => {
    test('should validate file permissions', async () => {
      const testFile = path.join(testDir, 'test.txt');
      await fs.writeFile(testFile, 'Test content');

      const isValid = await FileSystemValidator.validateFilePermissions(testFile);
      expect(isValid).toBe(true);
    });

    test('should validate file encoding', async () => {
      const testFile = path.join(testDir, 'test.txt');
      await fs.writeFile(testFile, 'Test content with unicode: 🏰', 'utf8');

      const isValid = await FileSystemValidator.validateFileEncoding(testFile);
      expect(isValid).toBe(true);
    });
  });

  describe('Error Recovery and Cleanup', () => {
    test('should handle missing files gracefully', async () => {
      const nonExistentFile = path.join(testDir, 'does-not-exist.json');

      const isValid = await FileSystemValidator.validateJSONFile(nonExistentFile);
      expect(isValid).toBe(false);
    });

    test('should clean up test files successfully', async () => {
      // Create some test files
      await fs.writeFile(path.join(testDir, 'test1.txt'), 'content1');
      await fs.writeFile(path.join(testDir, 'test2.txt'), 'content2');

      const cleaned = await FileSystemValidator.cleanupTestFiles(testDir);
      expect(cleaned).toBe(true);
      expect(await fs.pathExists(testDir)).toBe(false);
    });
  });

  describe('Performance and Large Files', () => {
    test('should handle large JSON files', async () => {
      const largeCastles = Array.from({ length: 100 }, (_, i) => ({
        id: `castle_${i}`,
        castleName: `Castle ${i}`,
        country: `Country ${i}`,
        location: `Location ${i}`,
        architecturalStyle: 'Style',
        yearBuilt: '12th century',
        shortDescription: `Description for castle ${i}`,
        keyFeatures: [`Feature 1`, `Feature 2`]
      }));

      const largeCastlesPath = path.join(testDir, 'large-castles.json');
      await fs.writeJson(largeCastlesPath, largeCastles);

      const isValid = await FileSystemValidator.validateCastlesJSON(largeCastlesPath);
      expect(isValid).toBe(true);
    });

    test('should handle concurrent file operations', async () => {
      const operations = Array.from({ length: 10 }, async (_, i) => {
        const filePath = path.join(testDir, `concurrent-${i}.json`);
        await fs.writeFile(filePath, `{"id": ${i}}`);
        return FileSystemValidator.validateJSONFile(filePath);
      });

      const results = await Promise.all(operations);
      expect(results.every(result => result === true)).toBe(true);
    });
  });
});

module.exports = FileSystemValidator;