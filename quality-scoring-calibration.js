#!/usr/bin/env node

/**
 * Quality Scoring Calibration System
 * Fixes N/A quality scores and calibrates scoring algorithm
 * Addresses database synchronization issues between castles.json and castles_unified.json
 */

const fs = require('fs').promises;
const path = require('path');
const CastleDataValidator = require('./castle-data-validator.js');

class QualityScoringCalibration {
  constructor() {
    this.projectRoot = process.cwd();
    this.castlesJsonPath = path.join(this.projectRoot, 'castles.json');
    this.unifiedJsonPath = path.join(this.projectRoot, 'castles_unified.json');
    this.validator = new CastleDataValidator();
    this.calibrationReportPath = path.join(this.projectRoot, 'logs', 'quality_calibration_report.json');
    
    // Calibration settings
    this.scoreMultipliers = {
      'unesco': 1.2,      // Boost UNESCO sources
      'wikipedia': 1.0,   // Standard scoring
      'algorithmic': 0.8  // Slight penalty for algorithmic
    };
    
    this.fieldWeights = {
      'required': 40,     // Base required fields
      'enhanced': 35,     // Enhanced historical data
      'cultural': 15,     // Cultural significance
      'technical': 10     // Technical details
    };
  }

  /**
   * Diagnose and fix quality scoring issues
   */
  async calibrateQualityScoring() {
    console.log('Starting quality scoring calibration...');
    
    const calibrationResults = {
      totalCastles: 0,
      fixedScores: 0,
      averageScore: 0,
      scoreDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
      issues: [],
      fixes: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Load castles from both databases
      const castlesData = await this.loadCastlesDatabases();
      const { castles, syncIssues } = castlesData;
      
      calibrationResults.totalCastles = castles.length;
      calibrationResults.syncIssues = syncIssues;

      console.log(`Calibrating quality scores for ${castles.length} castles...`);
      
      let totalScore = 0;
      const updatedCastles = [];

      for (const castle of castles) {
        try {
          const originalScore = castle.qualityScore;
          
          // Calculate new calibrated quality score
          const newScore = await this.calculateCalibratedQualityScore(castle);
          
          // Update castle with new score
          const updatedCastle = {
            ...castle,
            qualityScore: newScore,
            lastQualityUpdate: new Date().toISOString()
          };
          
          updatedCastles.push(updatedCastle);
          totalScore += newScore;
          
          // Track fixes
          if (originalScore === undefined || originalScore === null || isNaN(originalScore)) {
            calibrationResults.fixedScores++;
            calibrationResults.fixes.push({
              castle: castle.castleName,
              oldScore: originalScore,
              newScore: newScore,
              reason: 'Missing or invalid quality score'
            });
          } else if (Math.abs(originalScore - newScore) > 10) {
            calibrationResults.fixes.push({
              castle: castle.castleName,
              oldScore: originalScore,
              newScore: newScore,
              reason: 'Significant score adjustment'
            });
          }
          
          // Update score distribution
          if (newScore >= 85) calibrationResults.scoreDistribution.excellent++;
          else if (newScore >= 70) calibrationResults.scoreDistribution.good++;
          else if (newScore >= 50) calibrationResults.scoreDistribution.fair++;
          else calibrationResults.scoreDistribution.poor++;
          
        } catch (error) {
          calibrationResults.issues.push({
            castle: castle.castleName || 'Unknown',
            error: error.message
          });
        }
      }

      calibrationResults.averageScore = Math.round(totalScore / castles.length);
      
      // Save updated castles to both databases
      await this.saveUpdatedCastles(updatedCastles);
      
      // Generate calibration report
      await this.saveCalibrationReport(calibrationResults);
      
      console.log(`Quality calibration completed:`);
      console.log(`- Fixed ${calibrationResults.fixedScores} missing/invalid scores`);
      console.log(`- Average quality score: ${calibrationResults.averageScore}`);
      console.log(`- Distribution: ${calibrationResults.scoreDistribution.excellent} excellent, ${calibrationResults.scoreDistribution.good} good, ${calibrationResults.scoreDistribution.fair} fair, ${calibrationResults.scoreDistribution.poor} poor`);
      
      return calibrationResults;
      
    } catch (error) {
      console.error('Calibration error:', error.message);
      calibrationResults.issues.push({ general: error.message });
      return calibrationResults;
    }
  }

