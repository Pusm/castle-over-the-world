const GitHubPagesVerifier = require('./github-pages-verification.test');
const SelfExpansionVerifier = require('./self-expansion-verification.test');
const fs = require('fs-extra');

describe('GitHub Pages Deployment Verification', () => {
  let baseUrl;

  beforeAll(() => {
    // Try to get GitHub Pages URL from environment or use a test URL
    baseUrl = process.env.GITHUB_PAGES_URL || 
              process.env.GITHUB_USERNAME && `https://${process.env.GITHUB_USERNAME}.github.io/castle-over-the-world` ||
              null;
    
    if (!baseUrl) {
      console.log('⚠️  GitHub Pages URL not configured. Set GITHUB_PAGES_URL or GITHUB_USERNAME environment variable.');
      console.log('   Tests will be skipped until deployment URL is available.');
    }
  });

  describe('Basic Site Functionality', () => {
    test('should verify site is accessible and functional', async () => {
      if (!baseUrl) {
        console.log('Skipping deployment test - no URL configured');
        return;
      }

      const verifier = new GitHubPagesVerifier(baseUrl);
      const report = await verifier.verifyDeployment();
      
      // Save report for debugging
      await fs.writeFile('deployment-report.json', JSON.stringify(report, null, 2));
      
      expect(report.overallStatus).toBe('PASS');
      expect(report.summary.successRate).toMatch(/^[89]\d\.\d%$|^100\.0%$/); // At least 80% success rate
    }, 60000);

    test('should verify all links are working', async () => {
      if (!baseUrl) {
        console.log('Skipping link verification - no URL configured');
        return;
      }

      const verifier = new GitHubPagesVerifier(baseUrl);
      await verifier.verifyAllLinks();
      
      const failedLinks = verifier.results.links.filter(link => link.status === 'FAIL');
      expect(failedLinks.length).toBe(0);
    }, 45000);

    test('should verify mobile responsiveness', async () => {
      if (!baseUrl) {
        console.log('Skipping mobile test - no URL configured');
        return;
      }

      const verifier = new GitHubPagesVerifier(baseUrl);
      await verifier.verifyMobileResponsiveness();
      
      const mobileTest = verifier.results.functionality.find(test => test.test === 'mobile_responsiveness');
      expect(mobileTest.status).toBe('PASS');
    }, 30000);
  });

  describe('Self-Expansion System Verification', () => {
    test('should verify evidence of self-expansion system', async () => {
      if (!baseUrl) {
        console.log('Skipping self-expansion verification - no URL configured');
        return;
      }

      const verifier = new SelfExpansionVerifier(baseUrl);
      const report = await verifier.verifySelfExpansion();
      
      // Save report for debugging
      await fs.writeFile('self-expansion-report.json', JSON.stringify(report, null, 2));
      
      expect(report.selfExpansionEvidence.systemWorking).toBe(true);
      expect(report.overallStatus).toBe('PASS');
    }, 90000);

    test('should verify no duplicate castles exist', async () => {
      if (!baseUrl) {
        console.log('Skipping duplicate check - no URL configured');
        return;
      }

      const verifier = new SelfExpansionVerifier(baseUrl);
      await verifier.checkForDuplicates();
      
      const duplicateTest = verifier.results.data.find(test => test.test === 'duplicate_check');
      expect(duplicateTest.status).toBe('PASS');
    }, 30000);

    test('should verify castle data structure consistency', async () => {
      if (!baseUrl) {
        console.log('Skipping structure verification - no URL configured');
        return;
      }

      const verifier = new SelfExpansionVerifier(baseUrl);
      await verifier.verifyCastleDataStructure();
      
      const structureTest = verifier.results.structure.find(test => test.test === 'castle_data_structure');
      expect(structureTest.status).toBe('PASS');
    }, 60000);
  });

  describe('Production Readiness', () => {
    test('should verify SEO optimization', async () => {
      if (!baseUrl) {
        console.log('Skipping SEO verification - no URL configured');
        return;
      }

      const verifier = new GitHubPagesVerifier(baseUrl);
      await verifier.verifySEOElements();
      
      const seoTest = verifier.results.functionality.find(test => test.test === 'seo_elements');
      expect(seoTest.status).toBe('PASS');
    }, 30000);

    test('should verify CSS styling is applied', async () => {
      if (!baseUrl) {
        console.log('Skipping CSS verification - no URL configured');
        return;
      }

      const verifier = new GitHubPagesVerifier(baseUrl);
      await verifier.verifyCSSStyling();
      
      const cssTest = verifier.results.functionality.find(test => test.test === 'css_styling');
      expect(cssTest.status).toBe('PASS');
    }, 30000);
  });

  describe('Performance and Reliability', () => {
    test('should load within acceptable time limits', async () => {
      if (!baseUrl) {
        console.log('Skipping performance test - no URL configured');
        return;
      }

      const startTime = Date.now();
      const verifier = new GitHubPagesVerifier(baseUrl);
      await verifier.verifySiteAccessibility();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    }, 15000);

    test('should handle multiple concurrent requests', async () => {
      if (!baseUrl) {
        console.log('Skipping concurrent test - no URL configured');
        return;
      }

      const verifiers = Array.from({ length: 3 }, () => new GitHubPagesVerifier(baseUrl));
      const promises = verifiers.map(verifier => verifier.verifySiteAccessibility());
      
      await expect(Promise.all(promises)).resolves.not.toThrow();
    }, 30000);
  });

  afterAll(async () => {
    // Clean up test artifacts
    const reportFiles = ['deployment-report.json', 'self-expansion-report.json'];
    
    for (const file of reportFiles) {
      if (await fs.pathExists(file)) {
        console.log(`📄 Test report available: ${file}`);
      }
    }
  });
});