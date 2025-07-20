#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class CastleGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.articlesDir = path.join(this.projectRoot, 'articles');
    this.castlesJsonPath = path.join(this.projectRoot, 'castles.json');
    this.stylesCssPath = path.join(this.projectRoot, 'style.css');
    this.indexHtmlPath = path.join(this.projectRoot, 'index.html');
    
    this.realWorldCastles = [
      {
        id: "neuschwanstein_castle",
        castleName: "Neuschwanstein Castle",
        country: "Germany",
        location: "Bavaria, near Fussen",
        architecturalStyle: "Romanesque Revival",
        yearBuilt: "1869-1886",
        shortDescription: "A fairytale castle commissioned by Ludwig II of Bavaria as a retreat and homage to Richard Wagner. This castle inspired Disney's Sleeping Beauty Castle and stands majestically in the Bavarian Alps with stunning Alpine views.",
        keyFeatures: ["Gothic Revival architecture", "Throne Hall with Byzantine influence", "Minstrels' Hall", "Artificial grotto", "Swan motifs throughout"]
      },
      {
        id: "edinburgh_castle",
        castleName: "Edinburgh Castle",
        country: "Scotland",
        location: "Edinburgh, Scotland",
        architecturalStyle: "Medieval fortress",
        yearBuilt: "12th century",
        shortDescription: "A historic fortress which dominates the skyline of Edinburgh from its position on the Castle Rock. It houses the Scottish Crown Jewels and the Stone of Destiny, used in the coronation of Scottish rulers.",
        keyFeatures: ["St Margaret's Chapel", "Great Hall", "Scottish Crown Jewels", "One O'Clock Gun", "Mons Meg cannon"]
      },
      {
        id: "prague_castle",
        castleName: "Prague Castle",
        country: "Czech Republic",
        location: "Prague, Bohemia",
        architecturalStyle: "Gothic, Renaissance, Baroque",
        yearBuilt: "9th century onwards",
        shortDescription: "According to the Guinness Book of Records, Prague Castle is the largest ancient castle complex in the world. It has been the seat of power for kings of Bohemia, Holy Roman emperors, and presidents of Czechoslovakia and the Czech Republic.",
        keyFeatures: ["St. Vitus Cathedral", "Golden Lane", "Royal Palace", "Basilica of St. George", "Powder Tower"]
      },
      {
        id: "versailles_palace",
        castleName: "Palace of Versailles",
        country: "France",
        location: "Versailles, Île-de-France",
        architecturalStyle: "French Baroque",
        yearBuilt: "1661-1715",
        shortDescription: "A royal château and symbol of absolute monarchy. Originally a hunting lodge, it was transformed by Louis XIV into one of the largest palaces in the world, famous for its Hall of Mirrors and extensive gardens.",
        keyFeatures: ["Hall of Mirrors", "Royal Apartments", "Chapel Royal", "Extensive formal gardens", "Grand Trianon"]
      },
      {
        id: "himeji_castle",
        castleName: "Himeji Castle",
        country: "Japan",
        location: "Himeji, Hyogo Prefecture",
        architecturalStyle: "Japanese castle architecture",
        yearBuilt: "1333, rebuilt 1601-1609",
        shortDescription: "Known as White Heron Castle due to its elegant, white appearance, this is one of Japan's most spectacular castles and a UNESCO World Heritage Site. It survived World War II and earthquakes, representing the pinnacle of Japanese castle design.",
        keyFeatures: ["Six-story main keep", "Spiral defensive design", "White plastered walls", "Advanced defensive systems", "Cherry blossom views"]
      },
      {
        id: "windsor_castle",
        castleName: "Windsor Castle",
        country: "England",
        location: "Windsor, Berkshire",
        architecturalStyle: "Georgian and Victorian Gothic Revival",
        yearBuilt: "11th century",
        shortDescription: "The oldest and largest inhabited castle in the world, Windsor Castle has been home to British royalty for over 900 years. It serves as an official residence of Queen Elizabeth II and hosts state visits and royal ceremonies.",
        keyFeatures: ["St George's Chapel", "State Apartments", "Queen Mary's Dolls' House", "Round Tower", "Long Walk"]
      },
      {
        id: "alhambra_palace",
        castleName: "Alhambra Palace",
        country: "Spain",
        location: "Granada, Andalusia",
        architecturalStyle: "Moorish architecture",
        yearBuilt: "13th-14th century",
        shortDescription: "A palace and fortress complex showcasing the most significant example of Moorish architecture in Spain. The name Alhambra means 'Red Castle' in Arabic, referring to the reddish color of its walls built from red clay.",
        keyFeatures: ["Court of Lions", "Nasrid Palaces", "Generalife gardens", "Intricate geometric patterns", "Arabic calligraphy decorations"]
      },
      {
        id: "bran_castle",
        castleName: "Bran Castle",
        country: "Romania",
        location: "Bran, Brasov County",
        architecturalStyle: "Gothic Revival",
        yearBuilt: "1377-1388",
        shortDescription: "Often referred to as 'Dracula's Castle', this medieval fortress sits dramatically on a rocky outcrop. While Bram Stoker likely never visited, the castle's Gothic appearance made it the perfect inspiration for Count Dracula's Transylvanian home.",
        keyFeatures: ["Gothic towers", "Secret passages", "Medieval courtyards", "Royal apartments", "Museum collections"]
      },
      {
        id: "mont_saint_michel",
        castleName: "Mont Saint-Michel",
        country: "France",
        location: "Normandy, Manche",
        architecturalStyle: "Medieval abbey fortress",
        yearBuilt: "8th century onwards",
        shortDescription: "A tidal island and mainland commune featuring a medieval abbey built on a rocky tidal island. Accessible by causeway only at low tide, this architectural marvel appears to rise from the sea like a mystical fortress.",
        keyFeatures: ["Gothic abbey church", "Cloister gardens", "Great Wheel", "Medieval ramparts", "Tidal causeway access"]
      },
      {
        id: "hohenzollern_castle",
        castleName: "Hohenzollern Castle",
        country: "Germany",
        location: "Baden-Württemberg",
        architecturalStyle: "Gothic Revival",
        yearBuilt: "1850-1867",
        shortDescription: "Perched 855 meters above sea level, this castle is the ancestral seat of the imperial House of Hohenzollern. The current structure is the third castle built on this site, designed in the Gothic Revival style with stunning views of the Swabian Alps.",
        keyFeatures: ["Crown of Prussia", "Military museum", "Ancestral portraits", "Gothic Revival architecture", "Panoramic Alpine views"]
      }
    ];
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
    try {
      const data = await fs.readFile(this.castlesJsonPath, 'utf8');
      const castles = JSON.parse(data);
      return Array.isArray(castles) ? castles : [];
    } catch (error) {
      console.log('Error loading castles.json, returning empty array');
      return [];
    }
  }

  getRandomUnusedCastle(existingCastles) {
    const existingIds = new Set(existingCastles.map(castle => castle.id));
    const existingNames = new Set(existingCastles.map(castle => castle.castleName.toLowerCase()));
    
    const availableCastles = this.realWorldCastles.filter(castle => 
      !existingIds.has(castle.id) && 
      !existingNames.has(castle.castleName.toLowerCase())
    );
    
    if (availableCastles.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCastles.length);
    return availableCastles[randomIndex];
  }

  async addNewCastle() {
    console.log('Phase 2: Adding new castle to collection...');
    
    const existingCastles = await this.loadExistingCastles();
    const newCastle = this.getRandomUnusedCastle(existingCastles);
    
    if (!newCastle) {
      console.log('No more unique castles available to add');
      return existingCastles;
    }
    
    console.log(`AI is adding '${newCastle.castleName}' to the collection...`);
    
    const updatedCastles = [...existingCastles, newCastle];
    await this.atomicWriteFile(this.castlesJsonPath, JSON.stringify(updatedCastles, null, 2));
    
    console.log(`Phase 2 completed: ${newCastle.castleName} added successfully`);
    return updatedCastles;
  }

  generateCastleHtml(castle) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${castle.castleName} | Castles Over The World</title>
    <link rel="stylesheet" href="../style.css">
    <meta name="description" content="Explore ${castle.castleName} in ${castle.country}. Learn about its ${castle.architecturalStyle} architecture and rich history.">
