#!/usr/bin/env node

/**
 * Castle Data Validation System
 * Ensures data quality and consistency for external castle data sources
 * Supports validation for Wikipedia, UNESCO, Wikidata, and algorithmic sources
 */

class CastleDataValidator {
  constructor() {
    this.validationErrors = [];
    this.validationWarnings = [];
    
    // Validation schemas for different data sources
    this.schemas = {
      required: ['id', 'castleName', 'country', 'location', 'architecturalStyle', 'yearBuilt', 'shortDescription'],
      optional: ['keyFeatures', 'source', 'wikiUrl', 'lastUpdated', 'detailedDescription', 'historicalTimeline'],
      enhanced: ['dynastyInfo', 'notableEvents', 'architecturalAnalysis', 'constructionDetails', 'engineeringDetails']
    };
    
    // Valid architectural styles (expandable)
    this.validArchitecturalStyles = [
      'Norman', 'Gothic', 'Renaissance', 'Baroque', 'Romantic Revival', 'Medieval',
      'Byzantine', 'Moorish', 'Romanesque', 'Tudor', 'Georgian', 'Victorian',
      'Fortress Gothic', 'Defensive Medieval', 'Palace Renaissance', 'Neo-Gothic',
      'Islamic', 'Crusader', 'Japanese', 'Chinese', 'Venetian', 'Scottish Baronial',
      'French Chateau', 'German Romantic', 'Neoclassical', 'Art Nouveau', 'Modernist'
    ];
    
    // Valid countries (expandable based on external data)
    this.validCountries = [
      'Germany', 'France', 'United Kingdom', 'Italy', 'Spain', 'Austria', 'Switzerland',
      'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Scotland', 'Wales', 'Ireland',
      'Belgium', 'Netherlands', 'Denmark', 'Sweden', 'Norway', 'Portugal', 'Greece',
      'Turkey', 'Croatia', 'Slovenia', 'Slovakia', 'Estonia', 'Latvia', 'Lithuania',
      'Japan', 'China', 'India', 'Russia', 'Ukraine', 'Bulgaria', 'Serbia', 'Montenegro',
      'Albania', 'Macedonia', 'Bosnia and Herzegovina', 'Moldova', 'Belarus', 'Georgia',
      'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Kyrgyzstan', 'Tajikistan',
      'Turkmenistan', 'Afghanistan', 'Pakistan', 'Iran', 'Iraq', 'Syria', 'Lebanon',
      'Jordan', 'Israel', 'Palestine', 'Cyprus', 'Malta', 'Morocco', 'Algeria', 'Tunisia',
      'Egypt', 'Libya', 'Sudan', 'Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda',
      'Burundi', 'Democratic Republic of Congo', 'Central African Republic', 'Chad',
      'Niger', 'Mali', 'Burkina Faso', 'Ghana', 'Ivory Coast', 'Liberia', 'Sierra Leone',
      'Guinea', 'Guinea-Bissau', 'Senegal', 'Gambia', 'Mauritania', 'Western Sahara',
      'Canada', 'United States', 'Mexico', 'Guatemala', 'Belize', 'Honduras', 'El Salvador',
      'Nicaragua', 'Costa Rica', 'Panama', 'Colombia', 'Venezuela', 'Guyana', 'Suriname',
      'French Guiana', 'Brazil', 'Ecuador', 'Peru', 'Bolivia', 'Paraguay', 'Uruguay',
      'Argentina', 'Chile', 'Australia', 'New Zealand', 'Papua New Guinea', 'Fiji',
      'Solomon Islands', 'Vanuatu', 'New Caledonia', 'Samoa', 'Tonga', 'Kiribati',
      'Tuvalu', 'Nauru', 'Palau', 'Marshall Islands', 'Micronesia'
    ];
    
    // Year validation ranges
    this.yearRange = { min: 500, max: 2025 };
    
    // Text length constraints
    this.textLimits = {
      castleName: { min: 3, max: 100 },
      shortDescription: { min: 20, max: 500 },
      detailedDescription: { min: 100, max: 5000 },
      location: { min: 3, max: 200 }
    };
  }

  /**
   * Main validation method - validates single castle object
   */
  validateCastle(castleData, validationLevel = 'standard') {
    this.clearValidationResults();
    
    if (!castleData || typeof castleData !== 'object') {
      this.addError('INVALID_OBJECT', 'Castle data must be a valid object');
      return this.getValidationResult();
    }
    
    // Core field validation
    this.validateRequiredFields(castleData);
    this.validateFieldTypes(castleData);
    this.validateFieldConstraints(castleData);
    this.validateBusinessLogic(castleData);
    
    // Enhanced validation for detailed castle objects
    if (validationLevel === 'enhanced') {
      this.validateEnhancedFields(castleData);
    }
    
    // Source-specific validation
    if (castleData.source) {
      this.validateSourceSpecific(castleData);
    }
    
    return this.getValidationResult();
  }

