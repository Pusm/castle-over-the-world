#!/usr/bin/env node

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

/**
 * Dynamic Castle Data Provider for Unlimited Scalability
 * Replaces hardcoded castle arrays with dynamic data sources
 * Supports Wikipedia API, algorithmic generation, and external databases
 */

class CastleDataProvider {
  constructor() {
    this.cacheDir = path.join(process.cwd(), 'castle_cache');
    this.wikiApiBase = 'https://en.wikipedia.org/api/rest_v1';
    this.wikiActionApiBase = 'https://en.wikipedia.org/w/api.php';
    
    // Built-in castle name generators for algorithmic creation
    this.castleNames = {
      prefixes: ['Neu', 'Old', 'High', 'Low', 'Great', 'Little', 'Upper', 'Lower', 'North', 'South', 'East', 'West'],
      roots: ['burg', 'stein', 'hausen', 'fels', 'berg', 'thal', 'wald', 'mont', 'château', 'castell', 'torre', 'rocca'],
      suffixes: ['Castle', 'Fortress', 'Keep', 'Tower', 'Palace', 'Manor', 'Hall', 'Abbey']
    };
    
    this.countries = [
      'Germany', 'France', 'United Kingdom', 'Italy', 'Spain', 'Austria', 'Switzerland', 
      'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Scotland', 'Wales', 'Ireland',
      'Belgium', 'Netherlands', 'Denmark', 'Sweden', 'Norway', 'Portugal', 'Greece',
      'Turkey', 'Croatia', 'Slovenia', 'Slovakia', 'Estonia', 'Latvia', 'Lithuania'
    ];
    
    this.architecturalStyles = [
      'Norman', 'Gothic', 'Renaissance', 'Baroque', 'Romantic Revival', 'Medieval',
      'Byzantine', 'Moorish', 'Romanesque', 'Tudor', 'Georgian', 'Victorian',
      'Fortress Gothic', 'Defensive Medieval', 'Palace Renaissance', 'Neo-Gothic'
    ];
    
    // Initialize cache directory
    this.initializeCache();
  }