  /**
   * Load castles from both database files and identify sync issues
   */
  async loadCastlesDatabases() {
    const result = {
      castles: [],
      syncIssues: []
    };

    try {
      // Try to load unified database first
      const unifiedData = await fs.readFile(this.unifiedJsonPath, 'utf8');
      const unifiedCastles = JSON.parse(unifiedData);
      result.castles = Array.isArray(unifiedCastles) ? unifiedCastles : [];
      console.log(`Loaded ${result.castles.length} castles from unified database`);
      
      // Check if regular castles.json exists and compare
      try {
        const regularData = await fs.readFile(this.castlesJsonPath, 'utf8');
        const regularCastles = JSON.parse(regularData);
        
        if (Array.isArray(regularCastles) && regularCastles.length !== result.castles.length) {
          result.syncIssues.push({
            type: 'count_mismatch',
            unifiedCount: result.castles.length,
            regularCount: regularCastles.length,
            message: 'Database count mismatch between castles.json and castles_unified.json'
          });
        }
      } catch (regularError) {
        result.syncIssues.push({
          type: 'missing_regular_db',
          message: 'castles.json not found, only unified database exists'
        });
      }
      
    } catch (unifiedError) {
      // Fallback to regular castles.json
      try {
        const regularData = await fs.readFile(this.castlesJsonPath, 'utf8');
        const regularCastles = JSON.parse(regularData);
        result.castles = Array.isArray(regularCastles) ? regularCastles : [];
        console.log(`Loaded ${result.castles.length} castles from regular database (unified not found)`);
        
        result.syncIssues.push({
          type: 'missing_unified_db',
          message: 'castles_unified.json not found, using castles.json only'
        });
        
      } catch (regularError) {
        console.log('No castle databases found, returning empty array');
        result.syncIssues.push({
          type: 'no_databases',
          message: 'Neither castles.json nor castles_unified.json found'
        });
      }
    }

    return result;
  }

  /**
   * Calculate calibrated quality score for a castle
   */
  async calculateCalibratedQualityScore(castle) {
    // Get base quality assessment from validator
    const baseQuality = this.validator.assessDataQuality(castle);
    let score = baseQuality.score;
    
    // Apply source-based multiplier
    const sourceMultiplier = this.scoreMultipliers[castle.source] || 1.0;
    score *= sourceMultiplier;
    
    // Add bonuses for enhanced fields
    const enhancementBonus = this.calculateEnhancementBonus(castle);
    score += enhancementBonus;
    
    // Apply field-based weighting adjustments
    const fieldBonus = this.calculateFieldBonus(castle);
    score += fieldBonus;
    
    // Ensure score is within valid range
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    return score;
  }

  /**
   * Calculate bonus points for enhanced data
   */
  calculateEnhancementBonus(castle) {
    let bonus = 0;
    
    // Enhanced historical data
    if (castle.historicalTimeline && castle.historicalTimeline.length > 3) bonus += 5;
    if (castle.dynastyInfo && castle.dynastyInfo.dynasty) bonus += 5;
    if (castle.notableEvents && castle.notableEvents.length > 0) bonus += 3;
    
    // Architectural and engineering details
    if (castle.architecturalAnalysis) bonus += 4;
    if (castle.constructionDetails) bonus += 4;
    if (castle.engineeringDetails) bonus += 6;
    
    // Cultural significance
    if (castle.culturalSignificance) bonus += 3;
    if (castle.legends && castle.legends.length > 0) bonus += 2;
    
    // Recent updates and source attribution
    if (castle.lastUpdated) bonus += 2;
    if (castle.wikiUrl || castle.unescoUrl) bonus += 2;
    
    return Math.min(20, bonus); // Cap enhancement bonus at 20 points
  }