  /**
   * Batch validation for multiple castles
   */
  validateCastleBatch(castles, validationLevel = 'standard') {
    const results = [];
    const duplicateCheck = new Set();
    
    for (let i = 0; i < castles.length; i++) {
      const castle = castles[i];
      const validation = this.validateCastle(castle, validationLevel);
      
      // Check for duplicates
      if (castle.id && duplicateCheck.has(castle.id)) {
        validation.errors.push({
          field: 'id',
          code: 'DUPLICATE_ID',
          message: `Duplicate castle ID: ${castle.id}`
        });
      } else if (castle.id) {
        duplicateCheck.add(castle.id);
      }
      
      results.push({
        index: i,
        castle: castle.castleName || 'Unknown',
        validation: validation
      });
    }
    
    return results;
  }

  /**
   * Validate required fields
   */
  validateRequiredFields(castle) {
    for (const field of this.schemas.required) {
      if (!castle[field] || castle[field] === '') {
        this.addError('MISSING_REQUIRED_FIELD', `Required field '${field}' is missing or empty`, field);
      }
    }
  }

  /**
   * Validate field types
   */
  validateFieldTypes(castle) {
    // String fields
    const stringFields = ['id', 'castleName', 'country', 'location', 'architecturalStyle', 'yearBuilt', 'shortDescription'];
    for (const field of stringFields) {
      if (castle[field] && typeof castle[field] !== 'string') {
        this.addError('INVALID_TYPE', `Field '${field}' must be a string`, field);
      }
    }
    
    // Array fields
    if (castle.keyFeatures && !Array.isArray(castle.keyFeatures)) {
      this.addError('INVALID_TYPE', "Field 'keyFeatures' must be an array", 'keyFeatures');
    }
    
    if (castle.historicalTimeline && !Array.isArray(castle.historicalTimeline)) {
      this.addError('INVALID_TYPE', "Field 'historicalTimeline' must be an array", 'historicalTimeline');
    }
    
    // Object fields
    const objectFields = ['dynastyInfo', 'architecturalAnalysis', 'constructionDetails', 'engineeringDetails'];
    for (const field of objectFields) {
      if (castle[field] && (typeof castle[field] !== 'object' || Array.isArray(castle[field]))) {
        this.addError('INVALID_TYPE', `Field '${field}' must be an object`, field);
      }
    }
  }

  /**
   * Validate field constraints and formats
   */
  validateFieldConstraints(castle) {
    // Castle name validation
    if (castle.castleName) {
      if (castle.castleName.length < this.textLimits.castleName.min) {
        this.addError('INVALID_LENGTH', `Castle name too short (min: ${this.textLimits.castleName.min})`, 'castleName');
      }
      if (castle.castleName.length > this.textLimits.castleName.max) {
        this.addError('INVALID_LENGTH', `Castle name too long (max: ${this.textLimits.castleName.max})`, 'castleName');
      }
    }
    
    // Country validation
    if (castle.country && !this.validCountries.includes(castle.country)) {
      this.addWarning('UNKNOWN_COUNTRY', `Country '${castle.country}' not in validated list`, 'country');
    }
    
    // Architectural style validation
    if (castle.architecturalStyle && !this.validArchitecturalStyles.includes(castle.architecturalStyle)) {
      this.addWarning('UNKNOWN_STYLE', `Architectural style '${castle.architecturalStyle}' not in validated list`, 'architecturalStyle');
    }
    
    // Year validation
    if (castle.yearBuilt) {
      const year = this.extractYearFromString(castle.yearBuilt);
      if (year && (year < this.yearRange.min || year > this.yearRange.max)) {
        this.addError('INVALID_YEAR', `Year ${year} outside valid range (${this.yearRange.min}-${this.yearRange.max})`, 'yearBuilt');
      }
    }
    
    // Description length validation
    if (castle.shortDescription) {
      if (castle.shortDescription.length < this.textLimits.shortDescription.min) {
        this.addError('INVALID_LENGTH', `Short description too short (min: ${this.textLimits.shortDescription.min})`, 'shortDescription');
      }
      if (castle.shortDescription.length > this.textLimits.shortDescription.max) {
        this.addError('INVALID_LENGTH', `Short description too long (max: ${this.textLimits.shortDescription.max})`, 'shortDescription');
      }
    }
    
    // ID format validation
    if (castle.id) {
      if (!/^[a-z0-9_]+$/.test(castle.id)) {
        this.addError('INVALID_FORMAT', 'ID must contain only lowercase letters, numbers, and underscores', 'id');
      }
    }
    
    // URL validation
    if (castle.wikiUrl && !this.isValidUrl(castle.wikiUrl)) {
      this.addError('INVALID_URL', 'Invalid Wikipedia URL format', 'wikiUrl');
    }
  }

