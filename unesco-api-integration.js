#!/usr/bin/env node

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

/**
 * UNESCO World Heritage API Integration
 * Provides access to UNESCO World Heritage castle and fortress data
 * Complements Wikipedia API for comprehensive external data sources
 */

class UnescoApiIntegration {
  constructor() {
    this.apiBase = 'https://unesco-api.herokuapp.com';  // Open UNESCO API endpoint
    this.cacheDir = path.join(process.cwd(), 'castle_cache', 'unesco');
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    // UNESCO site types relevant to castles and fortresses
    this.relevantCategories = [
      'Cultural',
      'Mixed' // Some sites are both cultural and natural
    ];
    
    // Keywords to identify castle/fortress sites
    this.castleKeywords = [
      'castle', 'fortress', 'fort', 'citadel', 'palace', 'stronghold',
      'fortification', 'keep', 'tower', 'walls', 'defens', 'militar',
      'royal', 'ducal', 'baronial', 'manor', 'château', 'burg',
      'kasteel', 'castello', 'alcázar', 'kremlin', 'qal\'a', 'hisn'
    ];
    
    this.initializeCache();
  }

  async initializeCache() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.log('UNESCO cache setup:', error.message);
    }
  }

  /**
   * Fetch all UNESCO World Heritage sites
   */
  async fetchAllUnescoSites() {
    try {
      const cacheKey = 'all_unesco_sites';
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) return cachedData;

      console.log('Fetching UNESCO World Heritage sites...');
      const sites = await this.makeApiRequest(`${this.apiBase}/api/v1/sites`);
      
      if (!sites || !Array.isArray(sites)) {
        throw new Error('Invalid UNESCO API response');
      }

      await this.setCachedData(cacheKey, sites);
      console.log(`Retrieved ${sites.length} UNESCO World Heritage sites`);
      return sites;
    } catch (error) {
      console.log('UNESCO API error:', error.message);
      return [];
    }
  }

  /**
   * Filter UNESCO sites to identify castles and fortresses
   */
  async getCastleAndFortressSites() {
    const allSites = await this.fetchAllUnescoSites();
    const castleSites = [];

    for (const site of allSites) {
      if (this.isCastleOrFortress(site)) {
        const enrichedSite = await this.enrichUnescoSite(site);
        castleSites.push(enrichedSite);
      }
    }

    console.log(`Identified ${castleSites.length} castle/fortress UNESCO sites`);
    return castleSites;
  }

  /**
   * Check if UNESCO site is a castle or fortress
   */
  isCastleOrFortress(site) {
    if (!site || !this.relevantCategories.includes(site.category)) {
      return false;
    }

    const searchText = `${site.site || ''} ${site.short_description || ''} ${site.justification || ''}`.toLowerCase();
    
    return this.castleKeywords.some(keyword => searchText.includes(keyword));
  }

  /**
   * Enrich UNESCO site data for castle database
   */
  async enrichUnescoSite(site) {
    const countryName = this.normalizeCountryName(site.states_parties);
    const yearBuilt = this.extractConstructionYear(site.short_description || site.justification || '');
    
    return {
      id: this.generateCastleId(site.site),
      castleName: site.site,
      country: countryName,
      location: this.extractLocation(site),
      architecturalStyle: this.inferArchitecturalStyle(site),
      yearBuilt: yearBuilt,
      shortDescription: this.createDescription(site),
      keyFeatures: this.extractKeyFeatures(site),
      source: 'unesco',
      unescoId: site.id_no,
      unescoUrl: `https://whc.unesco.org/en/list/${site.id_no}/`,
      inscriptionYear: site.date_inscribed,
      criteria: site.criteria_txt,
      region: site.region,
      lastUpdated: new Date().toISOString(),
      heritageStatus: {
        unescoStatus: 'World Heritage Site',
        inscriptionYear: site.date_inscribed,
        criteria: site.criteria_txt,
        region: site.region,
        transboundary: site.transboundary || false
      }
    };
  }

  /**
   * Generate castle database compatible ID
   */
  generateCastleId(siteName) {
    return siteName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  /**
   * Normalize country names from UNESCO data
   */
  normalizeCountryName(statesParties) {
    if (!statesParties) return 'Unknown';
    
    // Handle multiple countries (transboundary sites)
    if (statesParties.includes(',')) {
      return statesParties.split(',')[0].trim();
    }
    
    // Common country name mappings
    const countryMappings = {
      'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
      'Russian Federation': 'Russia',
      'Iran (Islamic Republic of)': 'Iran',
      'Syrian Arab Republic': 'Syria',
      'Republic of Korea': 'South Korea',
      'Democratic People\'s Republic of Korea': 'North Korea',
      'United States of America': 'United States',
      'Czech Republic': 'Czech Republic',
      'Slovakia': 'Slovakia'
    };
    
    return countryMappings[statesParties] || statesParties;
  }

  /**
   * Extract construction year from UNESCO descriptions
   */
  extractConstructionYear(description) {
    // Look for construction years in various formats
    const patterns = [
      /built\s+in\s+(\d{3,4})/i,
      /constructed\s+in\s+(\d{3,4})/i,
      /dating\s+from\s+(\d{3,4})/i,
      /(\d{3,4})\s*AD/i,
      /(\d{3,4})\s*CE/i,
      /(\d{1,2})th\s+century/i,
      /(\d{1,2})nd\s+century/i,
      /(\d{1,2})st\s+century/i,
      /(\d{1,2})rd\s+century/i
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        if (pattern.toString().includes('century')) {
          // Convert century to approximate year
          const century = parseInt(match[1]);
          return `${(century - 1) * 100 + 1}-${century * 100}`;
        }
        return match[1];
      }
    }
    
    // Extract any 4-digit year as fallback
    const yearMatch = description.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year >= 500 && year <= 1900) {
        return yearMatch[1];
      }
    }
    
    return 'Medieval period';
  }

  /**
   * Extract location information
   */
  extractLocation(site) {
    // Use geographical coordinates if available for region identification
    if (site.longitude && site.latitude) {
      return this.getRegionFromCoordinates(site.longitude, site.latitude);
    }
    
    // Extract from site name or description
    const locationPattern = /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
    const description = site.short_description || site.justification || '';
    const match = description.match(locationPattern);
    
    if (match) {
      return match[1];
    }
    
    return site.region || 'Historic region';
  }

  /**
   * Infer architectural style from UNESCO data
   */
  inferArchitecturalStyle(site) {
    const description = `${site.short_description || ''} ${site.justification || ''}`.toLowerCase();
    
    const styleKeywords = {
      'Islamic': ['islamic', 'muslim', 'moorish', 'ottoman', 'mamluk', 'umayyad', 'abbasid'],
      'Gothic': ['gothic', 'pointed arch', 'flying buttress', 'cathedral'],
      'Renaissance': ['renaissance', 'classical', 'humanist', 'palazzo'],
      'Byzantine': ['byzantine', 'orthodox', 'constantinople', 'basilica'],
      'Romanesque': ['romanesque', 'round arch', 'barrel vault', 'norman'],
      'Baroque': ['baroque', 'ornate', 'counter-reformation', 'dramatic'],
      'Medieval': ['medieval', 'feudal', 'crusader', 'fortified'],
      'Ancient': ['ancient', 'antique', 'classical antiquity', 'roman', 'greek']
    };
    
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        return style;
      }
    }
    
    // Infer from inscription year (rough approximation)
    const year = parseInt(site.date_inscribed);
    if (description.includes('castle') || description.includes('fortress')) {
      if (year < 1200) return 'Early Medieval';
      if (year < 1400) return 'Medieval';
      if (year < 1600) return 'Renaissance';
      return 'Post-Medieval';
    }
    
    return 'Historic';
  }

  /**
   * Create comprehensive description
   */
  createDescription(site) {
    let description = site.short_description || '';
    
    if (!description && site.justification) {
      // Create description from justification
      description = site.justification.substring(0, 300) + '...';
    }
    
    if (!description) {
      description = `${site.site} is a UNESCO World Heritage Site inscribed in ${site.date_inscribed}, representing outstanding universal value in human heritage.`;
    }
    
    // Ensure description mentions UNESCO status
    if (!description.toLowerCase().includes('unesco')) {
      description += ` This UNESCO World Heritage Site was inscribed in ${site.date_inscribed} for its outstanding universal value.`;
    }
    
    return description;
  }

  /**
   * Extract key features from UNESCO data
   */
  extractKeyFeatures(site) {
    const features = [];
    const description = `${site.short_description || ''} ${site.justification || ''}`.toLowerCase();
    
    // UNESCO-specific features
    features.push('UNESCO World Heritage Site');
    features.push(`Inscribed ${site.date_inscribed}`);
    
    // Architectural features based on keywords
    const featureKeywords = {
      'Defensive walls': ['wall', 'fortification', 'rampart', 'bulwark'],
      'Historic towers': ['tower', 'keep', 'donjon', 'turret'],
      'Royal apartments': ['royal', 'palace', 'residence', 'court'],
      'Religious architecture': ['chapel', 'church', 'cathedral', 'monastery'],
      'Military architecture': ['military', 'defense', 'garrison', 'barracks'],
      'Archaeological significance': ['archaeological', 'excavation', 'ruins', 'ancient'],
      'Cultural landscape': ['landscape', 'cultural', 'environment', 'setting'],
      'Artistic heritage': ['art', 'decoration', 'sculpture', 'painting']
    };
    
    for (const [feature, keywords] of Object.entries(featureKeywords)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        features.push(feature);
      }
    }
    
    // Add region-specific feature
    if (site.region) {
      features.push(`${site.region} heritage`);
    }
    
    return features.slice(0, 6); // Limit to 6 features
  }

  /**
   * Get approximate region from coordinates
   */
  getRegionFromCoordinates(longitude, latitude) {
    // Simple regional classification based on coordinates
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    if (lat > 60) return 'Northern Europe';
    if (lat > 45 && lon > -10 && lon < 30) return 'Central Europe';
    if (lat > 35 && lat <= 45 && lon > -10 && lon < 30) return 'Southern Europe';
    if (lat > 30 && lat <= 45 && lon >= 30) return 'Eastern Europe';
    if (lat > 20 && lat <= 35) return 'Mediterranean';
    if (lat > 0 && lat <= 30 && lon > 30 && lon < 80) return 'Middle East';
    if (lat > 0 && lat <= 30 && lon >= 80) return 'South Asia';
    if (lat > 20 && lon >= 100) return 'East Asia';
    if (lat <= 0 && lon > 10 && lon < 50) return 'East Africa';
    if (lat > 0 && lon >= -120 && lon <= -60) return 'North America';
    if (lat <= 0 && lon >= -80 && lon <= -40) return 'South America';
    
    return 'Global heritage region';
  }

  // Caching methods
  async getCachedData(key) {
    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      const data = await fs.readFile(cacheFile, 'utf8');
      const parsed = JSON.parse(data);
      
      const cacheAge = Date.now() - new Date(parsed.timestamp).getTime();
      if (cacheAge < this.cacheExpiry) {
        return parsed.data;
      }
    } catch (error) {
      // Cache miss
    }
    return null;
  }

  async setCachedData(key, data) {
    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      const cacheData = {
        timestamp: new Date().toISOString(),
        data: data
      };
      await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.log('UNESCO cache write error:', error.message);
    }
  }

  // HTTP request helper
  async makeApiRequest(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, {
        headers: {
          'User-Agent': 'CastleOverTheWorld/1.0 Educational Research',
          'Accept': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Invalid JSON response from UNESCO API'));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('UNESCO API request timeout'));
      });
    });
  }

  /**
   * Get castle data for integration with main system
   */
  async getCastleData(limit = 50) {
    try {
      const castleSites = await this.getCastleAndFortressSites();
      return castleSites.slice(0, limit);
    } catch (error) {
      console.log('Error getting UNESCO castle data:', error.message);
      return [];
    }
  }
}

module.exports = UnescoApiIntegration;

// CLI testing
if (require.main === module) {
  const unesco = new UnescoApiIntegration();
  
  async function test() {
    try {
      console.log('Testing UNESCO API Integration...');
      
      const castles = await unesco.getCastleData(10);
      console.log(`\nFound ${castles.length} UNESCO castle/fortress sites:`);
      
      castles.forEach((castle, index) => {
        console.log(`${index + 1}. ${castle.castleName} (${castle.country})`);
        console.log(`   Style: ${castle.architecturalStyle}, Year: ${castle.yearBuilt}`);
        console.log(`   UNESCO ID: ${castle.unescoId}, Inscribed: ${castle.inscriptionYear}`);
        console.log(`   Features: ${castle.keyFeatures.slice(0, 3).join(', ')}`);
        console.log('');
      });
      
      console.log('✅ UNESCO API integration test completed!');
    } catch (error) {
      console.error('Test error:', error.message);
    }
  }
  
  test();
}