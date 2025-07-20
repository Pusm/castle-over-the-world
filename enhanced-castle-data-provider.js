#!/usr/bin/env node

const CastleDataProvider = require('./castle-data-provider.js');
const UnescoApiIntegration = require('./unesco-api-integration.js');
const CastleDataValidator = require('./castle-data-validator.js');
const fs = require('fs').promises;
const path = require('path');

/**
 * Enhanced Castle Data Provider with Validation and Multiple Sources
 * Integrates Wikipedia API, UNESCO API, algorithmic generation with comprehensive validation
 * Supports unlimited scalability toward 10,000+ castle goal
 */

class EnhancedCastleDataProvider {
  constructor() {
    this.baseProvider = new CastleDataProvider();
    this.unescoProvider = new UnescoApiIntegration();
    this.validator = new CastleDataValidator();
    
    this.projectRoot = process.cwd();
    this.qualityReportPath = path.join(this.projectRoot, 'logs', 'data_quality_report.json');
    this.sourceStatsPath = path.join(this.projectRoot, 'logs', 'source_statistics.json');
    
    // Quality thresholds
    this.qualityThresholds = {
      minimum: 60, // Minimum quality score for inclusion
      excellent: 85, // Threshold for excellent quality
      sourceBalance: 0.7 // Maximum proportion from single source
    };
    
    // Source priorities (higher number = higher priority)
    this.sourcePriorities = {
      'unesco': 10,
      'wikipedia': 8,
      'wikidata': 7,
      'mixed': 6,
      'algorithmic': 3
    };
    
    this.initializeLogging();
  }

  async initializeLogging() {
    try {
      const logsDir = path.join(this.projectRoot, 'logs');
      await fs.mkdir(logsDir, { recursive: true });
    } catch (error) {
      console.log('Logging setup:', error.message);
    }
  }

  /**
   * Get validated castle data from multiple sources
   */
  async getValidatedCastleData(options = {}) {
    const {
      sources = ['unesco', 'wikipedia', 'algorithmic'],
      limit = 10,
      qualityLevel = 'standard',
      countries = null,
      ensureQuality = true
    } = options;

    console.log(`Fetching ${limit} castles from sources: ${sources.join(', ')}`);
    
    const results = {
      castles: [],
      qualityReport: [],
      sourceStats: {},
      errors: []
    };

    try {
      // Collect data from all requested sources
      const rawCastleData = await this.collectFromSources(sources, limit, countries);
      
      // Validate and process each castle
      for (const castle of rawCastleData) {
        try {
          const validationResult = await this.processAndValidateCastle(castle, qualityLevel, ensureQuality);
          
          if (validationResult.isValid || !ensureQuality) {
            results.castles.push(validationResult.castle);
            results.qualityReport.push({
              id: castle.id,
              name: castle.castleName,
              source: castle.source,
              quality: validationResult.quality,
              validation: validationResult.validation
            });
          }
        } catch (error) {
          results.errors.push({
            castle: castle.castleName || 'Unknown',
            error: error.message
          });
        }
      }

      // Generate source statistics
      results.sourceStats = this.generateSourceStatistics(results.castles);
      
      // Ensure diversity of sources
      if (ensureQuality) {
        results.castles = this.ensureSourceDiversity(results.castles);
      }

      // Save quality report
      await this.saveQualityReport(results.qualityReport);
      await this.saveSourceStatistics(results.sourceStats);

      console.log(`Successfully processed ${results.castles.length} validated castles`);
      return results.castles;

    } catch (error) {
      console.error('Error in enhanced castle data provider:', error.message);
      results.errors.push({ general: error.message });
      return results.castles;
    }
  }

