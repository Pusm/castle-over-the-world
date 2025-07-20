// Castle Comparison Tools
// Provides advanced comparison capabilities for ultra-detailed castle analysis

class CastleComparisonTools {
  constructor(containerId, castleDatabase) {
    this.container = document.getElementById(containerId);
    this.database = castleDatabase;
    this.selectedCastles = [];
    this.maxComparisons = 4;
    this.comparisonCategories = [
      'overview',
      'architecture', 
      'engineering',
      'history',
      'cultural',
      'defensive',
      'materials',
      'conservation',
      'visitor'
    ];
    this.currentCategory = 'overview';
    this.visualizations = {};
    
    this.init();
  }

  init() {
    this.createComparisonInterface();
    this.setupEventListeners();
    this.loadComparisonData();
  }

  createComparisonInterface() {
    this.container.innerHTML = `
      <div class="comparison-container">
        <div class="comparison-header">
          <h2>Advanced Castle Comparison</h2>
          <div class="comparison-info">
            <span class="selected-count">${this.selectedCastles.length}/${this.maxComparisons} castles selected</span>
            <button class="help-btn" id="comparison-help">❓ Help</button>
          </div>
        </div>

        <div class="castle-selector">
          <div class="selector-header">
            <h3>Select Castles to Compare</h3>
            <div class="selector-controls">
              <input type="text" id="castle-search" placeholder="Search castles to add to comparison...">
              <button class="clear-all-btn" id="clear-all">Clear All</button>
            </div>
          </div>
          
          <div class="castle-chips" id="castle-chips">
            <!-- Selected castles will appear here as chips -->
          </div>
          
          <div class="castle-suggestions" id="castle-suggestions">
            <!-- Search suggestions will appear here -->
          </div>
        </div>

        <div class="comparison-main" id="comparison-main" style="display: none;">
          <div class="comparison-nav">
            <div class="category-tabs">
              <button class="tab-btn active" data-category="overview">📊 Overview</button>
              <button class="tab-btn" data-category="architecture">🏛️ Architecture</button>
              <button class="tab-btn" data-category="engineering">⚙️ Engineering</button>
              <button class="tab-btn" data-category="history">📜 History</button>
              <button class="tab-btn" data-category="cultural">🎭 Cultural</button>
              <button class="tab-btn" data-category="defensive">🛡️ Defensive</button>
              <button class="tab-btn" data-category="materials">🧱 Materials</button>
              <button class="tab-btn" data-category="conservation">🔧 Conservation</button>
              <button class="tab-btn" data-category="visitor">🎫 Visitor Info</button>
            </div>
            
            <div class="comparison-tools">
              <button class="tool-btn" id="export-comparison">📤 Export</button>
              <button class="tool-btn" id="save-comparison">💾 Save</button>
              <button class="tool-btn" id="visualization-mode">📈 Visualize</button>
            </div>
          </div>

          <div class="comparison-content" id="comparison-content">
            <!-- Comparison content will be dynamically generated -->
          </div>
        </div>

        <div class="empty-state" id="empty-state">
          <div class="empty-content">
            <h3>Start Comparing Castles</h3>
            <p>Select 2-4 castles from the search above to begin detailed comparison</p>
            <div class="quick-comparisons">
              <h4>Popular Comparisons:</h4>
              <button class="quick-btn" data-comparison="fairy-tale">Fairy Tale Castles</button>
              <button class="quick-btn" data-comparison="medieval-fortresses">Medieval Fortresses</button>
              <button class="quick-btn" data-comparison="royal-residences">Royal Residences</button>
              <button class="quick-btn" data-comparison="unesco-sites">UNESCO Sites</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="comparison-modal" id="comparison-modal" style="display: none;">
        <div class="modal-content">
          <span class="modal-close" id="modal-close">&times;</span>
          <div class="modal-body" id="modal-body">
            <!-- Modal content will be inserted here -->
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Castle search
    document.getElementById('castle-search').addEventListener('input', (e) => {
      this.handleCastleSearch(e.target.value);
    });

    // Clear all selections
    document.getElementById('clear-all').addEventListener('click', () => {
      this.clearAllSelections();
    });

    // Category tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchCategory(e.target.dataset.category);
      });
    });

    // Quick comparisons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.loadQuickComparison(e.target.dataset.comparison);
      });
    });

    // Tool buttons
    document.getElementById('export-comparison').addEventListener('click', () => {
      this.exportComparison();
    });

    document.getElementById('save-comparison').addEventListener('click', () => {
      this.saveComparison();
    });

    document.getElementById('visualization-mode').addEventListener('click', () => {
      this.toggleVisualizationMode();
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', () => {
      this.closeModal();
    });
  }

  handleCastleSearch(query) {
    if (query.length < 2) {
      document.getElementById('castle-suggestions').innerHTML = '';
      return;
    }

    const suggestions = this.database
      .filter(castle => 
        castle.castleName.toLowerCase().includes(query.toLowerCase()) ||
        castle.location.toLowerCase().includes(query.toLowerCase()) ||
        castle.country.toLowerCase().includes(query.toLowerCase())
      )
      .filter(castle => !this.selectedCastles.find(selected => selected.id === castle.id))
      .slice(0, 8);

    this.displaySuggestions(suggestions);
  }

  displaySuggestions(suggestions) {
    const container = document.getElementById('castle-suggestions');
    
    if (suggestions.length === 0) {
      container.innerHTML = '<div class="no-suggestions">No matching castles found</div>';
      return;
    }

    container.innerHTML = suggestions.map(castle => `
      <div class="suggestion-item" data-castle-id="${castle.id}">
        <div class="suggestion-image">
          <img src="images/${castle.id}/thumbnail.jpg" alt="${castle.castleName}"
               onerror="this.src='images/placeholder-castle.jpg'">
        </div>
        <div class="suggestion-info">
          <h4>${castle.castleName}</h4>
          <p>${castle.location}, ${castle.country}</p>
          <span class="suggestion-period">${castle.yearBuilt}</span>
        </div>
        <button class="add-btn" onclick="this.addCastleToComparison('${castle.id}')">
          Add to Compare
        </button>
      </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.matches('.add-btn')) {
          this.addCastleToComparison(item.dataset.castleId);
        }
      });
    });
  }

  addCastleToComparison(castleId) {
    if (this.selectedCastles.length >= this.maxComparisons) {
      alert(`Maximum ${this.maxComparisons} castles can be compared at once`);
      return;
    }

    const castle = this.database.find(c => c.id === castleId);
    if (!castle || this.selectedCastles.find(c => c.id === castleId)) {
      return;
    }

    this.selectedCastles.push(castle);
    this.updateCastleChips();
    this.updateComparisonView();
    
    // Clear search
    document.getElementById('castle-search').value = '';
    document.getElementById('castle-suggestions').innerHTML = '';
  }

  updateCastleChips() {
    const container = document.getElementById('castle-chips');
    const countElement = document.querySelector('.selected-count');
    
    countElement.textContent = `${this.selectedCastles.length}/${this.maxComparisons} castles selected`;
    
    container.innerHTML = this.selectedCastles.map(castle => `
      <div class="castle-chip" data-castle-id="${castle.id}">
        <img src="images/${castle.id}/thumbnail.jpg" alt="${castle.castleName}"
             onerror="this.src='images/placeholder-castle.jpg'">
        <span class="chip-name">${castle.castleName}</span>
        <button class="remove-btn" onclick="this.removeCastleFromComparison('${castle.id}')">&times;</button>
      </div>
    `).join('');
  }

  removeCastleFromComparison(castleId) {
    this.selectedCastles = this.selectedCastles.filter(castle => castle.id !== castleId);
    this.updateCastleChips();
    this.updateComparisonView();
  }

  updateComparisonView() {
    const mainElement = document.getElementById('comparison-main');
    const emptyElement = document.getElementById('empty-state');
    
    if (this.selectedCastles.length >= 2) {
      mainElement.style.display = 'block';
      emptyElement.style.display = 'none';
      this.generateComparisonContent();
    } else {
      mainElement.style.display = 'none';
      emptyElement.style.display = 'block';
    }
  }

  switchCategory(category) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    this.currentCategory = category;
    this.generateComparisonContent();
  }

  generateComparisonContent() {
    const container = document.getElementById('comparison-content');
    
    switch (this.currentCategory) {
      case 'overview':
        container.innerHTML = this.generateOverviewComparison();
        break;
      case 'architecture':
        container.innerHTML = this.generateArchitectureComparison();
        break;
      case 'engineering':
        container.innerHTML = this.generateEngineeringComparison();
        break;
      case 'history':
        container.innerHTML = this.generateHistoryComparison();
        break;
      case 'cultural':
        container.innerHTML = this.generateCulturalComparison();
        break;
      case 'defensive':
        container.innerHTML = this.generateDefensiveComparison();
        break;
      case 'materials':
        container.innerHTML = this.generateMaterialsComparison();
        break;
      case 'conservation':
        container.innerHTML = this.generateConservationComparison();
        break;
      case 'visitor':
        container.innerHTML = this.generateVisitorComparison();
        break;
    }
    
    this.setupComparisonInteractions();
  }

  generateOverviewComparison() {
    return `
      <div class="overview-comparison">
        <div class="comparison-table">
          <table class="detailed-comparison-table">
            <thead>
              <tr>
                <th class="attribute-header">Attribute</th>
                ${this.selectedCastles.map(castle => 
                  `<th class="castle-header">
                    <img src="images/${castle.id}/thumbnail.jpg" alt="${castle.castleName}"
                         onerror="this.src='images/placeholder-castle.jpg'">
                    <div class="header-text">
                      <h4>${castle.castleName}</h4>
                      <p>${castle.location}</p>
                    </div>
                  </th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${this.generateComparisonRows([
                { key: 'yearBuilt', label: 'Construction Period', type: 'text' },
                { key: 'architecturalStyle', label: 'Architectural Style', type: 'text' },
                { key: 'country', label: 'Country', type: 'text' },
                { key: 'keyFeatures', label: 'Key Features', type: 'list' },
                { key: 'culturalSignificance', label: 'Cultural Significance', type: 'text', truncate: 200 },
                { key: 'politicalSignificance', label: 'Political Significance', type: 'text', truncate: 200 }
              ])}
            </tbody>
          </table>
        </div>
        
        <div class="visual-comparison">
          <h3>Visual Comparison</h3>
          <div class="castle-gallery">
            ${this.selectedCastles.map(castle => `
              <div class="gallery-item">
                <img src="images/${castle.id}/main.jpg" alt="${castle.castleName}"
                     onerror="this.src='images/placeholder-castle.jpg'">
                <div class="gallery-caption">
                  <h4>${castle.castleName}</h4>
                  <p>${castle.yearBuilt}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="comparison-insights">
          <h3>Key Insights</h3>
          ${this.generateComparisonInsights()}
        </div>
      </div>
    `;
  }

  generateEngineeringComparison() {
    return `
      <div class="engineering-comparison">
        <div class="engineering-overview">
          <h3>Engineering & Construction Analysis</h3>
          <div class="engineering-grid">
            ${this.selectedCastles.map(castle => `
              <div class="engineering-card">
                <h4>${castle.castleName}</h4>
                
                <div class="engineering-section">
                  <h5>Foundation Engineering</h5>
                  ${castle.engineeringDetails?.foundationEngineering ? `
                    <div class="engineering-detail">
                      <strong>Geological Base:</strong> 
                      ${castle.engineeringDetails.foundationEngineering.geologicalBase}
                    </div>
                    <div class="engineering-detail">
                      <strong>Formation Process:</strong> 
                      ${castle.engineeringDetails.foundationEngineering.formationProcess}
                    </div>
                    <div class="engineering-advantages">
                      <strong>Engineering Advantages:</strong>
                      <ul>
                        ${castle.engineeringDetails.foundationEngineering.engineeringAdvantages?.map(advantage => 
                          `<li>${advantage}</li>`
                        ).join('') || ''}
                      </ul>
                    </div>
                  ` : '<p class="no-data">Engineering details not available</p>'}
                </div>
                
                <div class="engineering-section">
                  <h5>Construction Techniques</h5>
                  ${castle.engineeringDetails?.constructionTechniques ? `
                    ${Object.entries(castle.engineeringDetails.constructionTechniques).map(([key, techniques]) => `
                      <div class="technique-group">
                        <strong>${this.formatTechniqueName(key)}:</strong>
                        <ul>
                          ${Array.isArray(techniques) ? techniques.map(technique => 
                            `<li>${technique}</li>`
                          ).join('') : `<li>${techniques}</li>`}
                        </ul>
                      </div>
                    `).join('')}
                  ` : '<p class="no-data">Construction technique details not available</p>'}
                </div>
                
                <div class="engineering-section">
                  <h5>Material Properties</h5>
                  ${castle.engineeringDetails?.materialProperties ? `
                    ${Object.entries(castle.engineeringDetails.materialProperties).map(([material, properties]) => `
                      <div class="material-detail">
                        <strong>${this.formatMaterialName(material)}:</strong> ${properties}
                      </div>
                    `).join('')}
                  ` : '<p class="no-data">Material property details not available</p>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="engineering-analysis">
          <h3>Comparative Engineering Analysis</h3>
          ${this.generateEngineeringAnalysis()}
        </div>
        
        <div class="innovation-timeline">
          <h3>Construction Innovation Timeline</h3>
          ${this.generateInnovationTimeline()}
        </div>
      </div>
    `;
  }

  generateArchitectureComparison() {
    return `
      <div class="architecture-comparison">
        <div class="style-analysis">
          <h3>Architectural Style Analysis</h3>
          <div class="style-grid">
            ${this.selectedCastles.map(castle => `
              <div class="style-card">
                <h4>${castle.castleName}</h4>
                <div class="style-details">
                  <div class="style-primary">
                    <strong>Primary Style:</strong> ${castle.architecturalStyle}
                  </div>
                  <div class="style-period">
                    <strong>Period:</strong> ${castle.yearBuilt}
                  </div>
                  <div class="style-features">
                    <strong>Architectural Features:</strong>
                    <ul>
                      ${castle.keyFeatures?.map(feature => `<li>${feature}</li>`).join('') || ''}
                    </ul>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="architectural-elements">
          <h3>Architectural Elements Comparison</h3>
          <table class="elements-table">
            <thead>
              <tr>
                <th>Element</th>
                ${this.selectedCastles.map(castle => `<th>${castle.castleName}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${this.generateArchitecturalElementRows()}
            </tbody>
          </table>
        </div>
        
        <div class="style-evolution">
          <h3>Architectural Style Evolution</h3>
          ${this.generateStyleEvolution()}
        </div>
      </div>
    `;
  }

  generateComparisonRows(attributes) {
    return attributes.map(attr => `
      <tr class="comparison-row">
        <td class="attribute-cell">
          <strong>${attr.label}</strong>
          ${attr.description ? `<div class="attr-description">${attr.description}</div>` : ''}
        </td>
        ${this.selectedCastles.map(castle => {
          const value = this.getCastleValue(castle, attr.key);
          return `<td class="value-cell ${attr.type}">${this.formatCellValue(value, attr)}</td>`;
        }).join('')}
      </tr>
    `).join('');
  }

  getCastleValue(castle, key) {
    const keys = key.split('.');
    let value = castle;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }

  formatCellValue(value, attr) {
    if (!value) return '<span class="no-data">Not available</span>';
    
    switch (attr.type) {
      case 'list':
        if (Array.isArray(value)) {
          return `<ul class="cell-list">${value.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
        return value;
      case 'text':
        if (attr.truncate && value.length > attr.truncate) {
          return `
            <div class="truncated-text">
              ${value.substring(0, attr.truncate)}...
              <button class="expand-btn" onclick="this.expandText(this)">Read more</button>
              <div class="full-text" style="display: none;">${value}</div>
            </div>
          `;
        }
        return value;
      default:
        return value;
    }
  }

  formatTechniqueName(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  formatMaterialName(material) {
    return material.charAt(0).toUpperCase() + material.slice(1);
  }

  generateComparisonInsights() {
    const insights = [];
    
    // Age comparison
    const periods = this.selectedCastles.map(castle => this.extractYear(castle.yearBuilt)).filter(year => year);
    if (periods.length > 1) {
      const oldest = Math.min(...periods);
      const newest = Math.max(...periods);
      const oldestCastle = this.selectedCastles.find(castle => this.extractYear(castle.yearBuilt) === oldest);
      const newestCastle = this.selectedCastles.find(castle => this.extractYear(castle.yearBuilt) === newest);
      
      insights.push(`
        <div class="insight-item">
          <h4>🕰️ Age Span</h4>
          <p><strong>${oldestCastle.castleName}</strong> is the oldest (${oldestCastle.yearBuilt}), 
          while <strong>${newestCastle.castleName}</strong> is the newest (${newestCastle.yearBuilt}), 
          spanning ${newest - oldest} years of architectural evolution.</p>
        </div>
      `);
    }
    
    // Style diversity
    const styles = [...new Set(this.selectedCastles.map(castle => castle.architecturalStyle))];
    if (styles.length > 1) {
      insights.push(`
        <div class="insight-item">
          <h4>🏛️ Architectural Diversity</h4>
          <p>This comparison showcases ${styles.length} different architectural styles: 
          ${styles.join(', ')}, demonstrating the evolution of castle design across periods.</p>
        </div>
      `);
    }
    
    // Geographic distribution
    const countries = [...new Set(this.selectedCastles.map(castle => castle.country))];
    if (countries.length > 1) {
      insights.push(`
        <div class="insight-item">
          <h4>🌍 Geographic Spread</h4>
          <p>These castles represent ${countries.length} different countries (${countries.join(', ')}), 
          showing how castle architecture varied across different regions and cultures.</p>
        </div>
      `);
    }
    
    return insights.join('');
  }

  generateEngineeringAnalysis() {
    const analysis = [];
    
    // Foundation analysis
    const foundations = this.selectedCastles
      .filter(castle => castle.engineeringDetails?.foundationEngineering)
      .map(castle => ({
        name: castle.castleName,
        foundation: castle.engineeringDetails.foundationEngineering.geologicalBase
      }));
    
    if (foundations.length > 1) {
      analysis.push(`
        <div class="analysis-section">
          <h4>Foundation Engineering Comparison</h4>
          <div class="foundation-comparison">
            ${foundations.map(f => `
              <div class="foundation-item">
                <strong>${f.name}:</strong> ${f.foundation}
              </div>
            `).join('')}
          </div>
          <p class="analysis-insight">
            Each castle's foundation reflects its geological environment and available materials, 
            demonstrating how medieval builders adapted to local conditions.
          </p>
        </div>
      `);
    }
    
    // Innovation analysis
    const innovations = this.selectedCastles
      .filter(castle => castle.engineeringDetails?.constructionTechniques)
      .map(castle => ({
        name: castle.castleName,
        innovations: Object.values(castle.engineeringDetails.constructionTechniques).flat()
      }));
    
    if (innovations.length > 0) {
      analysis.push(`
        <div class="analysis-section">
          <h4>Construction Innovation Analysis</h4>
          <p class="analysis-insight">
            These castles showcase various construction innovations that were revolutionary for their time:
          </p>
          <div class="innovation-grid">
            ${innovations.map(castle => `
              <div class="innovation-item">
                <h5>${castle.name}</h5>
                <ul>
                  ${castle.innovations.slice(0, 3).map(innovation => 
                    `<li>${innovation}</li>`
                  ).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      `);
    }
    
    return analysis.join('');
  }

  generateInnovationTimeline() {
    const innovations = [];
    
    this.selectedCastles.forEach(castle => {
      const year = this.extractYear(castle.yearBuilt);
      if (year && castle.engineeringDetails?.constructionTechniques) {
        const techniques = Object.values(castle.engineeringDetails.constructionTechniques).flat();
        innovations.push({
          year,
          castle: castle.castleName,
          innovations: techniques.slice(0, 2) // Top 2 innovations
        });
      }
    });
    
    innovations.sort((a, b) => a.year - b.year);
    
    return `
      <div class="timeline-container">
        ${innovations.map(item => `
          <div class="timeline-item">
            <div class="timeline-year">${item.year}</div>
            <div class="timeline-content">
              <h4>${item.castle}</h4>
              <ul>
                ${item.innovations.map(innovation => `<li>${innovation}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  extractYear(yearString) {
    const match = yearString.match(/\d{3,4}/);
    return match ? parseInt(match[0]) : null;
  }

  loadQuickComparison(type) {
    let castleIds = [];
    
    switch (type) {
      case 'fairy-tale':
        castleIds = ['neuschwanstein_castle', 'hohenzollern_castle'];
        break;
      case 'medieval-fortresses':
        castleIds = ['edinburgh_castle', 'warwick_castle'];
        break;
      case 'royal-residences':
        castleIds = ['windsor_castle', 'palace_of_versailles'];
        break;
      case 'unesco-sites':
        castleIds = ['himeji_castle', 'edinburgh_castle'];
        break;
    }
    
    this.selectedCastles = [];
    castleIds.forEach(id => {
      const castle = this.database.find(c => c.id === id);
      if (castle) {
        this.selectedCastles.push(castle);
      }
    });
    
    this.updateCastleChips();
    this.updateComparisonView();
  }

  clearAllSelections() {
    this.selectedCastles = [];
    this.updateCastleChips();
    this.updateComparisonView();
  }

  exportComparison() {
    const data = {
      castles: this.selectedCastles.map(castle => ({
        id: castle.id,
        name: castle.castleName,
        location: castle.location,
        country: castle.country
      })),
      timestamp: new Date().toISOString(),
      category: this.currentCategory
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `castle-comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // CSS Styles
  injectStyles() {
    const styles = `
      .comparison-container {
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f8f9fa;
        min-height: 100vh;
      }
      
      .comparison-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid #3498db;
      }
      
      .comparison-header h2 {
        color: #2c3e50;
        margin: 0;
        font-size: 28px;
      }
      
      .comparison-info {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .selected-count {
        color: #7f8c8d;
        font-weight: 500;
      }
      
      .help-btn {
        background: #95a5a6;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .castle-selector {
        background: white;
        border-radius: 10px;
        padding: 25px;
        margin-bottom: 25px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .selector-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .selector-header h3 {
        color: #2c3e50;
        margin: 0;
      }
      
      .selector-controls {
        display: flex;
        gap: 15px;
        align-items: center;
      }
      
      #castle-search {
        padding: 10px 15px;
        border: 2px solid #bdc3c7;
        border-radius: 6px;
        font-size: 14px;
        width: 300px;
        outline: none;
      }
      
      #castle-search:focus {
        border-color: #3498db;
      }
      
      .clear-all-btn {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .castle-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
        min-height: 50px;
        align-items: center;
      }
      
      .castle-chip {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #3498db;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 14px;
      }
      
      .castle-chip img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .remove-btn {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: 5px;
      }
      
      .castle-suggestions {
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #ecf0f1;
        border-radius: 6px;
        background: white;
      }
      
      .suggestion-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 15px;
        border-bottom: 1px solid #ecf0f1;
        cursor: pointer;
        transition: background 0.3s ease;
      }
      
      .suggestion-item:hover {
        background: #f8f9fa;
      }
      
      .suggestion-image img {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        object-fit: cover;
      }
      
      .suggestion-info {
        flex: 1;
      }
      
      .suggestion-info h4 {
        margin: 0 0 4px 0;
        color: #2c3e50;
        font-size: 16px;
      }
      
      .suggestion-info p {
        margin: 0 0 4px 0;
        color: #7f8c8d;
        font-size: 14px;
      }
      
      .suggestion-period {
        font-size: 12px;
        color: #95a5a6;
      }
      
      .add-btn {
        background: #27ae60;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .comparison-main {
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .comparison-nav {
        background: #2c3e50;
        padding: 0 25px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .category-tabs {
        display: flex;
        gap: 5px;
      }
      
      .tab-btn {
        background: none;
        border: none;
        color: #bdc3c7;
        padding: 15px 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        border-bottom: 3px solid transparent;
      }
      
      .tab-btn:hover {
        color: white;
        background: rgba(255,255,255,0.1);
      }
      
      .tab-btn.active {
        color: white;
        border-bottom-color: #3498db;
      }
      
      .comparison-tools {
        display: flex;
        gap: 10px;
      }
      
      .tool-btn {
        background: #34495e;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.3s ease;
      }
      
      .tool-btn:hover {
        background: #4a6741;
      }
      
      .comparison-content {
        padding: 30px;
        max-height: 800px;
        overflow-y: auto;
      }
      
      .detailed-comparison-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      
      .detailed-comparison-table th,
      .detailed-comparison-table td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid #ecf0f1;
        vertical-align: top;
      }
      
      .castle-header {
        background: #f8f9fa;
        text-align: center;
        min-width: 200px;
      }
      
      .castle-header img {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        object-fit: cover;
        margin-bottom: 10px;
      }
      
      .castle-header h4 {
        margin: 0 0 4px 0;
        color: #2c3e50;
        font-size: 16px;
      }
      
      .castle-header p {
        margin: 0;
        color: #7f8c8d;
        font-size: 12px;
      }
      
      .attribute-header {
        background: #2c3e50;
        color: white;
        font-weight: bold;
        min-width: 200px;
      }
      
      .attribute-cell {
        background: #f8f9fa;
        font-weight: 500;
        color: #2c3e50;
      }
      
      .value-cell {
        background: white;
      }
      
      .cell-list {
        margin: 0;
        padding-left: 20px;
      }
      
      .cell-list li {
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      .no-data {
        color: #95a5a6;
        font-style: italic;
      }
      
      .truncated-text {
        position: relative;
      }
      
      .expand-btn {
        color: #3498db;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 12px;
        text-decoration: underline;
      }
      
      .visual-comparison {
        margin-bottom: 30px;
      }
      
      .castle-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      
      .gallery-item {
        text-align: center;
      }
      
      .gallery-item img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 10px;
      }
      
      .gallery-caption h4 {
        margin: 0 0 4px 0;
        color: #2c3e50;
        font-size: 16px;
      }
      
      .gallery-caption p {
        margin: 0;
        color: #7f8c8d;
        font-size: 14px;
      }
      
      .comparison-insights {
        background: #f8f9fa;
        padding: 25px;
        border-radius: 8px;
        border-left: 4px solid #3498db;
      }
      
      .insight-item {
        margin-bottom: 20px;
      }
      
      .insight-item h4 {
        color: #2c3e50;
        margin: 0 0 8px 0;
        font-size: 16px;
      }
      
      .insight-item p {
        margin: 0;
        color: #34495e;
        line-height: 1.6;
      }
      
      .engineering-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 25px;
        margin-top: 20px;
      }
      
      .engineering-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #e74c3c;
      }
      
      .engineering-card h4 {
        color: #2c3e50;
        margin: 0 0 20px 0;
        font-size: 18px;
      }
      
      .engineering-section {
        margin-bottom: 20px;
      }
      
      .engineering-section h5 {
        color: #34495e;
        margin: 0 0 10px 0;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .engineering-detail {
        margin-bottom: 8px;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .engineering-detail strong {
        color: #2c3e50;
      }
      
      .engineering-advantages ul,
      .technique-group ul {
        margin: 8px 0 0 20px;
        padding: 0;
      }
      
      .engineering-advantages li,
      .technique-group li {
        margin-bottom: 4px;
        font-size: 13px;
        line-height: 1.4;
      }
      
      .material-detail {
        background: white;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 8px;
        font-size: 13px;
        line-height: 1.4;
      }
      
      .material-detail strong {
        color: #e74c3c;
      }
      
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .empty-content h3 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 24px;
      }
      
      .empty-content p {
        color: #7f8c8d;
        margin-bottom: 30px;
        font-size: 16px;
      }
      
      .quick-comparisons h4 {
        color: #34495e;
        margin-bottom: 15px;
      }
      
      .quick-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        margin: 5px;
        font-size: 14px;
        transition: background 0.3s ease;
      }
      
      .quick-btn:hover {
        background: #2980b9;
      }
      
      @media (max-width: 768px) {
        .comparison-container {
          padding: 15px;
        }
        
        .comparison-header {
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }
        
        .selector-header {
          flex-direction: column;
          gap: 15px;
        }
        
        #castle-search {
          width: 100%;
        }
        
        .comparison-nav {
          flex-direction: column;
          gap: 15px;
          padding: 15px;
        }
        
        .category-tabs {
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .tab-btn {
          padding: 10px 15px;
          font-size: 12px;
        }
        
        .detailed-comparison-table {
          font-size: 12px;
        }
        
        .detailed-comparison-table th,
        .detailed-comparison-table td {
          padding: 8px;
        }
        
        .engineering-grid {
          grid-template-columns: 1fr;
        }
        
        .castle-gallery {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

// Auto-inject styles when script loads
if (typeof document !== 'undefined') {
  const comparison = new CastleComparisonTools();
  comparison.injectStyles();
}

module.exports = CastleComparisonTools;