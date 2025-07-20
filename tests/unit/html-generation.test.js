const fs = require('fs-extra');
const { JSDOM } = require('jsdom');

// HTML generation utilities
class HTMLValidator {
  static validateHTMLStructure(htmlContent) {
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Check for basic HTML structure
      const hasDoctype = htmlContent.includes('<!DOCTYPE html>');
      const hasHtml = document.querySelector('html') !== null;
      const hasHead = document.querySelector('head') !== null;
      const hasBody = document.querySelector('body') !== null;
      
      return hasDoctype && hasHtml && hasHead && hasBody;
    } catch (error) {
      return false;
    }
  }

  static validateSemanticStructure(htmlContent) {
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Check for semantic HTML elements
      const hasHeadings = document.querySelector('h1, h2, h3, h4, h5, h6') !== null;
      const hasParagraphs = document.querySelector('p') !== null;
      
      return hasHeadings && hasParagraphs;
    } catch (error) {
      return false;
    }
  }

  static validateCSSLinking(htmlContent) {
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      return Array.from(cssLinks).some(link => 
        link.getAttribute('href').includes('style.css')
      );
    } catch (error) {
      return false;
    }
  }

  static validateCastleContent(htmlContent, castle) {
    if (!castle) return false;
    
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      const bodyText = document.body.textContent.toLowerCase();
      
      // Check if castle data is present in the HTML
      const hasName = bodyText.includes(castle.castleName.toLowerCase());
      const hasCountry = bodyText.includes(castle.country.toLowerCase());
      const hasLocation = bodyText.includes(castle.location.toLowerCase());
      const hasDescription = bodyText.includes(castle.shortDescription.toLowerCase());
      
      return hasName && hasCountry && hasLocation && hasDescription;
    } catch (error) {
      return false;
    }
  }

  static validateIndexLinks(htmlContent, castles) {
    if (!Array.isArray(castles) || castles.length === 0) return false;
    
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Check if all castle links are present
      return castles.every(castle => {
        const linkExists = document.querySelector(`a[href*="${castle.id}.html"]`) !== null;
        const nameExists = htmlContent.includes(castle.castleName);
        return linkExists && nameExists;
      });
    } catch (error) {
      return false;
    }
  }

  static validateAccessibility(htmlContent) {
    try {
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Basic accessibility checks
      const hasTitle = document.querySelector('title') !== null;
      const hasLang = document.documentElement.getAttribute('lang') !== null;
      const images = document.querySelectorAll('img');
      const hasAltText = Array.from(images).every(img => img.getAttribute('alt') !== null);
      
      return hasTitle && (images.length === 0 || hasAltText);
    } catch (error) {
      return false;
    }
  }
}