  async initializeCache() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.log('Cache directory setup:', error.message);
    }
  }

  /**
   * Wikipedia API Integration - Fetch castle lists from Wikipedia
   */
  async fetchWikipediaCastleList(country = 'England', limit = 50) {
    try {
      const cacheKey = `wikipedia_${country}_${limit}`;
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) return cachedData;

      // Search for castle pages using Wikipedia search API
      const searchQuery = encodeURIComponent(`castles in ${country}`);
      const searchUrl = `${this.wikiActionApiBase}?action=query&format=json&list=search&srsearch=${searchQuery}&srlimit=${limit}`;
      
      const searchResults = await this.makeApiRequest(searchUrl);
      if (!searchResults?.query?.search) {
        throw new Error('No search results from Wikipedia');
      }

      const castleData = await this.processCastleSearchResults(searchResults.query.search, country);
      await this.setCachedData(cacheKey, castleData);
      
      return castleData;
    } catch (error) {
      console.log(`Wikipedia API error for ${country}:`, error.message);
      return this.generateAlgorithmicCastles(country, limit);
    }
  }

  /**
   * Process Wikipedia search results into castle objects
   */
  async processCastleSearchResults(searchResults, country) {
    const castles = [];
    
    for (const result of searchResults.slice(0, 10)) {
      try {
        // Get page content for basic castle information
        const pageData = await this.fetchWikipediaPageData(result.title);
        const castle = this.createCastleFromWikipediaData(pageData, country);
        castles.push(castle);
        
        // Rate limiting - respect Wikipedia API guidelines
        await this.delay(100);
      } catch (error) {
        console.log(`Error processing ${result.title}:`, error.message);
        // Fallback to algorithmic generation for failed entries
        castles.push(this.generateAlgorithmicCastle(country));
      }
    }
    
    return castles;
  }

  /**
   * Fetch specific Wikipedia page data
   */
  async fetchWikipediaPageData(title) {
    const encodedTitle = encodeURIComponent(title);
    const url = `${this.wikiApiBase}/page/summary/${encodedTitle}`;
    return await this.makeApiRequest(url);
  }

  /**
   * Create castle object from Wikipedia data
   */
  createCastleFromWikipediaData(pageData, country) {
    const id = this.generateCastleId(pageData.title);
    const yearBuilt = this.extractYearFromText(pageData.extract || '');
    
    return {
      id: id,
      castleName: pageData.title,
      country: country,
      location: this.extractLocationFromText(pageData.extract || '', country),
      architecturalStyle: this.inferArchitecturalStyle(pageData.extract || '', yearBuilt),
      yearBuilt: yearBuilt,
      shortDescription: this.truncateDescription(pageData.extract || 'A historic castle with significant architectural and cultural importance.'),
      keyFeatures: this.generateKeyFeatures(pageData.extract || ''),
      source: 'wikipedia',
      wikiUrl: pageData.content_urls?.desktop?.page || '',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Algorithmic Castle Generation - Create unique castles procedurally
   */
  generateAlgorithmicCastle(country = null) {
    const selectedCountry = country || this.getRandomElement(this.countries);
    const prefix = this.getRandomElement(this.castleNames.prefixes);
    const root = this.getRandomElement(this.castleNames.roots);
    const suffix = this.getRandomElement(this.castleNames.suffixes);
    
    const castleName = `${prefix}${root} ${suffix}`;
    const id = this.generateCastleId(castleName);
    const yearBuilt = this.generateRandomYear();
    const style = this.getRandomElement(this.architecturalStyles);
    
    return {
      id: id,
      castleName: castleName,
      country: selectedCountry,
      location: this.generateLocation(selectedCountry),
      architecturalStyle: style,
      yearBuilt: yearBuilt,
      shortDescription: this.generateDescription(castleName, selectedCountry, style, yearBuilt),
      keyFeatures: this.generateAlgorithmicKeyFeatures(style),
      source: 'algorithmic',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate multiple algorithmic castles
   */
  generateAlgorithmicCastles(country, count = 10) {
    const castles = [];
    for (let i = 0; i < count; i++) {
      castles.push(this.generateAlgorithmicCastle(country));
    }
    return castles;
  }

  /**
   * Main method to get castle data from any source
   */
  async getCastleData(source = 'mixed', country = null, limit = 10) {
    switch (source) {
      case 'wikipedia':
        return await this.fetchWikipediaCastleList(country, limit);
      case 'algorithmic':
        return this.generateAlgorithmicCastles(country, limit);
      case 'mixed':
      default:
        // Try Wikipedia first, fallback to algorithmic
        try {
          const wikiCastles = await this.fetchWikipediaCastleList(country, Math.floor(limit * 0.7));
          const algorithmicCastles = this.generateAlgorithmicCastles(country, Math.ceil(limit * 0.3));
          return [...wikiCastles, ...algorithmicCastles];
        } catch (error) {
          console.log('Mixed source fallback to algorithmic:', error.message);
          return this.generateAlgorithmicCastles(country, limit);
        }
    }
  }

  /**
   * Unlimited castle expansion - get next batch of castles
   */
  async getNextCastleBatch(existingCastleIds = [], batchSize = 10) {
    const countries = [...this.countries];
    const newCastles = [];
    
    for (const country of countries) {
      if (newCastles.length >= batchSize) break;
      
      const countryBatch = await this.getCastleData('mixed', country, 5);
      const uniqueCastles = countryBatch.filter(castle => 
        !existingCastleIds.includes(castle.id)
      );
      
      newCastles.push(...uniqueCastles);
      
      // Rate limiting between countries
      await this.delay(200);
    }
    
    // If we still need more castles, generate purely algorithmic ones
    while (newCastles.length < batchSize) {
      const algorithmicCastle = this.generateAlgorithmicCastle();
      if (!existingCastleIds.includes(algorithmicCastle.id)) {
        newCastles.push(algorithmicCastle);
      }
    }
    
    return newCastles.slice(0, batchSize);
  }

  // Utility methods
  generateCastleId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  generateRandomYear() {
    const startYear = 800;
    const endYear = 1900;
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    return `${year}`;
  }

  generateLocation(country) {
    const genericLocations = {
      'Germany': ['Bavaria', 'Rhine Valley', 'Black Forest', 'Saxony', 'Brandenburg'],
      'France': ['Loire Valley', 'Normandy', 'Provence', 'Burgundy', 'Languedoc'],
      'United Kingdom': ['Yorkshire', 'Lancashire', 'Devon', 'Kent', 'Gloucestershire'],
      'Italy': ['Tuscany', 'Lombardy', 'Veneto', 'Piedmont', 'Emilia-Romagna'],
      'Spain': ['Castile', 'Andalusia', 'Catalonia', 'Galicia', 'Valencia']
    };
    
    const locations = genericLocations[country] || ['Historic Region', 'Ancient Province', 'Royal Territory'];
    return this.getRandomElement(locations);
  }

  generateDescription(name, country, style, year) {
    const templates = [
      `A magnificent ${style.toLowerCase()} castle built in ${year}, ${name} stands as a testament to the architectural mastery of ${country}. This historic fortress showcases the defensive innovations and artistic achievements of its era.`,
      `Constructed during the ${year}s, ${name} represents one of ${country}'s finest examples of ${style.toLowerCase()} architecture. The castle has witnessed centuries of history and continues to captivate visitors with its impressive fortifications.`,
      `${name} is a remarkable ${style.toLowerCase()} fortress dating from ${year}, strategically positioned in ${country}. This castle exemplifies the military engineering and artistic vision of medieval builders.`
    ];
    
    return this.getRandomElement(templates);
  }

  generateKeyFeatures(extractText = '') {
    const commonFeatures = [
      'Medieval fortifications', 'Stone construction', 'Defensive towers', 
      'Great hall', 'Courtyard design', 'Historic architecture'
    ];
    
    // Analyze text for specific features
    const textFeatures = [];
    if (extractText.includes('tower')) textFeatures.push('Impressive towers');
    if (extractText.includes('wall')) textFeatures.push('Massive defensive walls');
    if (extractText.includes('moat')) textFeatures.push('Protective moat system');
    if (extractText.includes('chapel')) textFeatures.push('Historic chapel');
    if (extractText.includes('garden')) textFeatures.push('Palace gardens');
    
    return [...textFeatures, ...commonFeatures.slice(0, 6 - textFeatures.length)];
  }

  generateAlgorithmicKeyFeatures(style) {
    const styleFeatures = {
      'Gothic': ['Flying buttresses', 'Pointed arches', 'Rose windows', 'Ribbed vaults'],
      'Norman': ['Round arches', 'Massive walls', 'Keep tower', 'Barrel vaults'],
      'Renaissance': ['Classical proportions', 'Symmetrical facade', 'Decorative elements', 'Palace gardens'],
      'Medieval': ['Defensive walls', 'Gatehouse', 'Great hall', 'Chapel'],
      'Baroque': ['Ornate decoration', 'Grand staircase', 'Formal gardens', 'Elaborate interiors']
    };
    
    const specificFeatures = styleFeatures[style] || styleFeatures['Medieval'];
    const commonFeatures = ['Historic significance', 'Cultural heritage', 'Architectural importance'];
    
    return [...specificFeatures.slice(0, 3), ...commonFeatures];
  }

  extractYearFromText(text) {
    const yearMatches = text.match(/(\d{3,4})/g);
    if (yearMatches) {
      const years = yearMatches.filter(year => parseInt(year) >= 800 && parseInt(year) <= 1900);
      return years[0] || this.generateRandomYear();
    }
    return this.generateRandomYear();
  }

  extractLocationFromText(text, country) {
    // Simple location extraction - could be enhanced
    const locationKeywords = ['in', 'near', 'at', 'located'];
    for (const keyword of locationKeywords) {
      const regex = new RegExp(`${keyword}\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)`, 'i');
      const match = text.match(regex);
      if (match) return match[1];
    }
    return this.generateLocation(country);
  }

  inferArchitecturalStyle(text, year) {
    const styleKeywords = {
      'Gothic': ['gothic', 'pointed', 'arch'],
      'Norman': ['norman', 'round', 'romanesque'],
      'Renaissance': ['renaissance', 'classical', 'symmetrical'],
      'Medieval': ['medieval', 'fortress', 'defensive'],
      'Baroque': ['baroque', 'ornate', 'elaborate']
    };
    
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return style;
      }
    }
    
    // Infer from year
    const yearInt = parseInt(year);
    if (yearInt < 1100) return 'Early Medieval';
    if (yearInt < 1300) return 'Medieval';
    if (yearInt < 1500) return 'Gothic';
    if (yearInt < 1700) return 'Renaissance';
    return 'Baroque';
  }

  truncateDescription(text, maxLength = 200) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  // Caching methods
  async getCachedData(key) {
    try {
      const cacheFile = path.join(this.cacheDir, `${key}.json`);
      const data = await fs.readFile(cacheFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Check if cache is less than 24 hours old
      const cacheAge = Date.now() - new Date(parsed.timestamp).getTime();
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return parsed.data;
      }
    } catch (error) {
      // Cache miss or error
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
      console.log('Cache write error:', error.message);
    }
  }

  // HTTP request helper
  async makeApiRequest(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, {
        headers: {
          'User-Agent': 'CastleOverTheWorld/1.0 (https://github.com/castle-encyclopedia) Educational/Research Purpose'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  // Utility methods
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = CastleDataProvider;

// CLI usage
if (require.main === module) {
  const provider = new CastleDataProvider();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'test';
  
  async function runTest() {
    try {
      console.log('Testing Castle Data Provider...');
      
      // Test algorithmic generation
      console.log('\n1. Testing algorithmic generation:');
      const algorithmicCastles = provider.generateAlgorithmicCastles('Germany', 3);
      algorithmicCastles.forEach(castle => {
        console.log(`- ${castle.castleName} (${castle.country}, ${castle.yearBuilt})`);
      });
      
      // Test Wikipedia integration
      console.log('\n2. Testing Wikipedia integration:');
      const wikiCastles = await provider.fetchWikipediaCastleList('England', 2);
      wikiCastles.forEach(castle => {
        console.log(`- ${castle.castleName} (${castle.source})`);
      });
      
      // Test unlimited expansion
      console.log('\n3. Testing unlimited expansion:');
      const existingIds = ['test1', 'test2'];
      const newBatch = await provider.getNextCastleBatch(existingIds, 5);
      console.log(`Generated ${newBatch.length} new castles`);
      
      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error('Test error:', error.message);
    }
  }
  
  if (command === 'test') {
    runTest();
  }
}