</head>
<body>
    <header>
        <nav>
            <a href="../index.html" class="nav-home">← Back to Castle Collection</a>
        </nav>
        <h1>${castle.castleName}</h1>
        <p class="castle-location">${castle.location}, ${castle.country}</p>
    </header>

    <main>
        <article class="castle-details">
            <section class="castle-overview">
                <h2>Overview</h2>
                <p>${castle.shortDescription}</p>
            </section>

            <section class="castle-info">
                <h2>Castle Information</h2>
                <dl class="info-grid">
                    <dt>Architectural Style:</dt>
                    <dd>${castle.architecturalStyle}</dd>
                    
                    <dt>Year Built:</dt>
                    <dd>${castle.yearBuilt}</dd>
                    
                    <dt>Location:</dt>
                    <dd>${castle.location}, ${castle.country}</dd>
                </dl>
            </section>

            <section class="key-features">
                <h2>Key Features</h2>
                <ul>
${castle.keyFeatures.map(feature => `                    <li>${feature}</li>`).join('\n')}
                </ul>
            </section>
        </article>
    </main>

    <footer>
        <nav class="footer-nav">
            <a href="../index.html">Return to Main Collection</a>
        </nav>
        <p>&copy; ${new Date().getFullYear()} Castles Over The World</p>
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