describe('HTML Generation Unit Tests', () => {
  const sampleCastle = {
    id: 'test_castle',
    castleName: 'Test Castle',
    country: 'Test Country',
    location: 'Test Location',
    architecturalStyle: 'Test Style',
    yearBuilt: '12th century',
    shortDescription: 'A magnificent test castle with rich history.',
    keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3']
  };

  const sampleCastles = [
    sampleCastle,
    {
      id: 'another_castle',
      castleName: 'Another Castle',
      country: 'Another Country',
      location: 'Another Location',
      architecturalStyle: 'Another Style',
      yearBuilt: '13th century',
      shortDescription: 'Another magnificent castle.',
      keyFeatures: ['Another Feature 1', 'Another Feature 2']
    }
  ];

  describe('Basic HTML Structure Validation', () => {
    test('should validate proper HTML5 structure', () => {
      const validHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Test</title>
          <link rel="stylesheet" href="style.css">
        </head>
        <body>
          <h1>Test Castle</h1>
          <p>Test content</p>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateHTMLStructure(validHTML)).toBe(true);
    });

    test('should reject invalid HTML structure', () => {
      const invalidHTML = `
        <div>
          <p>This is not proper HTML</p>
        </div>
      `;

      expect(HTMLValidator.validateHTMLStructure(invalidHTML)).toBe(false);
    });
  });

  describe('Semantic Structure Validation', () => {
    test('should validate semantic HTML elements', () => {
      const semanticHTML = `
        <!DOCTYPE html>
        <html>
        <head><title>Test</title></head>
        <body>
          <h1>Main Heading</h1>
          <h2>Sub Heading</h2>
          <p>Paragraph content</p>
          <ul>
            <li>List item</li>
          </ul>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateSemanticStructure(semanticHTML)).toBe(true);
    });

    test('should reject non-semantic structure', () => {
      const nonSemanticHTML = `
        <!DOCTYPE html>
        <html>
        <head><title>Test</title></head>
        <body>
          <div>Some content</div>
          <span>More content</span>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateSemanticStructure(nonSemanticHTML)).toBe(false);
    });
  });

  describe('CSS Linking Validation', () => {
    test('should validate CSS stylesheet linking', () => {
      const htmlWithCSS = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test</title>
          <link rel="stylesheet" href="style.css">
        </head>
        <body><h1>Test</h1></body>
        </html>
      `;

      expect(HTMLValidator.validateCSSLinking(htmlWithCSS)).toBe(true);
    });

    test('should reject HTML without proper CSS linking', () => {
      const htmlWithoutCSS = `
        <!DOCTYPE html>
        <html>
        <head><title>Test</title></head>
        <body><h1>Test</h1></body>
        </html>
      `;

      expect(HTMLValidator.validateCSSLinking(htmlWithoutCSS)).toBe(false);
    });
  });

  describe('Castle Content Validation', () => {
    test('should validate castle data in HTML content', () => {
      const htmlWithCastleData = `
        <!DOCTYPE html>
        <html>
        <head><title>Test Castle</title></head>
        <body>
          <h1>Test Castle</h1>
          <p>Located in Test Country, Test Location</p>
          <p>A magnificent test castle with rich history.</p>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateCastleContent(htmlWithCastleData, sampleCastle)).toBe(true);
    });

    test('should reject HTML missing castle data', () => {
      const htmlWithoutCastleData = `
        <!DOCTYPE html>
        <html>
        <head><title>Some Castle</title></head>
        <body>
          <h1>Different Castle</h1>
          <p>This is about a different castle.</p>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateCastleContent(htmlWithoutCastleData, sampleCastle)).toBe(false);
    });
  });

  describe('Index Page Link Validation', () => {
    test('should validate all castle links in index page', () => {
      const indexHTML = `
        <!DOCTYPE html>
        <html>
        <head><title>Castle Index</title></head>
        <body>
          <h1>Castle Collection</h1>
          <ul>
            <li><a href="articles/test_castle.html">Test Castle</a></li>
            <li><a href="articles/another_castle.html">Another Castle</a></li>
          </ul>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateIndexLinks(indexHTML, sampleCastles)).toBe(true);
    });

    test('should reject index page with missing links', () => {
      const incompleteIndexHTML = `
        <!DOCTYPE html>
        <html>
        <head><title>Castle Index</title></head>
        <body>
          <h1>Castle Collection</h1>
          <ul>
            <li><a href="articles/test_castle.html">Test Castle</a></li>
          </ul>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateIndexLinks(incompleteIndexHTML, sampleCastles)).toBe(false);
    });
  });

  describe('Accessibility Validation', () => {
    test('should validate basic accessibility requirements', () => {
      const accessibleHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Accessible Castle Page</title>
        </head>
        <body>
          <h1>Test Castle</h1>
          <img src="castle.jpg" alt="Beautiful test castle">
          <p>Description</p>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateAccessibility(accessibleHTML)).toBe(true);
    });

    test('should reject inaccessible HTML', () => {
      const inaccessibleHTML = `
        <!DOCTYPE html>
        <html>
        <head></head>
        <body>
          <h1>Test Castle</h1>
          <img src="castle.jpg">
          <p>Description</p>
        </body>
        </html>
      `;

      expect(HTMLValidator.validateAccessibility(inaccessibleHTML)).toBe(false);
    });
  });
});

module.exports = HTMLValidator;