  /**
   * Validate business logic and data consistency
   */
  validateBusinessLogic(castle) {
    // Check for consistency between year and architectural style
    if (castle.yearBuilt && castle.architecturalStyle) {
      const year = this.extractYearFromString(castle.yearBuilt);
      if (year && castle.architecturalStyle === 'Medieval' && year > 1500) {
        this.addWarning('INCONSISTENT_DATA', 'Medieval style unusual for post-1500 construction', 'architecturalStyle');
      }
      if (year && castle.architecturalStyle === 'Renaissance' && year < 1400) {
        this.addWarning('INCONSISTENT_DATA', 'Renaissance style unusual for pre-1400 construction', 'architecturalStyle');
      }
    }
    
    // Validate key features format
    if (castle.keyFeatures && Array.isArray(castle.keyFeatures)) {
      for (let i = 0; i < castle.keyFeatures.length; i++) {
        if (typeof castle.keyFeatures[i] !== 'string' || castle.keyFeatures[i].length < 3) {
          this.addError('INVALID_FEATURE', `Key feature ${i} must be a meaningful string`, 'keyFeatures');
        }
      }
    }
  }

  /**
   * Enhanced validation for detailed castle objects
   */
  validateEnhancedFields(castle) {
    // Validate historical timeline
    if (castle.historicalTimeline && Array.isArray(castle.historicalTimeline)) {
      castle.historicalTimeline.forEach((entry, index) => {
        if (!entry.year || !entry.event) {
          this.addError('INVALID_TIMELINE', `Timeline entry ${index} missing year or event`, 'historicalTimeline');
        }
      });
    }
    
    // Validate dynasty info
    if (castle.dynastyInfo) {
      if (!castle.dynastyInfo.dynasty) {
        this.addError('MISSING_DYNASTY', 'Dynasty info missing dynasty name', 'dynastyInfo');
      }
    }
    
    // Validate engineering details structure
    if (castle.engineeringDetails) {
      const requiredEngFields = ['foundationEngineering', 'constructionTechniques'];
      for (const field of requiredEngFields) {
        if (!castle.engineeringDetails[field]) {
          this.addWarning('INCOMPLETE_ENGINEERING', `Engineering details missing ${field}`, 'engineeringDetails');
        }
      }
    }
  }

  /**
   * Source-specific validation
   */
  validateSourceSpecific(castle) {
    switch (castle.source) {
      case 'wikipedia':
        if (!castle.wikiUrl) {
          this.addWarning('MISSING_WIKI_URL', 'Wikipedia source should include wikiUrl', 'wikiUrl');
        }
        break;
      case 'unesco':
        if (!castle.unescoId) {
          this.addWarning('MISSING_UNESCO_ID', 'UNESCO source should include unescoId', 'unescoId');
        }
        break;
      case 'algorithmic':
        // Algorithmic sources should have all required fields generated
        if (!castle.lastUpdated) {
          this.addWarning('MISSING_TIMESTAMP', 'Algorithmic source should include timestamp', 'lastUpdated');
        }
        break;
    }
  }

  /**
   * Data sanitization and correction
   */
  sanitizeAndCorrect(castle) {
    const sanitized = { ...castle };
    
    // Trim whitespace from string fields
    const stringFields = ['castleName', 'country', 'location', 'architecturalStyle', 'shortDescription'];
    for (const field of stringFields) {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = sanitized[field].trim();
      }
    }
    
    // Capitalize country names
    if (sanitized.country) {
      sanitized.country = this.capitalizeWords(sanitized.country);
    }
    
    // Ensure ID is lowercase with underscores
    if (sanitized.castleName && !sanitized.id) {
      sanitized.id = this.generateCleanId(sanitized.castleName);
    }
    
    // Add timestamp if missing
    if (!sanitized.lastUpdated) {
      sanitized.lastUpdated = new Date().toISOString();
    }
    
    // Ensure keyFeatures is an array
    if (!sanitized.keyFeatures) {
      sanitized.keyFeatures = ['Historic architecture', 'Cultural significance'];
    }
    
