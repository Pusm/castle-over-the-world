const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs-extra');

class SelfExpansionVerifier {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || process.env.GITHUB_PAGES_URL;
    this.timeout = 30000;
    this.results = {
      expansion: [],
      structure: [],
      data: [],
      errors: []
    };
  }

  async verifySelfExpansion() {
    console.log(`🔄 Verifying self-expansion system evidence at: ${this.baseUrl}`);
    
    if (!this.baseUrl) {
      throw new Error('GitHub Pages URL not provided. Set GITHUB_PAGES_URL environment variable.');
    }

    try {
      await this.verifyExpansionEvidence();
      await this.verifyCastleDataStructure();
      await this.verifyGeneratedStructure();
      await this.verifyExpansionIntegrity();
      await this.checkForDuplicates();
      
      return this.generateExpansionReport();
    } catch (error) {
      this.results.errors.push({
        test: 'self_expansion_verification',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async verifyExpansionEvidence() {
    console.log('📈 Checking for evidence of self-expansion...');
    
    try {
      const response = await axios.get(this.baseUrl, { timeout: this.timeout });
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Count castle links in index
      const castleLinks = document.querySelectorAll('a[href*="articles/"]');
      const castleCount = castleLinks.length;
      
      // Check if there are multiple castles (evidence of expansion)
      const hasMultipleCastles = castleCount > 1;
      const hasMinimumCastles = castleCount >= 1;
      
      // Check for systematic naming (evidence of generated IDs)
      const linkHrefs = Array.from(castleLinks).map(link => link.getAttribute('href'));
      const hasSystematicNaming = linkHrefs.some(href => 
        /articles\/[a-z_]+\.html/.test(href)
      );
      
      // Check for consistent structure across castle entries
      const castleEntries = Array.from(castleLinks).map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent.trim(),
        hasProperStructure: link.closest('div, li, article, section') !== null
      }));
      
      const allHaveStructure = castleEntries.every(entry => entry.hasProperStructure);
      
      this.results.expansion.push({
        test: 'expansion_evidence',
        status: hasMinimumCastles && hasSystematicNaming ? 'PASS' : 'FAIL',
        details: {
          castleCount,
          hasMultipleCastles,
          hasMinimumCastles,
          hasSystematicNaming,
          allHaveStructure,
          castleEntries: castleEntries.slice(0, 5) // Show first 5 for brevity
        }
      });
      
      console.log(`   Found ${castleCount} castle(s) on index page`);
      
    } catch (error) {
      this.results.expansion.push({
        test: 'expansion_evidence',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifyCastleDataStructure() {
    console.log('🏰 Verifying castle data structure consistency...');
    
    try {
      // Get index page to find castle links
      const indexResponse = await axios.get(this.baseUrl, { timeout: this.timeout });
      const indexDom = new JSDOM(indexResponse.data);
      const indexDoc = indexDom.window.document;
      
      const castleLinks = Array.from(indexDoc.querySelectorAll('a[href*="articles/"]'));
      const castleTests = [];
      
      // Test structure of each castle page
      for (const link of castleLinks.slice(0, 10)) { // Test up to 10 castles
        const href = link.getAttribute('href');
        const fullUrl = new URL(href, this.baseUrl).toString();
        
        try {
          const pageResponse = await axios.get(fullUrl, { timeout: 10000 });
          const pageDom = new JSDOM(pageResponse.data);
          const pageDoc = pageDom.window.document;
          
          // Check for expected castle data structure
          const title = pageDoc.querySelector('title')?.textContent || '';
          const h1 = pageDoc.querySelector('h1')?.textContent || '';
          const paragraphs = pageDoc.querySelectorAll('p');
          const lists = pageDoc.querySelectorAll('ul, ol');
          const headings = pageDoc.querySelectorAll('h1, h2, h3, h4, h5, h6');
          
          // Check for typical castle information patterns
          const bodyText = pageDoc.body.textContent.toLowerCase();
          const hasLocationInfo = /country|location|built|century|castle/i.test(bodyText);
          const hasDescriptiveContent = paragraphs.length >= 2;
          const hasStructuredContent = headings.length >= 2;
          const hasListContent = lists.length >= 1;
          
          // Check for generated structure consistency
          const hasConsistentStructure = title.includes(h1) || h1.includes('Castle');
          
          castleTests.push({
            url: fullUrl,
            castleName: h1,
            status: hasLocationInfo && hasDescriptiveContent && hasStructuredContent ? 'PASS' : 'FAIL',
            structure: {
              hasLocationInfo,
              hasDescriptiveContent,
              hasStructuredContent,
              hasListContent,
              hasConsistentStructure,
              paragraphCount: paragraphs.length,
              headingCount: headings.length,
              listCount: lists.length
            }
          });
          
        } catch (error) {
          castleTests.push({
            url: fullUrl,
            status: 'FAIL',
            error: error.message
          });
        }
      }
      
      const passedStructureTests = castleTests.filter(test => test.status === 'PASS').length;
      const structureConsistency = passedStructureTests / castleTests.length;
      
      this.results.structure.push({
        test: 'castle_data_structure',
        status: structureConsistency >= 0.8 ? 'PASS' : 'FAIL', // 80% threshold
        details: {
          totalTested: castleTests.length,
          passed: passedStructureTests,
          consistencyRate: `${(structureConsistency * 100).toFixed(1)}%`,
          castleTests: castleTests
        }
      });
      
      console.log(`   Structure consistency: ${(structureConsistency * 100).toFixed(1)}% (${passedStructureTests}/${castleTests.length})`);
      
    } catch (error) {
      this.results.structure.push({
        test: 'castle_data_structure',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifyGeneratedStructure() {
    console.log('⚙️ Verifying generated file structure...');
    
    try {
      const response = await axios.get(this.baseUrl, { timeout: this.timeout });
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Check for evidence of automated generation
      const htmlStructure = response.data;
      
      // Look for consistent patterns that indicate automated generation
      const hasConsistentMeta = /<meta charset="UTF-8">/.test(htmlStructure);
      const hasConsistentViewport = /<meta name="viewport"/.test(htmlStructure);
      const hasConsistentCSS = /link.*stylesheet.*style\.css/.test(htmlStructure);
      
      // Check for semantic HTML structure
      const hasSemanticStructure = /<main>|<section>|<article>|<header>|<nav>/.test(htmlStructure);
      
      // Check index page structure for automated generation patterns
      const castleLinks = document.querySelectorAll('a[href*="articles/"]');
      const linkPatterns = Array.from(castleLinks).map(link => link.getAttribute('href'));
      
      // Check if file names follow systematic pattern
      const hasSystematicFileNames = linkPatterns.every(href => 
        /articles\/[a-z_]+\.html$/.test(href)
      );
      
      // Check for consistent link structure
      const linkTexts = Array.from(castleLinks).map(link => link.textContent.trim());
      const hasConsistentLinkTexts = linkTexts.every(text => 
        text.length > 0 && /castle/i.test(text)
      );
      
      this.results.structure.push({
        test: 'generated_structure',
        status: hasConsistentMeta && hasConsistentCSS && hasSystematicFileNames ? 'PASS' : 'FAIL',
        details: {
          hasConsistentMeta,
          hasConsistentViewport,
          hasConsistentCSS,
          hasSemanticStructure,
          hasSystematicFileNames,
          hasConsistentLinkTexts,
          totalLinks: castleLinks.length,
          sampleFileNames: linkPatterns.slice(0, 5)
        }
      });
      
    } catch (error) {
      this.results.structure.push({
        test: 'generated_structure',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifyExpansionIntegrity() {
    console.log('🔍 Verifying expansion data integrity...');
    
    try {
      // Check if all links actually lead to valid pages
      const indexResponse = await axios.get(this.baseUrl, { timeout: this.timeout });
      const indexDom = new JSDOM(indexResponse.data);
      const indexDoc = indexDom.window.document;
      
      const castleLinks = Array.from(indexDoc.querySelectorAll('a[href*="articles/"]'));
      const integrityTests = [];
      
      for (const link of castleLinks) {
        const href = link.getAttribute('href');
        const linkText = link.textContent.trim();
        const fullUrl = new URL(href, this.baseUrl).toString();
        
        try {
          const pageResponse = await axios.get(fullUrl, { timeout: 10000 });
          const pageDom = new JSDOM(pageResponse.data);
          const pageDoc = pageDom.window.document;
          
          const pageTitle = pageDoc.querySelector('h1')?.textContent || '';
          const linkMatchesPage = linkText.toLowerCase().includes(pageTitle.toLowerCase().split(' ')[0]) ||
                                 pageTitle.toLowerCase().includes(linkText.toLowerCase().split(' ')[0]);
          
          integrityTests.push({
            linkText,
            pageTitle,
            url: fullUrl,
            status: linkMatchesPage ? 'PASS' : 'WARN',
            linkMatchesPage
          });
          
        } catch (error) {
          integrityTests.push({
            linkText,
            url: fullUrl,
            status: 'FAIL',
            error: error.message
          });
        }
      }
      
      const passedIntegrityTests = integrityTests.filter(test => test.status === 'PASS').length;
      const integrityRate = passedIntegrityTests / integrityTests.length;
      
      this.results.data.push({
        test: 'expansion_integrity',
        status: integrityRate >= 0.9 ? 'PASS' : 'FAIL', // 90% threshold
        details: {
          totalLinks: integrityTests.length,
          validLinks: passedIntegrityTests,
          integrityRate: `${(integrityRate * 100).toFixed(1)}%`,
          tests: integrityTests
        }
      });
      
      console.log(`   Data integrity: ${(integrityRate * 100).toFixed(1)}% (${passedIntegrityTests}/${integrityTests.length})`);
      
    } catch (error) {
      this.results.data.push({
        test: 'expansion_integrity',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async checkForDuplicates() {
    console.log('🔎 Checking for duplicate castles...');
    
    try {
      const indexResponse = await axios.get(this.baseUrl, { timeout: this.timeout });
      const indexDom = new JSDOM(indexResponse.data);
      const indexDoc = indexDom.window.document;
      
      const castleLinks = Array.from(indexDoc.querySelectorAll('a[href*="articles/"]'));
      
      // Check for duplicate URLs
      const urls = castleLinks.map(link => link.getAttribute('href'));
      const uniqueUrls = [...new Set(urls)];
      const hasDuplicateUrls = urls.length !== uniqueUrls.length;
      
      // Check for duplicate castle names
      const names = castleLinks.map(link => link.textContent.trim().toLowerCase());
      const uniqueNames = [...new Set(names)];
      const hasDuplicateNames = names.length !== uniqueNames.length;
      
      // Find actual duplicates if any
      const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
      const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
      
      this.results.data.push({
        test: 'duplicate_check',
        status: !hasDuplicateUrls && !hasDuplicateNames ? 'PASS' : 'FAIL',
        details: {
          totalCastles: castleLinks.length,
          uniqueUrls: uniqueUrls.length,
          uniqueNames: uniqueNames.length,
          hasDuplicateUrls,
          hasDuplicateNames,
          duplicateUrls,
          duplicateNames
        }
      });
      
      if (!hasDuplicateUrls && !hasDuplicateNames) {
        console.log(`   ✅ No duplicates found in ${castleLinks.length} castles`);
      } else {
        console.log(`   ⚠️  Duplicates detected: ${duplicateUrls.length} URLs, ${duplicateNames.length} names`);
      }
      
    } catch (error) {
      this.results.data.push({
        test: 'duplicate_check',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  generateExpansionReport() {
    const allTests = [
      ...this.results.expansion,
      ...this.results.structure,
      ...this.results.data
    ];
    
    const passedTests = allTests.filter(test => test.status === 'PASS').length;
    const failedTests = allTests.filter(test => test.status === 'FAIL').length;
    const totalTests = allTests.length;
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: {
        totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`
      },
      results: this.results,
      overallStatus: failedTests === 0 ? 'PASS' : 'FAIL',
      selfExpansionEvidence: {
        systemWorking: passedTests >= totalTests * 0.8, // 80% threshold
        recommendedActions: failedTests > 0 ? [
          'Review failed tests for expansion system issues',
          'Check for data integrity problems',
          'Verify automated generation is working correctly'
        ] : ['Self-expansion system appears to be functioning correctly']
      }
    };
    
    console.log('\n📊 Self-Expansion Verification Summary:');
    console.log(`✅ Evidence of Working System: ${report.selfExpansionEvidence.systemWorking ? 'YES' : 'NO'}`);
    console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}`);
    
    return report;
  }
}

module.exports = SelfExpansionVerifier;

// If run directly
if (require.main === module) {
  const verifier = new SelfExpansionVerifier(process.argv[2]);
  verifier.verifySelfExpansion()
    .then(report => {
      console.log('\n🎉 Self-expansion verification complete!');
      fs.writeFileSync('self-expansion-report.json', JSON.stringify(report, null, 2));
      console.log('📄 Report saved to self-expansion-report.json');
      process.exit(report.overallStatus === 'PASS' ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Self-expansion verification failed:', error.message);
      process.exit(1);
    });
}