  /**
   * Calculate field-based bonus points
   */
  calculateFieldBonus(castle) {
    let bonus = 0;
    
    // Length and quality of descriptions
    if (castle.detailedDescription && castle.detailedDescription.length > 500) bonus += 3;
    if (castle.shortDescription && castle.shortDescription.length > 100) bonus += 2;
    
    // Key features completeness
    if (castle.keyFeatures && castle.keyFeatures.length >= 6) bonus += 2;
    
    // UNESCO heritage status
    if (castle.source === 'unesco' || castle.unescoId) bonus += 5;
    
    // Visitor and heritage information
    if (castle.visitorInformation) bonus += 3;
    if (castle.heritage) bonus += 3;
    
    return Math.min(15, bonus); // Cap field bonus at 15 points
  }

  /**
   * Save updated castles to both database files
   */
  async saveUpdatedCastles(castles) {
    try {
      // Save to primary castles.json
      await fs.writeFile(this.castlesJsonPath, JSON.stringify(castles, null, 2));
      console.log(`Updated castles.json with ${castles.length} castles`);
      
      // Save to unified database
      await fs.writeFile(this.unifiedJsonPath, JSON.stringify(castles, null, 2));
      console.log(`Updated castles_unified.json with ${castles.length} castles`);
      
    } catch (error) {
      console.error('Error saving updated castles:', error.message);
      throw error;
    }
  }

  /**
   * Save calibration report
   */
  async saveCalibrationReport(report) {
    try {
      await fs.writeFile(this.calibrationReportPath, JSON.stringify(report, null, 2));
      console.log('Calibration report saved to logs/quality_calibration_report.json');
    } catch (error) {
      console.log('Could not save calibration report:', error.message);
    }
  }

  /**
   * Create UNESCO fallback system to handle API connectivity issues
   */
  async createUnescoFallback() {
    console.log('Creating UNESCO API fallback system...');
    
    // Create static UNESCO castle data for fallback
    const staticUnescoData = [
      {
        id: 'kronborg_castle_unesco',
        castleName: 'Kronborg Castle',
        country: 'Denmark',
        location: 'Helsingør, Zealand',
        architecturalStyle: 'Renaissance',
        yearBuilt: '1574-1585',
        shortDescription: 'Kronborg Castle is a magnificent Renaissance castle and UNESCO World Heritage Site, famous as the setting of Shakespeare\'s Hamlet. This fortress controlled the strategic Øresund strait for centuries.',
        keyFeatures: ['UNESCO World Heritage Site', 'Renaissance architecture', 'Shakespeare\'s Hamlet setting', 'Maritime fortress', 'Royal apartments', 'Strategic position'],
        source: 'unesco_fallback',
        unescoId: '696',
        unescoUrl: 'https://whc.unesco.org/en/list/696/',
        inscriptionYear: '2000',
        qualityScore: 95,
        heritageStatus: {
          unescoStatus: 'World Heritage Site',
          inscriptionYear: '2000',
          criteria: 'Outstanding example of Renaissance castle'
        }
      },
      {
        id: 'wartburg_castle_unesco',
        castleName: 'Wartburg Castle',
        country: 'Germany',
        location: 'Eisenach, Thuringia',
        architecturalStyle: 'Medieval with Romanesque elements',
        yearBuilt: '1067',
        shortDescription: 'Wartburg Castle is a UNESCO World Heritage Site and one of Germany\'s most important castles, where Martin Luther translated the New Testament and where the medieval Minnesänger tradition flourished.',
        keyFeatures: ['UNESCO World Heritage Site', 'Luther\'s refuge', 'Medieval architecture', 'Minnesänger tradition', 'Historic significance', 'Romanesque elements'],
        source: 'unesco_fallback',
        unescoId: '897',
        unescoUrl: 'https://whc.unesco.org/en/list/897/',
        inscriptionYear: '1999',
        qualityScore: 96,
        heritageStatus: {
          unescoStatus: 'World Heritage Site',
          inscriptionYear: '1999',
          criteria: 'Outstanding cultural and religious significance'
        }
      },
      {
        id: 'beaumaris_castle_unesco',
        castleName: 'Beaumaris Castle',
        country: 'United Kingdom',
        location: 'Anglesey, Wales',
        architecturalStyle: 'Concentric castle design',
        yearBuilt: '1295',
        shortDescription: 'Beaumaris Castle, part of the UNESCO World Heritage "Castles and Town Walls of King Edward in Gwynedd", represents the pinnacle of medieval military architecture with its innovative concentric design.',
        keyFeatures: ['UNESCO World Heritage Site', 'Concentric castle design', 'Edward I fortification', 'Military architecture', 'Medieval engineering', 'Welsh castle'],
        source: 'unesco_fallback',
        unescoId: '374',
        unescoUrl: 'https://whc.unesco.org/en/list/374/',
        inscriptionYear: '1986',
        qualityScore: 94,
        heritageStatus: {
          unescoStatus: 'World Heritage Site',
          inscriptionYear: '1986',
          criteria: 'Outstanding example of military architecture'
        }
      }
    ];
    
    // Save fallback data
    const fallbackPath = path.join(this.projectRoot, 'castle_cache', 'unesco_fallback.json');
    await fs.mkdir(path.dirname(fallbackPath), { recursive: true });
    await fs.writeFile(fallbackPath, JSON.stringify(staticUnescoData, null, 2));
    
    console.log(`Created UNESCO fallback with ${staticUnescoData.length} high-quality castle entries`);
    return staticUnescoData;
  }