  /**
   * Collect raw castle data from multiple sources
   */
  async collectFromSources(sources, totalLimit, countries) {
    const rawData = [];
    const perSourceLimit = Math.ceil(totalLimit / sources.length);

    for (const source of sources) {
      try {
        console.log(`Fetching from ${source}...`);
        let sourceData = [];

        switch (source) {
          case 'unesco':
            sourceData = await this.unescoProvider.getCastleData(perSourceLimit);
            break;
          
          case 'wikipedia':
            if (countries && countries.length > 0) {
              for (const country of countries.slice(0, 3)) { // Limit to 3 countries per request
                const countryData = await this.baseProvider.getCastleData('wikipedia', country, Math.ceil(perSourceLimit / 3));
                sourceData.push(...countryData);
              }
            } else {
              sourceData = await this.baseProvider.getCastleData('wikipedia', 'England', perSourceLimit);
            }
            break;
          
          case 'algorithmic':
            sourceData = await this.baseProvider.getCastleData('algorithmic', null, perSourceLimit);
            break;
          
          case 'mixed':
            sourceData = await this.baseProvider.getCastleData('mixed', null, perSourceLimit);
            break;
        }

        rawData.push(...sourceData);
        console.log(`Retrieved ${sourceData.length} castles from ${source}`);
        
        // Rate limiting between sources
        await this.delay(500);
        
      } catch (error) {
        console.log(`Error fetching from ${source}: ${error.message}`);
      }
    }

    return rawData;
  }

  /**
   * Process and validate individual castle data
   */
  async processAndValidateCastle(castle, qualityLevel, ensureQuality) {
    // Sanitize and correct basic data issues
    const sanitizedCastle = this.validator.sanitizeAndCorrect(castle);
    
    // Validate castle data
    const validation = this.validator.validateCastle(sanitizedCastle, qualityLevel);
    
    // Assess data quality
    const quality = this.validator.assessDataQuality(sanitizedCastle);
    
    // Apply quality threshold if required
    const isValid = !ensureQuality || quality.score >= this.qualityThresholds.minimum;
    
    // Enhance with additional data if quality is low
    let enhancedCastle = sanitizedCastle;
    if (ensureQuality && quality.score < this.qualityThresholds.excellent) {
      enhancedCastle = await this.enhanceCastleData(sanitizedCastle);
    }
    
    return {
      castle: enhancedCastle,
      validation: validation,
      quality: quality,
      isValid: isValid
    };
  }

  /**
   * Enhance castle data with additional information
   */
  async enhanceCastleData(castle) {
    const enhanced = { ...castle };
    
    // Add missing key features if needed
    if (!enhanced.keyFeatures || enhanced.keyFeatures.length < 4) {
      enhanced.keyFeatures = this.generateEnhancedKeyFeatures(enhanced);
    }
    
    // Enhance description if too short
    if (!enhanced.detailedDescription && enhanced.shortDescription) {
      enhanced.detailedDescription = await this.generateDetailedDescription(enhanced);
    }
    
    // Add historical timeline if missing
    if (!enhanced.historicalTimeline) {
      enhanced.historicalTimeline = this.generateBasicTimeline(enhanced);
    }
    
    // Add dynasty info for medieval castles
    if (!enhanced.dynastyInfo && this.isHistoricalCastle(enhanced)) {
      enhanced.dynastyInfo = this.generateDynastyInfo(enhanced);
    }
    
    // Add architectural analysis
    if (!enhanced.architecturalAnalysis) {
      enhanced.architecturalAnalysis = this.generateArchitecturalAnalysis(enhanced);
    }
    
    // Mark as enhanced
    enhanced.enhanced = true;
    enhanced.enhancementDate = new Date().toISOString();
    
    return enhanced;
  }

  /**
   * Generate enhanced key features based on style and period
   */
  generateEnhancedKeyFeatures(castle) {
    const baseFeatures = castle.keyFeatures || [];
    const enhancedFeatures = [...baseFeatures];
    
    const styleFeatures = {
      'Gothic': ['Flying buttresses', 'Pointed arches', 'Rose windows', 'Ribbed vaulting'],
      'Norman': ['Round arches', 'Massive walls', 'Keep tower', 'Barrel vaulting'],
      'Renaissance': ['Classical proportions', 'Symmetrical design', 'Decorative gardens', 'Artillery adaptations'],
      'Medieval': ['Defensive walls', 'Gatehouse complex', 'Great hall', 'Chapel or church'],
      'Islamic': ['Geometric patterns', 'Courtyard layout', 'Decorative tilework', 'Water features'],
      'Baroque': ['Ornate facades', 'Grand staircases', 'Formal gardens', 'State apartments']
    };
    
    const style = castle.architecturalStyle;
    if (style && styleFeatures[style]) {
      const relevantFeatures = styleFeatures[style].filter(f => 
        !enhancedFeatures.some(existing => existing.toLowerCase().includes(f.toLowerCase()))
      );
      enhancedFeatures.push(...relevantFeatures.slice(0, 2));
    }
    
    // Add source-specific features
    if (castle.source === 'unesco') {
      enhancedFeatures.push('UNESCO World Heritage Site');
    }
    
    // Add period-specific features
    const year = this.extractYearFromString(castle.yearBuilt);
    if (year) {
      if (year < 1200) enhancedFeatures.push('Early medieval construction');
      else if (year < 1500) enhancedFeatures.push('High medieval period');
      else if (year < 1700) enhancedFeatures.push('Renaissance modifications');
    }
    
    return enhancedFeatures.slice(0, 8); // Limit to 8 features
  }

