// Test fixtures and mock data for castle testing

const mockCastles = {
  // Valid castle data for testing
  validCastles: [
    {
      id: 'neuschwanstein_castle',
      castleName: 'Neuschwanstein Castle',
      country: 'Germany',
      location: 'Bavaria',
      architecturalStyle: 'Romanesque Revival',
      yearBuilt: '19th century',
      shortDescription: 'A fairytale castle commissioned by Ludwig II of Bavaria. This romantic castle inspired Disney\'s Sleeping Beauty Castle.',
      keyFeatures: ['Gothic Revival architecture', 'Mountain setting', 'Disney inspiration', 'Throne room', 'Singers\' Hall']
    },
    {
      id: 'edinburgh_castle',
      castleName: 'Edinburgh Castle',
      country: 'Scotland',
      location: 'Edinburgh',
      architecturalStyle: 'Medieval',
      yearBuilt: '12th century',
      shortDescription: 'A historic fortress that dominates the skyline of Edinburgh, built on an extinct volcanic rock.',
      keyFeatures: ['Crown Jewels', 'Stone of Destiny', 'Great Hall', 'Military Museum', 'One O\'Clock Gun']
    },
    {
      id: 'windsor_castle',
      castleName: 'Windsor Castle',
      country: 'England',
      location: 'Berkshire',
      architecturalStyle: 'Gothic',
      yearBuilt: '11th century',
      shortDescription: 'The oldest and largest occupied castle in the world, serving as an official residence of the British Royal Family.',
      keyFeatures: ['State Apartments', 'St George\'s Chapel', 'Queen Mary\'s Dolls\' House', 'Round Tower', 'Long Walk']
    }
  ],

  // Invalid castle data for negative testing
  invalidCastles: [
    {
      // Missing required fields
      id: 'incomplete_castle',
      castleName: 'Incomplete Castle',
      country: 'Missing Fields'
      // Missing: location, architecturalStyle, yearBuilt, shortDescription, keyFeatures
    },
    {
      // Wrong data types
      id: 123,
      castleName: 'Type Error Castle',
      country: 'Type Test',
      location: 'Test Location',
      architecturalStyle: 'Test Style',
      yearBuilt: 2023, // Should be string
      shortDescription: 'Test description',
      keyFeatures: 'Not an array' // Should be array
    },
    {
      // Empty values
      id: '',
      castleName: '',
      country: '',
      location: '',
      architecturalStyle: '',
      yearBuilt: '',
      shortDescription: '',
      keyFeatures: []
    }
  ],

  // Test castle data with suspicious content
  suspiciousCastles: [
    {
      id: 'test_castle',
      castleName: 'Test Castle',
      country: 'Test Country',
      location: 'Mock Location',
      architecturalStyle: 'Sample Style',
      yearBuilt: 'Fake century',
      shortDescription: 'This is a dummy description for testing purposes.',
      keyFeatures: ['Mock Feature', 'Placeholder Feature']
    },
    {
      id: 'fake_castle',
      castleName: 'Fake Castle',
      country: 'Example Country',
      location: 'Example Location',
      architecturalStyle: 'Generic Style',
      yearBuilt: 'Unknown',
      shortDescription: 'A generic castle for demonstration.',
      keyFeatures: ['Generic Feature 1', 'Generic Feature 2']
    }
  ]
};

const mockHTML = {
  validCastleHTML: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neuschwanstein Castle</title>
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <header>
        <h1>Neuschwanstein Castle</h1>
    </header>
    <main>
        <section>
            <h2>Overview</h2>
            <p><strong>Country:</strong> Germany</p>
            <p><strong>Location:</strong> Bavaria</p>
            <p><strong>Architectural Style:</strong> Romanesque Revival</p>
            <p><strong>Year Built:</strong> 19th century</p>
        </section>
        <section>
            <h2>Description</h2>
            <p>A fairytale castle commissioned by Ludwig II of Bavaria. This romantic castle inspired Disney's Sleeping Beauty Castle.</p>
        </section>
        <section>
            <h2>Key Features</h2>
            <ul>
                <li>Gothic Revival architecture</li>
                <li>Mountain setting</li>
                <li>Disney inspiration</li>
                <li>Throne room</li>
                <li>Singers' Hall</li>
            </ul>
        </section>
    </main>
</body>
</html>`,

  validIndexHTML: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Castles Over The World</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Castles Over The World</h1>
        <p>A comprehensive encyclopedia of the world's most magnificent castles</p>
    </header>
    <main>
        <section>
            <h2>Castle Collection</h2>
            <div class="castle-grid">
                <div class="castle-card">
                    <h3><a href="articles/neuschwanstein_castle.html">Neuschwanstein Castle</a></h3>
                    <p>Germany - Bavaria</p>
                </div>
                <div class="castle-card">
                    <h3><a href="articles/edinburgh_castle.html">Edinburgh Castle</a></h3>
                    <p>Scotland - Edinburgh</p>
                </div>
                <div class="castle-card">
                    <h3><a href="articles/windsor_castle.html">Windsor Castle</a></h3>
                    <p>England - Berkshire</p>
                </div>
            </div>
        </section>
    </main>
    <footer>
        <p>© 2025 Castles Over The World - A Self-Expanding Encyclopedia</p>
    </footer>
</body>
</html>`,

  invalidHTML: `<div>
    <h1>Not proper HTML structure</h1>
    <p>Missing DOCTYPE, html, head, body tags</p>
  </div>`,

  incompleteHTML: `<!DOCTYPE html>
<html>
<head>
    <title>Incomplete</title>
</head>
<body>
    <!-- Missing required content -->
</body>
</html>`
};

