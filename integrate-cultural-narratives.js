#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Integration script for Worker3's enhanced cultural narratives
 * Merges enhanced-cultural-narratives-phase2.json into castles_unified.json
 */

class CulturalNarrativeIntegrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.unifiedDbPath = path.join(this.projectRoot, 'castles_unified.json');
    this.enhancedNarrativesPath = path.join(this.projectRoot, 'enhanced-cultural-narratives-phase2.json');
    this.originalNarrativesPath = path.join(this.projectRoot, 'enhanced-cultural-narratives.json');
  }

  // Map enhanced narrative keys to castle IDs
  getCastleIdMapping() {
    return {
      'palace_of_versailles': 'palace_of_versailles',
      'himeji_castle': 'himeji_castle', 
      'chateau_de_chambord': 'chateau_de_chambord',
      'alcazar_of_segovia': 'alcazar_of_segovia',
      'hohenzollern_castle': 'hohenzollern_castle',
      'warwick_castle': 'warwick_castle',
      'prague_castle': 'prague_castle',
      'alhambra_palace': 'alhambra_palace',
      'mont_saint_michel': 'mont_saint_michel'
    };
  }

  async loadEnhancedNarratives() {
    try {
      // Load phase 2 narratives (new castles)
      const phase2Data = await fs.readFile(this.enhancedNarrativesPath, 'utf8');
      const phase2Narratives = JSON.parse(phase2Data).enhancedCulturalNarrativesPhase2;

      // Load original narratives (existing castles)
      const originalData = await fs.readFile(this.originalNarrativesPath, 'utf8');
      const originalNarratives = JSON.parse(originalData).enhancedCulturalNarratives;

      // Combine both sets
      return { ...originalNarratives, ...phase2Narratives };
    } catch (error) {
      console.error('Error loading enhanced narratives:', error.message);
      return {};
    }
  }

  async loadUnifiedDatabase() {
    try {
      const data = await fs.readFile(this.unifiedDbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading unified database:', error.message);
      return [];
    }
  }

  transformNarrativeData(narrativeData) {
    const transformed = {
      culturalSignificance: narrativeData.culturalSignificance || '',
      legends: [],
      historicalEvents: [],
      folklore: [],
      ghostStories: [],
      socialHistory: narrativeData.socialHistory || '',
      politicalSignificance: narrativeData.politicalSignificance || '',
      literaryConnections: narrativeData.literaryConnections || '',
      academicSources: narrativeData.academicSources || []
    };

    // Transform legends array to string array format
    if (narrativeData.legends && Array.isArray(narrativeData.legends)) {
      transformed.legends = narrativeData.legends.map(legend => 
        `${legend.title}: ${legend.narrative}`
      );
    }

    // Transform historical events
    if (narrativeData.historicalEvents && Array.isArray(narrativeData.historicalEvents)) {
      transformed.historicalEvents = narrativeData.historicalEvents.map(event => {
        if (typeof event === 'object' && event.name) {
          return `${event.date || event.name}: ${event.significance || event.outcome || 'Historical significance'}`;
        }
        return event;
      });
    }

    // Transform historical battles (for some castles)
    if (narrativeData.historicalBattles) {
      narrativeData.historicalBattles.forEach(battle => {
        transformed.historicalEvents.push(
          `${battle.name} (${battle.participants}): ${battle.significance}`
        );
      });
    }

    // Transform samurai battles (for Himeji)
    if (narrativeData.samuraiBattles) {
      narrativeData.samuraiBattles.forEach(battle => {
        transformed.historicalEvents.push(
          `${battle.name} (${battle.context}): ${battle.significance}`
        );
      });
    }

    // Transform folklore
    if (narrativeData.folklore && Array.isArray(narrativeData.folklore)) {
      transformed.folklore = narrativeData.folklore.map(folk => 
        `${folk.tradition || folk.title}: ${folk.story || folk.narrative}`
      );
    }

    // Transform ghost stories
    if (narrativeData.ghostStories && Array.isArray(narrativeData.ghostStories)) {
      transformed.ghostStories = narrativeData.ghostStories.map(ghost => 
        `${ghost.spirit} (${ghost.location}): ${ghost.story}`
      );
    }

    // Handle special fields for specific castles
    if (narrativeData.religiousSignificance) {
      transformed.religiousSignificance = narrativeData.religiousSignificance;
    }

    if (narrativeData.architecturalSymbolism) {
      transformed.architecturalSymbolism = narrativeData.architecturalSymbolism;
    }

    if (narrativeData.interculturalExchange) {
      transformed.interculturalExchange = narrativeData.interculturalExchange;
    }

    return transformed;
  }

  async integrateNarratives() {
    console.log('Starting cultural narrative integration...');

    const enhancedNarratives = await this.loadEnhancedNarratives();
    const unifiedDatabase = await this.loadUnifiedDatabase();
    const castleIdMapping = this.getCastleIdMapping();

    let integratedCount = 0;
    let enhancedCount = 0;

    // Process each castle in the unified database
    for (let castle of unifiedDatabase) {
      const narrativeKey = Object.keys(castleIdMapping).find(key => 
        castleIdMapping[key] === castle.id || 
        key.replace(/_/g, '_').toLowerCase() === castle.id.toLowerCase()
      );

      if (narrativeKey && enhancedNarratives[narrativeKey]) {
        console.log(`Integrating narratives for: ${castle.castleName}`);
        
        const narrativeData = enhancedNarratives[narrativeKey];
        const transformedData = this.transformNarrativeData(narrativeData);

        // Merge transformed data into castle object
        Object.assign(castle, transformedData);
        
        integratedCount++;
      } else if (castle.culturalSignificance && castle.legends) {
        // Castle already has enhanced data
        enhancedCount++;
      }
    }

    console.log(`Integration complete:`);
    console.log(`- Newly integrated castles: ${integratedCount}`);
    console.log(`- Previously enhanced castles: ${enhancedCount}`);
    console.log(`- Total castles in database: ${unifiedDatabase.length}`);

    return unifiedDatabase;
  }

  async saveIntegratedDatabase(integratedData) {
    try {
      const backupPath = `${this.unifiedDbPath}.backup.${Date.now()}`;
      
      // Create backup
      try {
        await fs.copyFile(this.unifiedDbPath, backupPath);
        console.log(`Backup created: ${backupPath}`);
      } catch (error) {
        console.log('No existing file to backup');
      }

      // Save integrated data
      await fs.writeFile(this.unifiedDbPath, JSON.stringify(integratedData, null, 2), 'utf8');
      console.log(`Integrated database saved to: ${this.unifiedDbPath}`);
      
      return true;
    } catch (error) {
      console.error('Error saving integrated database:', error.message);
      return false;
    }
  }

  async run() {
    try {
      const integratedData = await this.integrateNarratives();
      const success = await this.saveIntegratedDatabase(integratedData);
      
      if (success) {
        console.log('\n✅ Cultural narrative integration completed successfully!');
        return true;
      } else {
        console.log('\n❌ Integration failed during save operation');
        return false;
      }
    } catch (error) {
      console.error('Integration error:', error.message);
      return false;
    }
  }
}

// Run integration if called directly
if (require.main === module) {
  const integrator = new CulturalNarrativeIntegrator();
  integrator.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = CulturalNarrativeIntegrator;