  /**
   * Generate detailed description
   */
  async generateDetailedDescription(castle) {
    const base = castle.shortDescription || '';
    const style = castle.architecturalStyle || 'Medieval';
    const country = castle.country || 'Europe';
    const year = castle.yearBuilt || 'Medieval period';
    
    const template = `${base} 
    
Built during the ${year}, ${castle.castleName} represents the architectural traditions of ${country} during this significant historical period. The castle's ${style.toLowerCase()} design showcases the defensive and artistic priorities of its builders, reflecting both practical military requirements and the cultural values of its time.

The strategic positioning of ${castle.castleName} demonstrates the sophisticated understanding of medieval military engineering, while its architectural details reveal the artistic and cultural influences that shaped ${country}'s built heritage. Over the centuries, the castle has witnessed significant historical events and continues to serve as an important cultural landmark.`;

    return template.trim();
  }

  /**
   * Generate basic historical timeline
   */
  generateBasicTimeline(castle) {
    const year = this.extractYearFromString(castle.yearBuilt);
    const timeline = [];
    
    if (year) {
      timeline.push({
        year: year.toString(),
        event: `Construction of ${castle.castleName} begins`
      });
      
      if (year < 1500) {
        timeline.push({
          year: (year + 50).toString(),
          event: 'Major fortification improvements completed'
        });
      }
      
      timeline.push({
        year: '1800s',
        event: 'Castle preservation and restoration efforts begin'
      });
      
      timeline.push({
        year: 'Modern era',
        event: 'Recognized as important cultural heritage site'
      });
    }
    
    return timeline;
  }

  /**
   * Generate dynasty information
   */
  generateDynastyInfo(castle) {
    const countryDynasties = {
      'France': 'Capetian Dynasty',
      'England': 'Norman Dynasty',
      'Germany': 'Holy Roman Empire',
      'Spain': 'Castilian Crown',
      'Italy': 'Medieval City-States',
      'Scotland': 'Scottish Crown'
    };
    
    const dynasty = countryDynasties[castle.country] || 'Medieval Nobility';
    
    return {
      dynasty: dynasty,
      significance: `Important fortress in the territorial control of ${castle.country}`,
      dynastyOrigin: `Medieval noble house controlling the region of ${castle.location || 'the area'}`
    };
  }

  /**
   * Generate architectural analysis
   */
  generateArchitecturalAnalysis(castle) {
    return {
      defensiveFeatures: `Strategic positioning and fortified design typical of ${castle.architecturalStyle || 'medieval'} military architecture`,
      materials: ['Local stone', 'Timber construction', 'Iron reinforcements'],
      structuralInnovations: [
        `${castle.architecturalStyle || 'Medieval'} construction techniques`,
        'Defensive wall design optimized for the period',
        'Integration with natural landscape features'
      ]
    };
  }