    return sanitized;
  }

  // Utility methods
  clearValidationResults() {
    this.validationErrors = [];
    this.validationWarnings = [];
  }

  addError(code, message, field = null) {
    this.validationErrors.push({ code, message, field, severity: 'error' });
  }

  addWarning(code, message, field = null) {
    this.validationWarnings.push({ code, message, field, severity: 'warning' });
  }

  getValidationResult() {
    return {
      isValid: this.validationErrors.length === 0,
      hasWarnings: this.validationWarnings.length > 0,
      errors: this.validationErrors,
      warnings: this.validationWarnings,
      score: this.calculateValidationScore()
    };
  }

  calculateValidationScore() {
    const errorWeight = 10;
    const warningWeight = 2;
    const maxScore = 100;
    
    const penalties = (this.validationErrors.length * errorWeight) + (this.validationWarnings.length * warningWeight);
    return Math.max(0, maxScore - penalties);
  }

  extractYearFromString(yearString) {
    const matches = yearString.match(/(\d{3,4})/);
    return matches ? parseInt(matches[1]) : null;
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  generateCleanId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  /**
   * Quality assessment for external data sources
   */
  assessDataQuality(castle) {
    let score = 0;
    let maxScore = 0;
    
    // Required fields (40 points total)
    const requiredFields = this.schemas.required;
    for (const field of requiredFields) {
      maxScore += 5;
      if (castle[field] && castle[field] !== '') {
        score += 5;
      }
    }
    
    // Optional enrichment fields (30 points total)
    const enrichmentFields = ['detailedDescription', 'historicalTimeline', 'dynastyInfo', 'keyFeatures'];
    for (const field of enrichmentFields) {
      maxScore += 7.5;
      if (castle[field]) {
        score += 7.5;
      }
    }
    
    // Data quality indicators (30 points total)
    maxScore += 30;
    
    // Detailed description quality
    if (castle.shortDescription && castle.shortDescription.length > 100) score += 5;
    if (castle.detailedDescription && castle.detailedDescription.length > 200) score += 5;
    
    // Timeline completeness
    if (castle.historicalTimeline && castle.historicalTimeline.length > 3) score += 5;
    
    // Source attribution
    if (castle.source && castle.wikiUrl) score += 5;
    
    // Recent updates
    if (castle.lastUpdated) {
      const updateAge = Date.now() - new Date(castle.lastUpdated).getTime();
      if (updateAge < 30 * 24 * 60 * 60 * 1000) score += 5; // Updated within 30 days
    }
    
    // Key features completeness
    if (castle.keyFeatures && castle.keyFeatures.length >= 4) score += 5;
    
    return {
      score: Math.round((score / maxScore) * 100),
      rating: this.getQualityRating(score / maxScore),
      recommendations: this.generateQualityRecommendations(castle)
    };
  }

  getQualityRating(ratio) {
    if (ratio >= 0.9) return 'Excellent';
    if (ratio >= 0.8) return 'Very Good';
    if (ratio >= 0.7) return 'Good';
    if (ratio >= 0.6) return 'Fair';
    if (ratio >= 0.5) return 'Poor';
    return 'Very Poor';
  }

  generateQualityRecommendations(castle) {
    const recommendations = [];
    
    if (!castle.detailedDescription) {
      recommendations.push('Add detailed historical description');
    }
    if (!castle.historicalTimeline || castle.historicalTimeline.length < 3) {
      recommendations.push('Expand historical timeline with more events');
    }
    if (!castle.dynastyInfo) {
      recommendations.push('Add dynasty and ruler information');
    }
    if (!castle.engineeringDetails) {
      recommendations.push('Include architectural and engineering analysis');
    }
    if (!castle.keyFeatures || castle.keyFeatures.length < 4) {
      recommendations.push('Expand key features list');
    }
    
    return recommendations;
  }
}

module.exports = CastleDataValidator;

// CLI usage for testing
if (require.main === module) {
  const validator = new CastleDataValidator();
  
  // Test castle object
  const testCastle = {
    id: 'test_castle',
    castleName: 'Test Castle',
    country: 'Germany',
    location: 'Bavaria',
    architecturalStyle: 'Gothic',
    yearBuilt: '1200-1250',
    shortDescription: 'A magnificent Gothic castle built in the 13th century, showcasing medieval defensive architecture.',
    keyFeatures: ['Gothic towers', 'Defensive walls', 'Great hall', 'Chapel'],
    source: 'test'
  };
  
  console.log('Testing Castle Data Validator...');
  const result = validator.validateCastle(testCastle);
  console.log('Validation Result:', JSON.stringify(result, null, 2));
  
  const quality = validator.assessDataQuality(testCastle);
  console.log('Quality Assessment:', JSON.stringify(quality, null, 2));
  
  const sanitized = validator.sanitizeAndCorrect(testCastle);
  console.log('Sanitized Data:', JSON.stringify(sanitized, null, 2));
}