const mockCSS = {
  validCSS: `/* Castles Over The World - Elegant Styling */

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

/* Castle Grid */
.castle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
footer {
    text-align: center;
    border-top: 2px solid #8b4513;
    margin-top: 3rem;
    color: #666;
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
}`,

  invalidCSS: `This is not valid CSS content.
Just plain text without any CSS rules.`,

  incompleteCSS: `body {
    font-family: Arial;
    /* Missing closing brace and other rules */`
};

const mockFileSystem = {
  projectStructure: {
    'castles.json': JSON.stringify(mockCastles.validCastles, null, 2),
    'style.css': mockCSS.validCSS,
    'index.html': mockHTML.validIndexHTML,
    'articles/': {
      'neuschwanstein_castle.html': mockHTML.validCastleHTML,
      'edinburgh_castle.html': mockHTML.validCastleHTML.replace(/Neuschwanstein Castle/g, 'Edinburgh Castle'),
      'windsor_castle.html': mockHTML.validCastleHTML.replace(/Neuschwanstein Castle/g, 'Windsor Castle')
    }
  },

  corruptedFiles: {
    'castles.json': '{ invalid json content }',
    'style.css': mockCSS.invalidCSS,
    'index.html': mockHTML.invalidHTML
  },

  emptyFiles: {
    'castles.json': '',
    'style.css': '',
    'index.html': ''
  }
};

const mockLogs = {
  successLogs: [
    "Success! 'Neuschwanstein Castle' was added. The site now features 1 castles.",
    "Success! 'Edinburgh Castle' was added. The site now features 2 castles.",
    "AI is adding 'Windsor Castle' to the collection...",
    "Generated article: articles/neuschwanstein_castle.html",
    "Created index.html with 3 castle links",
    "CSS file created with elegant styling"
  ],

  errorLogs: [
    "Error: Failed to parse castles.json - invalid JSON format",
    "Warning: Articles directory not found, creating...",
    "Error: Unable to write to style.css - permission denied",
    "Warning: Duplicate castle detected: 'Neuschwanstein Castle'",
    "Error: Castle validation failed - missing required fields"
  ]
};

// Utility functions for test setup
const testUtils = {
  createMockProject: async (fs, basePath) => {
    await fs.ensureDir(basePath);
    await fs.ensureDir(`${basePath}/articles`);
    
    // Write main files
    await fs.writeFile(`${basePath}/castles.json`, mockFileSystem.projectStructure['castles.json']);
    await fs.writeFile(`${basePath}/style.css`, mockFileSystem.projectStructure['style.css']);
    await fs.writeFile(`${basePath}/index.html`, mockFileSystem.projectStructure['index.html']);
    
    // Write article files
    for (const [filename, content] of Object.entries(mockFileSystem.projectStructure['articles/'])) {
      await fs.writeFile(`${basePath}/articles/${filename}`, content);
    }
  },

  createCorruptedProject: async (fs, basePath) => {
    await fs.ensureDir(basePath);
    
    for (const [filename, content] of Object.entries(mockFileSystem.corruptedFiles)) {
      await fs.writeFile(`${basePath}/${filename}`, content);
    }
  },

  randomCastle: () => {
    const styles = ['Gothic', 'Romanesque', 'Renaissance', 'Medieval', 'Baroque'];
    const countries = ['France', 'Germany', 'England', 'Scotland', 'Spain', 'Italy'];
    const features = ['Tower', 'Moat', 'Great Hall', 'Chapel', 'Dungeon', 'Courtyard'];
    
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const id = `castle_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    return {
      id,
      castleName: `Castle ${id.split('_')[1]}`,
      country: random(countries),
      location: `Location ${Math.floor(Math.random() * 100)}`,
      architecturalStyle: random(styles),
      yearBuilt: `${Math.floor(Math.random() * 10) + 10}th century`,
      shortDescription: `A magnificent castle with rich history and architectural significance.`,
      keyFeatures: [random(features), random(features), random(features)]
    };
  }
};

module.exports = {
  mockCastles,
  mockHTML,
  mockCSS,
  mockFileSystem,
  mockLogs,
  testUtils
};