  /**
   * Generate source statistics
   */
  generateSourceStatistics(castles) {
    const stats = {
      total: castles.length,
      bySources: {},
      byCountries: {},
      byStyles: {},
      qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
      averageQuality: 0,
      timestamp: new Date().toISOString()
    };
    
    let totalQuality = 0;
    
    for (const castle of castles) {
      // Source distribution
      const source = castle.source || 'unknown';
      stats.bySources[source] = (stats.bySources[source] || 0) + 1;
      
      // Country distribution
      const country = castle.country || 'Unknown';
      stats.byCountries[country] = (stats.byCountries[country] || 0) + 1;
      
      // Style distribution
      const style = castle.architecturalStyle || 'Unknown';
      stats.byStyles[style] = (stats.byStyles[style] || 0) + 1;
      
      // Quality assessment (if available)
      if (castle.qualityScore) {
        totalQuality += castle.qualityScore;
        if (castle.qualityScore >= 85) stats.qualityDistribution.excellent++;
        else if (castle.qualityScore >= 70) stats.qualityDistribution.good++;
        else if (castle.qualityScore >= 50) stats.qualityDistribution.fair++;
        else stats.qualityDistribution.poor++;
      }
    }
    
    if (castles.length > 0) {
      stats.averageQuality = Math.round(totalQuality / castles.length);
    }
    
    return stats;
  }

  /**
   * Ensure diversity of sources
   */
  ensureSourceDiversity(castles) {
    const sourceGroups = {};
    const maxFromSingleSource = Math.ceil(castles.length * this.qualityThresholds.sourceBalance);
    
    // Group by source
    for (const castle of castles) {
      const source = castle.source || 'unknown';
      if (!sourceGroups[source]) sourceGroups[source] = [];
      sourceGroups[source].push(castle);
    }
    
    // Limit each source and prioritize
    const balanced = [];
    const sortedSources = Object.keys(sourceGroups).sort((a, b) => 
      (this.sourcePriorities[b] || 0) - (this.sourcePriorities[a] || 0)
    );
    
    for (const source of sortedSources) {
      const sourceItems = sourceGroups[source].slice(0, maxFromSingleSource);
      balanced.push(...sourceItems);
    }
    
    return balanced;
  }

  /**
   * Get next batch for unlimited expansion
   */
  async getNextCastleBatch(existingCastleIds = [], batchSize = 10, options = {}) {
    const newCastles = await this.getValidatedCastleData({
      ...options,
      limit: batchSize * 2 // Get extra to account for duplicates
    });
    
    // Filter out existing castles
    const uniqueCastles = newCastles.filter(castle => 
      !existingCastleIds.includes(castle.id)
    );
    
    return uniqueCastles.slice(0, batchSize);
  }

  // Utility methods
  extractYearFromString(yearString) {
    const matches = yearString.match(/(\d{3,4})/);
    return matches ? parseInt(matches[1]) : null;
  }

  isHistoricalCastle(castle) {
    const year = this.extractYearFromString(castle.yearBuilt || '');
    return year && year < 1700;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Logging methods
  async saveQualityReport(report) {
    try {
      await fs.writeFile(this.qualityReportPath, JSON.stringify(report, null, 2));
    } catch (error) {
      console.log('Could not save quality report:', error.message);
    }
  }

  async saveSourceStatistics(stats) {
    try {
      await fs.writeFile(this.sourceStatsPath, JSON.stringify(stats, null, 2));
    } catch (error) {
      console.log('Could not save source statistics:', error.message);
    }
  }
}

module.exports = EnhancedCastleDataProvider;

// CLI testing
if (require.main === module) {
  const provider = new EnhancedCastleDataProvider();
  
  async function test() {
    try {
      console.log('Testing Enhanced Castle Data Provider...');
      
      // Test with multiple sources
      const castles = await provider.getValidatedCastleData({
        sources: ['unesco', 'wikipedia', 'algorithmic'],
        limit: 15,
        qualityLevel: 'enhanced',
        ensureQuality: true
      });
      
      console.log(`\nGenerated ${castles.length} validated castles:`);
      
      castles.forEach((castle, index) => {
        console.log(`${index + 1}. ${castle.castleName} (${castle.country})`);
        console.log(`   Source: ${castle.source}, Style: ${castle.architecturalStyle}`);
        console.log(`   Features: ${castle.keyFeatures.slice(0, 3).join(', ')}`);
        if (castle.enhanced) {
          console.log(`   ✨ Enhanced with additional data`);
        }
        console.log('');
      });
      
      console.log('✅ Enhanced provider test completed successfully!');
    } catch (error) {
      console.error('Test error:', error.message);
    }
  }
  
  test();
}