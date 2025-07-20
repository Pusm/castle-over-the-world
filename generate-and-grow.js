#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const EnhancedCastleDataProvider = require('./enhanced-castle-data-provider.js');

class CastleGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.articlesDir = path.join(this.projectRoot, 'articles');
    this.castlesJsonPath = path.join(this.projectRoot, 'castles.json');
    this.stylesCssPath = path.join(this.projectRoot, 'style.css');
    this.indexHtmlPath = path.join(this.projectRoot, 'index.html');
    
    // Initialize enhanced castle data provider for unlimited scalability with validation
    this.castleDataProvider = new EnhancedCastleDataProvider();
    
    // Hardcoded castle array removed - now using dynamic CastleDataProvider for unlimited scalability
    // The new system can access Wikipedia API, generate algorithmic castles, and scale to 10,000+ castles
    this.realWorldCastles = [];
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  }

  async atomicWriteFile(filePath, content) {
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    try {
      await fs.writeFile(tempPath, content, 'utf8');
      await fs.rename(tempPath, filePath);
    } catch (error) {
      await fs.unlink(tempPath).catch(() => {});
      throw error;
    }
  }

  async initializeProject() {
    console.log('Phase 1: Initializing project structure...');
    
    await this.ensureDirectoryExists(this.articlesDir);
    
    try {
      await fs.access(this.castlesJsonPath);
      console.log('castles.json already exists');
    } catch (error) {
      await this.atomicWriteFile(this.castlesJsonPath, JSON.stringify([], null, 2));
      console.log('Created castles.json with empty array');
    }
    
    try {
      await fs.access(this.stylesCssPath);
      console.log('style.css already exists');
    } catch (error) {
      const cssContent = `/* Castles Over The World - Elegant Historic Styling */

/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Georgia, 'Times New Roman', serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f6f3;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23f8f6f3"/><circle cx="20" cy="20" r="1" fill="%23e8e6e3"/></svg>');
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-family: Georgia, serif;
    color: #2c3e50;
    margin-bottom: 1rem;
}

h1 {
    font-size: 2.5rem;
    text-align: center;
    border-bottom: 3px solid #8b4513;
    padding-bottom: 0.5rem;
    margin-bottom: 2rem;
}

h2 {
    font-size: 1.8rem;
    color: #34495e;
    border-left: 4px solid #8b4513;
    padding-left: 1rem;
    margin-top: 2rem;
}

h3 {
    font-size: 1.4rem;
    color: #2c3e50;
}

/* Layout */
header, main, footer {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Header Styles */
.main-header {
    text-align: center;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.subtitle {
    font-size: 1.2rem;
    color: #666;
    font-style: italic;
    margin-bottom: 1rem;
}

.collection-count {
    color: #8b4513;
    font-weight: bold;
}

/* Castle Grid */
.castle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.castle-card {
    background: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.castle-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card-header h3 {
    margin-bottom: 0.5rem;
}

.card-location {
    color: #8b4513;
    font-weight: bold;
    font-size: 0.9rem;
}

.card-description {
    margin: 1rem 0;
    color: #555;
}

.card-meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.card-style, .card-year {
    background: #f0f0f0;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: #666;
}

.card-footer {
    border-top: 1px solid #eee;
    padding-top: 1rem;
}

.read-more {
    display: inline-block;
    background: #8b4513;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s ease;
}

.read-more:hover {
    background: #a0522d;
}

/* Individual Castle Pages */
.castle-details {
    background: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.castle-location {
    color: #8b4513;
    font-size: 1.1rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 2rem;
}

.castle-overview, .castle-info, .key-features {
    margin-bottom: 3rem;
    padding: 1.5rem;
    background: #fafafa;
    border-radius: 6px;
}

.info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin-top: 1rem;
}

.info-grid dt {
    font-weight: bold;
    color: #2c3e50;
}

.info-grid dd {
    color: #555;
}

/* Navigation */
.nav-home, .footer-nav a {
    color: #8b4513;
    text-decoration: none;
    font-weight: bold;
    display: inline-block;
    margin-bottom: 1rem;
}

.nav-home:hover, .footer-nav a:hover {
    color: #a0522d;
    text-decoration: underline;
}

/* Links */
a {
    color: #8b4513;
    text-decoration: none;
    font-weight: bold;
}

a:hover {
    color: #a0522d;
    text-decoration: underline;
}

/* Lists */
ul, ol {
    margin-left: 2rem;
    margin-bottom: 1rem;
}

li {
    margin-bottom: 0.5rem;
    color: #555;
}

/* Sections */
section {
    margin-bottom: 3rem;
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Footer */
.main-footer {
    text-align: center;
    border-top: 2px solid #8b4513;
    margin-top: 3rem;
    color: #666;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.last-updated {
    font-size: 0.9rem;
    color: #999;
    margin-top: 0.5rem;
}

/* About Project Section */
.about-project {
    background: #f0f8ff;
    border-left: 4px solid #2980b9;
}

/* Enhanced Castle Page Styles */
.castle-period {
    color: #8b4513;
    font-style: italic;
    text-align: center;
    margin-bottom: 1rem;
}

.detailed-description {
    background: #fafafa;
    border-left: 4px solid #8b4513;
}

/* Timeline Styles */
.timeline {
    position: relative;
    padding-left: 2rem;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #8b4513;
}

.timeline-entry {
    position: relative;
    margin-bottom: 2rem;
    padding-left: 2rem;
}

.timeline-entry::before {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 0.2rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: #8b4513;
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px #8b4513;
}

.timeline-year {
    font-weight: bold;
    color: #8b4513;
    font-size: 1.1rem;
}

.timeline-event {
    margin-top: 0.5rem;
    color: #555;
}

/* Event Cards */
.event-card {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-left: 4px solid #8b4513;
}

.event-card h3 {
    color: #8b4513;
    margin-bottom: 0.5rem;
}

/* Dynasty Info */
.dynasty-info {
    background: #f0f4f8;
    border-left: 4px solid #2980b9;
}

/* Architectural Analysis */
.architectural-analysis {
    background: #f8f4f0;
    border-left: 4px solid #d68910;
}

/* Construction Details */
.construction-details {
    background: #f4f0f8;
    border-left: 4px solid #8e44ad;
}

/* Cultural Significance */
.cultural-significance {
    background: #f0f8f4;
    border-left: 4px solid #27ae60;
}

.legend-card, .ghost-story-card, .battle-card {
    background: #fafafa;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.legend-card h4, .ghost-story-card h4, .battle-card h4 {
    color: #27ae60;
    margin-bottom: 0.5rem;
}

.historical-context {
    font-style: italic;
    color: #666;
    margin-top: 0.5rem;
}

.battle-details {
    margin-top: 0.5rem;
}

.battle-details dt {
    font-weight: bold;
    color: #2c3e50;
    margin-top: 0.5rem;
}

/* Visitor Information */
.visitor-information {
    background: #f8f4f0;
    border-left: 4px solid #e67e22;
}

.visitor-details h4, .heritage-status h3, .restoration-info h3 {
    color: #e67e22;
    margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    body {
        font-size: 14px;
    }
    
    h1 {
        font-size: 2rem;
    }
    
    header, main, footer {
        padding: 1rem;
    }
    
    .castle-grid {
        grid-template-columns: 1fr;
    }
    
    .card-meta {
        flex-direction: column;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 1.8rem;
    }
    
    header, main, footer {
        padding: 0.5rem;
    }
    
    .castle-card {
        padding: 1rem;
    }
}`;
      await this.atomicWriteFile(this.stylesCssPath, cssContent.trim());
      console.log('Created style.css with historic styling');
    }
    
    console.log('Phase 1 completed: Project structure initialized');
  }

  async loadExistingCastles() {
    // Try to load from unified database first, then fallback to regular castles.json
    const unifiedPath = path.join(this.projectRoot, 'castles_unified.json');
    try {
      await fs.access(unifiedPath);
      const data = await fs.readFile(unifiedPath, 'utf8');
      const castles = JSON.parse(data);
      console.log(`Loaded ${castles.length} castles from unified database`);
      return Array.isArray(castles) ? castles : [];
    } catch (error) {
      console.log('Unified database not found, loading from castles.json');
      try {
        const data = await fs.readFile(this.castlesJsonPath, 'utf8');
        const castles = JSON.parse(data);
        return Array.isArray(castles) ? castles : [];
      } catch (error2) {
        console.log('Error loading castles.json, returning empty array');
        return [];
      }
    }
  }

  async getRandomUnusedCastle(existingCastles) {
    const existingIds = existingCastles.map(castle => castle.id);
    const existingNames = existingCastles.map(castle => castle.castleName.toLowerCase());
    
    try {
      // Use enhanced provider with validation and multiple sources
      console.log('Fetching validated castle batch from multiple sources...');
      const newCastleBatch = await this.castleDataProvider.getNextCastleBatch(existingIds, 10, {
        sources: ['unesco', 'wikipedia', 'algorithmic'],
        qualityLevel: 'enhanced',
        ensureQuality: true
      });
      
      if (!newCastleBatch || newCastleBatch.length === 0) {
        console.log('No new validated castles available');
        return null;
      }
      
      // Additional duplicate filtering
      const availableCastles = newCastleBatch.filter(castle => 
        !existingNames.includes(castle.castleName.toLowerCase())
      );
      
      if (availableCastles.length === 0) {
        console.log('All fetched castles were duplicates');
        return null;
      }
      
      // Select highest quality castle
      const sortedByQuality = availableCastles.sort((a, b) => 
        (b.qualityScore || 0) - (a.qualityScore || 0)
      );
      
      const selectedCastle = sortedByQuality[0];
      console.log(`Selected: ${selectedCastle.castleName} (${selectedCastle.source}, Quality: ${selectedCastle.qualityScore || 'N/A'})`);
      return selectedCastle;
      
    } catch (error) {
      console.error('Error fetching validated castle:', error.message);
      return null;
    }
  }

  async addNewCastle() {
    console.log('Phase 2: Adding new castle to collection...');
    
    const existingCastles = await this.loadExistingCastles();
    const newCastle = await this.getRandomUnusedCastle(existingCastles);
    
    if (!newCastle) {
      console.log('No more unique castles available to add - unlimited expansion system may need time to generate new data');
      return existingCastles;
    }
    
    console.log(`AI is adding '${newCastle.castleName}' to the collection...`);
    
    const updatedCastles = [...existingCastles, newCastle];
    await this.atomicWriteFile(this.castlesJsonPath, JSON.stringify(updatedCastles, null, 2));
    
    console.log(`Phase 2 completed: ${newCastle.castleName} added successfully (source: ${newCastle.source})`);
    return updatedCastles;
  }

  generateCastleHtml(castle) {
    // Generate enhanced HTML with detailed information
    const detailedDescSection = castle.detailedDescription ? `
            <section class="detailed-description">
                <h2>Detailed History & Significance</h2>
                <p>${castle.detailedDescription}</p>
            </section>` : '';

    const timelineSection = castle.historicalTimeline ? `
            <section class="historical-timeline">
                <h2>Historical Timeline</h2>
                <div class="timeline">
                    ${castle.historicalTimeline.map(entry => `
                    <div class="timeline-entry">
                        <div class="timeline-year">${entry.year}</div>
                        <div class="timeline-event">${entry.event}</div>
                    </div>`).join('')}
                </div>
            </section>` : '';

    const dynastySection = castle.dynastyInfo ? `
            <section class="dynasty-info">
                <h2>Dynasty & Rulers</h2>
                <dl class="info-grid">
                    <dt>Dynasty:</dt>
                    <dd>${castle.dynastyInfo.dynasty}</dd>
                    <dt>Primary Ruler:</dt>
                    <dd>${castle.dynastyInfo.ruler || 'Multiple rulers'}</dd>
                    <dt>Dynasty Origin:</dt>
                    <dd>${castle.dynastyInfo.dynastyOrigin}</dd>
                    <dt>Significance:</dt>
                    <dd>${castle.dynastyInfo.significance || 'Major royal residence and fortress'}</dd>
                </dl>
                ${castle.dynastyInfo.rulers && Array.isArray(castle.dynastyInfo.rulers) ? `
                <h3>Notable Rulers</h3>
                <ul>
                    ${castle.dynastyInfo.rulers.map(ruler => `<li>${ruler}</li>`).join('')}
                </ul>` : ''}
            </section>` : '';

    const eventsSection = castle.notableEvents ? `
            <section class="notable-events">
                <h2>Notable Historical Events</h2>
                ${castle.notableEvents.map(event => `
                <div class="event-card">
                    <h3>${event.event} (${event.date})</h3>
                    <p>${event.significance}</p>
                </div>`).join('')}
            </section>` : '';

    const culturalSection = castle.culturalSignificance || castle.legends || castle.historicalEvents || castle.ghostStories || castle.historicalBattles ? `
            <section class="cultural-significance">
                <h2>Cultural Significance & Folklore</h2>
                ${castle.culturalSignificance ? `
                <div class="cultural-overview">
                    <h3>Cultural Significance</h3>
                    <p>${castle.culturalSignificance}</p>
                </div>` : ''}
                ${castle.legends && Array.isArray(castle.legends) ? `
                <div class="legends-section">
                    <h3>Legends & Folklore</h3>
                    ${castle.legends.map(legend => 
                        typeof legend === 'string' ? `<p class="legend-item">${legend}</p>` :
                        `<div class="legend-card">
                            <h4>${legend.title}</h4>
                            <p>${legend.narrative}</p>
                        </div>`
                    ).join('')}
                </div>` : ''}
                ${castle.historicalEvents && Array.isArray(castle.historicalEvents) ? `
                <div class="historical-events">
                    <h3>Key Historical Events</h3>
                    <ul class="historical-timeline">
                        ${castle.historicalEvents.map(event => `<li>${event}</li>`).join('')}
                    </ul>
                </div>` : ''}
                ${castle.ghostStories && Array.isArray(castle.ghostStories) ? `
                <div class="ghost-stories">
                    <h3>Ghost Stories & Hauntings</h3>
                    ${castle.ghostStories.map(story => `
                    <div class="ghost-story-card">
                        <h4>${story.spirit} - ${story.location}</h4>
                        <p>${story.story}</p>
                        ${story.historicalContext ? `<p class="historical-context"><strong>Historical Context:</strong> ${story.historicalContext}</p>` : ''}
                    </div>`).join('')}
                </div>` : ''}
                ${castle.historicalBattles && Array.isArray(castle.historicalBattles) ? `
                <div class="historical-battles">
                    <h3>Famous Battles & Sieges</h3>
                    ${castle.historicalBattles.map(battle => `
                    <div class="battle-card">
                        <h4>${battle.name}</h4>
                        <dl class="battle-details">
                            <dt>Participants:</dt><dd>${battle.participants}</dd>
                            <dt>Outcome:</dt><dd>${battle.outcome}</dd>
                            <dt>Significance:</dt><dd>${battle.significance}</dd>
                        </dl>
                    </div>`).join('')}
                </div>` : ''}
            </section>` : '';

    const visitorSection = castle.visitorInformation || castle.heritage || castle.restoration ? `
            <section class="visitor-information">
                <h2>Visitor Information & Heritage</h2>
                ${castle.visitorInformation ? `
                <div class="visitor-details">
                    <h3>Visiting Information</h3>
                    ${castle.visitorInformation.openingHours ? `
                    <h4>Opening Hours</h4>
                    <ul>
                        ${Object.entries(castle.visitorInformation.openingHours).map(([period, hours]) => 
                            `<li><strong>${period.charAt(0).toUpperCase() + period.slice(1)}:</strong> ${hours}</li>`
                        ).join('')}
                    </ul>` : ''}
                    ${castle.visitorInformation.ticketPrices ? `
                    <h4>Ticket Prices</h4>
                    <ul>
                        ${Object.entries(castle.visitorInformation.ticketPrices).map(([type, price]) => 
                            `<li><strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${price}</li>`
                        ).join('')}
                    </ul>` : ''}
                    ${castle.visitorInformation.tours ? `
                    <h4>Tours & Accessibility</h4>
                    <p><strong>Duration:</strong> ${castle.visitorInformation.tours.guidedTourDuration || 'Varies'}</p>
                    ${castle.visitorInformation.tours.languages ? `<p><strong>Languages:</strong> ${castle.visitorInformation.tours.languages.join(', ')}</p>` : ''}
                    ${castle.visitorInformation.tours.booking ? `<p><strong>Booking:</strong> ${castle.visitorInformation.tours.booking}</p>` : ''}
                    ` : ''}
                </div>` : ''}
                ${castle.heritage ? `
                <div class="heritage-status">
                    <h3>Heritage & Conservation</h3>
                    ${castle.heritage.unescoStatus ? `<p><strong>UNESCO Status:</strong> ${castle.heritage.unescoStatus}</p>` : ''}
                    ${castle.heritage.conservationChallenges ? `<p><strong>Conservation Challenges:</strong> ${castle.heritage.conservationChallenges}</p>` : ''}
                </div>` : ''}
                ${castle.restoration ? `
                <div class="restoration-info">
                    <h3>Restoration Projects</h3>
                    ${castle.restoration.currentProjects ? `<p><strong>Current Projects:</strong> ${castle.restoration.currentProjects}</p>` : ''}
                    ${castle.restoration.completed ? `<p><strong>Recently Completed:</strong> ${castle.restoration.completed}</p>` : ''}
                    ${castle.restoration.ongoing ? `<p><strong>Ongoing Work:</strong> ${castle.restoration.ongoing}</p>` : ''}
                </div>` : ''}
            </section>` : '';

    const architectureSection = castle.architecturalAnalysis ? `
            <section class="architectural-analysis">
                <h2>Architectural Analysis</h2>
                <dl class="info-grid">
                    <dt>Defensive Features:</dt>
                    <dd>${castle.architecturalAnalysis.defensiveFeatures}</dd>
                    <dt>Materials:</dt>
                    <dd>${Array.isArray(castle.architecturalAnalysis.materials) ? 
                        castle.architecturalAnalysis.materials.join(', ') : 
                        castle.architecturalAnalysis.materials}</dd>
                    <dt>Dimensions:</dt>
                    <dd>${castle.architecturalAnalysis.dimensions}</dd>
                    <dt>Rooms/Spaces:</dt>
                    <dd>${castle.architecturalAnalysis.rooms}</dd>
                </dl>
                ${castle.architecturalAnalysis.structuralInnovations ? `
                <h3>Structural Innovations</h3>
                <ul>
                    ${castle.architecturalAnalysis.structuralInnovations.map(innovation => `<li>${innovation}</li>`).join('')}
                </ul>` : ''}
            </section>` : '';

    const constructionSection = castle.constructionDetails ? `
            <section class="construction-details">
                <h2>Construction Details</h2>
                <dl class="info-grid">
                    <dt>Chief Architect:</dt>
                    <dd>${castle.constructionDetails.chiefArchitect || castle.constructionDetails.chiefArchitects}</dd>
                    ${castle.constructionDetails.designer ? `
                    <dt>Designer:</dt>
                    <dd>${castle.constructionDetails.designer}</dd>` : ''}
                    ${castle.constructionDetails.cost ? `
                    <dt>Construction Cost:</dt>
                    <dd>${castle.constructionDetails.cost}</dd>` : ''}
                    ${castle.constructionDetails.workers ? `
                    <dt>Workforce:</dt>
                    <dd>${castle.constructionDetails.workers}</dd>` : ''}
                </dl>
                ${castle.constructionDetails.challenges ? `
                <h3>Construction Challenges</h3>
                <ul>
                    ${castle.constructionDetails.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                </ul>` : ''}
                ${castle.constructionDetails.evolutionPeriods ? `
                <h3>Construction Periods</h3>
                <ul>
                    ${castle.constructionDetails.evolutionPeriods.map(period => `<li>${period}</li>`).join('')}
                </ul>` : ''}
            </section>` : '';

    const engineeringSection = castle.engineeringDetails ? `
            <section class="engineering-details">
                <h2>Engineering & Technical Analysis</h2>
                ${castle.engineeringDetails.foundationEngineering ? `
                <div class="engineering-subsection">
                    <h3>Foundation Engineering</h3>
                    <dl class="info-grid">
                        <dt>Geological Base:</dt>
                        <dd>${castle.engineeringDetails.foundationEngineering.geologicalBase}</dd>
                        <dt>Formation Process:</dt>
                        <dd>${castle.engineeringDetails.foundationEngineering.formationProcess}</dd>
                    </dl>
                    <h4>Engineering Advantages</h4>
                    <ul>
                        ${castle.engineeringDetails.foundationEngineering.engineeringAdvantages ? castle.engineeringDetails.foundationEngineering.engineeringAdvantages.map(advantage => `<li>${advantage}</li>`).join('') : '<li>No specific advantages documented</li>'}
                    </ul>
                </div>` : ''}
                ${castle.engineeringDetails.constructionTechniques ? `
                <div class="engineering-subsection">
                    <h3>Construction Techniques</h3>
                    ${Object.entries(castle.engineeringDetails.constructionTechniques).map(([technique, data]) => {
                        if (Array.isArray(data)) {
                            return `
                    <h4>${technique.charAt(0).toUpperCase() + technique.slice(1).replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <ul>
                        ${data.map(item => `<li>${item}</li>`).join('')}
                    </ul>`;
                        } else if (typeof data === 'string') {
                            return `
                    <dl class="info-grid">
                        <dt>${technique.charAt(0).toUpperCase() + technique.slice(1).replace(/([A-Z])/g, ' $1').trim()}:</dt>
                        <dd>${data}</dd>
                    </dl>`;
                        }
                        return '';
                    }).join('')}
                </div>` : ''}
                ${castle.engineeringDetails.siegeAdaptations ? `
                <div class="engineering-subsection">
                    <h3>Siege Warfare Adaptations</h3>
                    <ul>
                        ${castle.engineeringDetails.siegeAdaptations.map(adaptation => `<li>${adaptation}</li>`).join('')}
                    </ul>
                </div>` : ''}
                ${castle.engineeringDetails.materialProperties ? `
                <div class="engineering-subsection">
                    <h3>Material Properties & Engineering</h3>
                    <dl class="info-grid">
                        ${Object.entries(castle.engineeringDetails.materialProperties).map(([material, description]) => `
                        <dt>${material.charAt(0).toUpperCase() + material.slice(1)}:</dt>
                        <dd>${description}</dd>`).join('')}
                    </dl>
                </div>` : ''}
            </section>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${castle.castleName} | Comprehensive Castle Encyclopedia</title>
    <link rel="stylesheet" href="../style.css">
    <meta name="description" content="Comprehensive analysis of ${castle.castleName} in ${castle.country}. Detailed history, architecture, timelines, and dynasties exceeding Wikipedia standards.">
</head>
<body>
    <header>
        <nav>
            <a href="../index.html" class="nav-home">← Back to Castle Collection</a>
        </nav>
        <h1>${castle.castleName}</h1>
        <p class="castle-location">${castle.location}, ${castle.country}</p>
        <p class="castle-period">${castle.yearBuilt}</p>
    </header>

    <main>
        <article class="castle-details">
            <section class="castle-overview">
                <h2>Overview</h2>
                <p>${castle.shortDescription}</p>
            </section>

            ${detailedDescSection}

            <section class="basic-info">
                <h2>Basic Information</h2>
                <dl class="info-grid">
                    <dt>Architectural Style:</dt>
                    <dd>${castle.architecturalStyle}</dd>
                    
                    <dt>Construction Period:</dt>
                    <dd>${castle.yearBuilt}</dd>
                    
                    <dt>Location:</dt>
                    <dd>${castle.location}, ${castle.country}</dd>
                </dl>
            </section>

            ${timelineSection}

            ${dynastySection}

            ${eventsSection}

            ${culturalSection}

            ${architectureSection}

            ${constructionSection}

            ${engineeringSection}

            ${visitorSection}

            <section class="key-features">
                <h2>Key Features & Highlights</h2>
                <ul>
                    ${castle.keyFeatures.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </section>
        </article>
    </main>

    <footer>
        <nav class="footer-nav">
            <a href="../index.html">Return to Main Collection</a>
        </nav>
        <p>&copy; ${new Date().getFullYear()} Castles Over The World - Comprehensive Encyclopedia</p>
    </footer>
</body>
</html>`;
  }

  generateIndexHtml(castles) {
    const castleCount = castles.length;
    const currentYear = new Date().getFullYear();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Castles Over The World - Historic Castle Encyclopedia</title>
    <link rel="stylesheet" href="style.css">
    <meta name="description" content="Explore ${castleCount} magnificent castles from around the world. Discover their history, architecture, and fascinating stories.">
</head>
<body>
    <header class="main-header">
        <h1>Castles Over The World</h1>
        <p class="subtitle">A Self-Expanding Encyclopedia of Historic Fortresses</p>
        <p class="collection-count">Currently featuring <strong>${castleCount}</strong> magnificent castles</p>
    </header>

    <main>
        <section class="castle-collection">
            <h2>Explore Our Castle Collection</h2>
            
            ${castles.length === 0 ? 
                '<p class="no-castles">No castles in the collection yet. Run the script to add your first castle!</p>' :
                `<nav class="castle-grid" role="navigation" aria-label="Castle collection navigation">
${castles.map(castle => `                <article class="castle-card">
                    <header class="card-header">
                        <h3><a href="articles/${castle.id}.html">${castle.castleName}</a></h3>
                        <p class="card-location">${castle.country}</p>
                    </header>
                    <div class="card-content">
                        <p class="card-description">${castle.shortDescription.substring(0, 120)}${castle.shortDescription.length > 120 ? '...' : ''}</p>
                        <div class="card-meta">
                            <span class="card-style">${castle.architecturalStyle}</span>
                            <span class="card-year">${castle.yearBuilt}</span>
                        </div>
                    </div>
                    <footer class="card-footer">
                        <a href="articles/${castle.id}.html" class="read-more">Explore Castle →</a>
                    </footer>
                </article>`).join('\n')}
            </nav>`
            }
        </section>

        <section class="about-project">
            <h2>About This Project</h2>
            <p>This encyclopedia grows automatically with each execution, adding new castles from around the world. Each castle entry includes detailed information about its history, architecture, and unique features.</p>
        </section>
    </main>

    <footer class="main-footer">
        <p>&copy; ${currentYear} Castles Over The World | Self-Expanding Encyclopedia Project</p>
        <p class="last-updated">Last updated: ${new Date().toLocaleDateString()}</p>
    </footer>
</body>
</html>`;
  }

  async regenerateWebsite(castles) {
    console.log('Phase 3: Regenerating website...');
    
    try {
      const files = await fs.readdir(this.articlesDir);
      const htmlFiles = files.filter(file => file.endsWith('.html'));
      for (const file of htmlFiles) {
        await fs.unlink(path.join(this.articlesDir, file));
      }
      console.log(`Cleaned up ${htmlFiles.length} old HTML files`);
    } catch (error) {
      console.log('No existing HTML files to clean up');
    }
    
    for (const castle of castles) {
      const htmlContent = this.generateCastleHtml(castle);
      const htmlPath = path.join(this.articlesDir, `${castle.id}.html`);
      await this.atomicWriteFile(htmlPath, htmlContent);
    }
    console.log(`Generated ${castles.length} castle pages`);
    
    const indexContent = this.generateIndexHtml(castles);
    await this.atomicWriteFile(this.indexHtmlPath, indexContent);
    console.log('Generated index.html');
    
    console.log('Phase 3 completed: Website regenerated successfully');
  }

  async run() {
    try {
      await this.initializeProject();
      const updatedCastles = await this.addNewCastle();
      await this.regenerateWebsite(updatedCastles);
      
      if (updatedCastles.length > 0) {
        const latestCastle = updatedCastles[updatedCastles.length - 1];
        console.log(`\nSuccess! '${latestCastle.castleName}' was added. The site now features ${updatedCastles.length} castles.`);
      } else {
        console.log('\nProject initialized but no new castles were added.');
      }
      
    } catch (error) {
      console.error('Error during execution:', error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const generator = new CastleGenerator();
  generator.run();
}

module.exports = CastleGenerator;