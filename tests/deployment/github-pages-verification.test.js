const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs-extra');

class GitHubPagesVerifier {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || process.env.GITHUB_PAGES_URL;
    this.timeout = 30000; // 30 seconds timeout
    this.results = {
      accessibility: [],
      links: [],
      performance: [],
      functionality: [],
      errors: []
    };
  }

  async verifyDeployment() {
    console.log(`🔍 Verifying GitHub Pages deployment at: ${this.baseUrl}`);
    
    if (!this.baseUrl) {
      throw new Error('GitHub Pages URL not provided. Set GITHUB_PAGES_URL environment variable or pass URL to constructor.');
    }

    try {
      // Core verification tests
      await this.verifySiteAccessibility();
      await this.verifyIndexPage();
      await this.verifyAllLinks();
      await this.verifyCastlePages();
      await this.verifyCSSStyling();
      await this.verifyMobileResponsiveness();
      await this.verifySEOElements();
      
      return this.generateReport();
    } catch (error) {
      this.results.errors.push({
        test: 'deployment_verification',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async verifySiteAccessibility() {
    console.log('📡 Testing site accessibility...');
    
    try {
      const response = await axios.get(this.baseUrl, { 
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Castle-Encyclopedia-Verifier/1.0'
        }
      });
      
      this.results.accessibility.push({
        test: 'site_reachable',
        status: 'PASS',
        statusCode: response.status,
        responseTime: response.headers['x-response-time'] || 'N/A',
        contentLength: response.data.length
      });

      // Check for basic HTML structure
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      const hasTitle = document.querySelector('title') !== null;
      const hasH1 = document.querySelector('h1') !== null;
      const hasNavigation = document.querySelectorAll('a').length > 0;
      
      this.results.accessibility.push({
        test: 'html_structure',
        status: hasTitle && hasH1 && hasNavigation ? 'PASS' : 'FAIL',
        details: {
          hasTitle,
          hasH1,
          linkCount: document.querySelectorAll('a').length
        }
      });

    } catch (error) {
      this.results.accessibility.push({
        test: 'site_reachable',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifyIndexPage() {
    console.log('🏠 Verifying index page content...');
    
    try {
      const response = await axios.get(this.baseUrl, { timeout: this.timeout });
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Check for expected content
      const title = document.querySelector('title')?.textContent || '';
      const h1 = document.querySelector('h1')?.textContent || '';
      const links = document.querySelectorAll('a[href*="articles/"]');
      
      const hasCastleTitle = /castle/i.test(title + h1);
      const hasCastleLinks = links.length > 0;
      
      // Check for CSS linking
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      const hasCSS = Array.from(cssLinks).some(link => 
        link.getAttribute('href').includes('style.css')
      );
      
      this.results.functionality.push({
        test: 'index_page_content',
        status: hasCastleTitle && hasCastleLinks && hasCSS ? 'PASS' : 'FAIL',
        details: {
          title,
          h1Content: h1,
          castleLinksFound: links.length,
          cssLinked: hasCSS,
          hasCastleTitle,
          hasCastleLinks
        }
      });

    } catch (error) {
      this.results.functionality.push({
        test: 'index_page_content',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifyAllLinks() {
    console.log('🔗 Validating all links...');
    
    try {
      const response = await axios.get(this.baseUrl, { timeout: this.timeout });
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      const links = Array.from(document.querySelectorAll('a[href]'));
      const linkTests = [];
      
      for (const link of links) {
        const href = link.getAttribute('href');
        let fullUrl;
        
        // Handle relative links
        if (href.startsWith('/')) {
          fullUrl = new URL(href, this.baseUrl).toString();
        } else if (href.startsWith('http')) {
          fullUrl = href;
        } else {
          fullUrl = new URL(href, this.baseUrl).toString();
        }
        
        try {
          const linkResponse = await axios.head(fullUrl, { 
            timeout: 10000,
            validateStatus: status => status < 400
          });
          
          linkTests.push({
            url: fullUrl,
            status: 'PASS',
            statusCode: linkResponse.status,
            linkText: link.textContent.trim()
          });
          
        } catch (error) {
          linkTests.push({
            url: fullUrl,
            status: 'FAIL',
            error: error.response?.status || error.message,
            linkText: link.textContent.trim()
          });
        }
      }
      
      this.results.links = linkTests;
      const failedLinks = linkTests.filter(test => test.status === 'FAIL');
      
      console.log(`✅ Link validation: ${linkTests.length - failedLinks.length}/${linkTests.length} passed`);
      
    } catch (error) {
      this.results.links.push({
        test: 'link_validation',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifyCastlePages() {
    console.log('🏰 Verifying individual castle pages...');
    
    try {
      // First get the index to find castle links
      const indexResponse = await axios.get(this.baseUrl, { timeout: this.timeout });
      const dom = new JSDOM(indexResponse.data);
      const document = dom.window.document;
      
      const castleLinks = Array.from(document.querySelectorAll('a[href*="articles/"]'));
      const castleTests = [];
      
      for (const link of castleLinks.slice(0, 5)) { // Test first 5 to avoid overwhelming
        const href = link.getAttribute('href');
        const fullUrl = new URL(href, this.baseUrl).toString();
        
        try {
          const pageResponse = await axios.get(fullUrl, { timeout: 10000 });
          const pageDom = new JSDOM(pageResponse.data);
          const pageDoc = pageDom.window.document;
          
          // Verify castle page content
          const hasTitle = pageDoc.querySelector('title') !== null;
          const hasH1 = pageDoc.querySelector('h1') !== null;
          const hasContent = pageDoc.body.textContent.length > 100;
          const hasCSS = pageDoc.querySelector('link[rel="stylesheet"]') !== null;
          
          castleTests.push({
            url: fullUrl,
            status: hasTitle && hasH1 && hasContent && hasCSS ? 'PASS' : 'FAIL',
            details: {
              hasTitle,
              hasH1,
              contentLength: pageDoc.body.textContent.length,
              hasCSS,
              title: pageDoc.querySelector('title')?.textContent || 'No title'
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
      
      this.results.functionality.push({
        test: 'castle_pages',
        status: castleTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL',
        details: castleTests
      });
      
    } catch (error) {
      this.results.functionality.push({
        test: 'castle_pages',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifyCSSStyling() {
    console.log('🎨 Verifying CSS styling...');
    
    try {
      const cssUrl = new URL('style.css', this.baseUrl).toString();
      const response = await axios.get(cssUrl, { timeout: 10000 });
      
      const cssContent = response.data;
      const hasBasicStyles = /body\s*{/.test(cssContent);
      const hasColorDefinitions = /color\s*:/.test(cssContent);
      const hasFontDefinitions = /font-family\s*:/.test(cssContent);
      const hasResponsiveDesign = /@media/.test(cssContent);
      
      this.results.functionality.push({
        test: 'css_styling',
        status: hasBasicStyles && hasColorDefinitions && hasFontDefinitions ? 'PASS' : 'FAIL',
        details: {
          hasBasicStyles,
          hasColorDefinitions,
          hasFontDefinitions,
          hasResponsiveDesign,
          cssSize: cssContent.length
        }
      });
      
    } catch (error) {
      this.results.functionality.push({
        test: 'css_styling',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifyMobileResponsiveness() {
    console.log('📱 Testing mobile responsiveness...');
    
    try {
      const response = await axios.get(this.baseUrl, { 
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });
      
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      // Check for viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewport = viewportMeta !== null;
      const viewportContent = viewportMeta?.getAttribute('content') || '';
      
      // Check for responsive CSS
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      let hasResponsiveCSS = false;
      
      for (const link of cssLinks) {
        try {
          const cssUrl = new URL(link.getAttribute('href'), this.baseUrl).toString();
          const cssResponse = await axios.get(cssUrl, { timeout: 5000 });
          if (/@media/.test(cssResponse.data)) {
            hasResponsiveCSS = true;
            break;
          }
        } catch (e) {
          // CSS loading failed, continue
        }
      }
      
      this.results.functionality.push({
        test: 'mobile_responsiveness',
        status: hasViewport ? 'PASS' : 'FAIL',
        details: {
          hasViewportMeta: hasViewport,
          viewportContent,
          hasResponsiveCSS
        }
      });
      
    } catch (error) {
      this.results.functionality.push({
        test: 'mobile_responsiveness',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  async verifySEOElements() {
    console.log('🔍 Verifying SEO elements...');
    
    try {
      const response = await axios.get(this.baseUrl, { timeout: this.timeout });
      const dom = new JSDOM(response.data);
      const document = dom.window.document;
      
      const title = document.querySelector('title')?.textContent || '';
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const h1Count = document.querySelectorAll('h1').length;
      const hasLangAttribute = document.documentElement.getAttribute('lang') !== null;
      
      this.results.functionality.push({
        test: 'seo_elements',
        status: title.length > 0 && h1Count === 1 ? 'PASS' : 'FAIL',
        details: {
          title,
          titleLength: title.length,
          hasMetaDescription: metaDescription.length > 0,
          h1Count,
          hasLangAttribute,
          metaDescriptionLength: metaDescription.length
        }
      });
      
    } catch (error) {
      this.results.functionality.push({
        test: 'seo_elements',
        status: 'FAIL',
        error: error.message
      });
    }
  }

  generateReport() {
    const totalTests = this.results.accessibility.length + 
                      this.results.links.length + 
                      this.results.functionality.length;
    
    const passedTests = [
      ...this.results.accessibility,
      ...this.results.links,
      ...this.results.functionality
    ].filter(test => test.status === 'PASS').length;
    
    const failedTests = totalTests - passedTests;
    
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
      overallStatus: failedTests === 0 ? 'PASS' : 'FAIL'
    };
    
    console.log('\n📊 Verification Summary:');
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}`);
    
    return report;
  }
}

module.exports = GitHubPagesVerifier;

// If run directly
if (require.main === module) {
  const verifier = new GitHubPagesVerifier(process.argv[2]);
  verifier.verifyDeployment()
    .then(report => {
      console.log('\n🎉 Verification complete!');
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.overallStatus === 'PASS' ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Verification failed:', error.message);
      process.exit(1);
    });
}