  /**
   * Test quality scoring system
   */
  async testQualityScoring() {
    console.log('Testing quality scoring system...');
    
    const testCastle = {
      id: 'test_quality_castle',
      castleName: 'Test Quality Castle',
      country: 'Germany',
      location: 'Bavaria',
      architecturalStyle: 'Gothic',
      yearBuilt: '1200-1250',
      shortDescription: 'A comprehensive test castle with detailed information for quality scoring validation.',
      detailedDescription: 'This castle represents a comprehensive example of Gothic architecture with extensive historical documentation, detailed engineering analysis, and rich cultural significance that spans multiple centuries of European history.',
      keyFeatures: ['Gothic architecture', 'Defensive walls', 'Great hall', 'Chapel', 'Tower keep', 'Museum'],
      historicalTimeline: [
        { year: '1200', event: 'Construction begins' },
        { year: '1250', event: 'Castle completed' },
        { year: '1400', event: 'Renaissance modifications' },
        { year: '1800', event: 'Restoration begins' }
      ],
      dynastyInfo: {
        dynasty: 'House of Test',
        significance: 'Important medieval fortress'
      },
      architecturalAnalysis: {
        defensiveFeatures: 'Multi-layered defensive system',
        materials: ['Local stone', 'Imported marble']
      },
      source: 'wikipedia',
      wikiUrl: 'https://example.com/castle',
      lastUpdated: new Date().toISOString()
    };
    
    const score = await this.calculateCalibratedQualityScore(testCastle);
    console.log(`Test castle quality score: ${score}/100`);
    
    return score;
  }
}

module.exports = QualityScoringCalibration;

// CLI usage
if (require.main === module) {
  const calibration = new QualityScoringCalibration();
  
  async function runCalibration() {
    try {
      console.log('🔧 Starting Quality Scoring Calibration System...\n');
      
      // Test the scoring system
      await calibration.testQualityScoring();
      console.log('');
      
      // Create UNESCO fallback for connectivity issues
      await calibration.createUnescoFallback();
      console.log('');
      
      // Run full calibration
      const results = await calibration.calibrateQualityScoring();
      
      console.log('\n✅ Quality scoring calibration completed!');
      console.log('📊 Results summary:');
      console.log(`   - Total castles processed: ${results.totalCastles}`);
      console.log(`   - Scores fixed: ${results.fixedScores}`);
      console.log(`   - Average quality: ${results.averageScore}/100`);
      console.log(`   - Database sync issues: ${results.syncIssues.length}`);
      
    } catch (error) {
      console.error('❌ Calibration failed:', error.message);
    }
  }
  
  runCalibration();
}