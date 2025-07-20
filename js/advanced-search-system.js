// Advanced Search and Filtering System
// Provides comprehensive search capabilities exceeding Wikipedia standards

class AdvancedSearchSystem {
  constructor(containerId, castleDatabase) {
    this.container = document.getElementById(containerId);
    this.database = castleDatabase;
    this.searchIndex = {};
    this.filters = {
      country: [],
      period: [],
      style: [],
      size: [],
      condition: [],
      purpose: [],
      significance: []
    };
    this.sortOptions = ['relevance', 'alphabetical', 'chronological', 'popularity'];
    this.currentSort = 'relevance';
    this.searchHistory = [];
    this.savedSearches = [];
    this.results = [];
    this.currentQuery = '';
    
    this.init();
  }

  init() {
    this.buildSearchIndex();
    this.createSearchInterface();
    this.setupEventListeners();
    this.loadSearchHistory();
    this.initializeAutocomplete();
  }

  buildSearchIndex() {
    console.log('Building advanced search index...');
    
    this.searchIndex = {
      keywords: new Map(),
      fuzzy: new Map(),
      semantic: new Map(),
      historical: new Map(),
      architectural: new Map(),
      geographical: new Map()
    };
    
    this.database.forEach((castle, index) => {
      this.indexCastle(castle, index);
    });
    
    this.buildAutocompleteData();
    console.log('Search index built with', this.database.length, 'castles');
  }

  indexCastle(castle, index) {
    // Keywords index
    const keywords = this.extractKeywords(castle);
    keywords.forEach(keyword => {
      if (!this.searchIndex.keywords.has(keyword)) {
        this.searchIndex.keywords.set(keyword, []);
      }
      this.searchIndex.keywords.get(keyword).push({
        castleIndex: index,
        relevance: this.calculateRelevance(keyword, castle),
        field: this.getFieldForKeyword(keyword, castle)
      });
    });

    // Fuzzy matching index
    const fuzzyTerms = this.generateFuzzyTerms(castle);
    fuzzyTerms.forEach(term => {
      this.searchIndex.fuzzy.set(term.original, term.variations);
    });

    // Semantic index (related concepts)
    const semanticTerms = this.extractSemanticTerms(castle);
    semanticTerms.forEach(term => {
      if (!this.searchIndex.semantic.has(term.concept)) {
        this.searchIndex.semantic.set(term.concept, []);
      }
      this.searchIndex.semantic.get(term.concept).push({
        castleIndex: index,
        relevance: term.relevance,
        context: term.context
      });
    });

    // Historical index
    if (castle.historicalEvents) {
      castle.historicalEvents.forEach(event => {
        const period = this.determinePeriod(event);
        if (!this.searchIndex.historical.has(period)) {
          this.searchIndex.historical.set(period, []);
        }
        this.searchIndex.historical.get(period).push({
          castleIndex: index,
          event: event,
          relevance: this.calculateHistoricalRelevance(event)
        });
      });
    }

    // Architectural index
    const archStyles = this.extractArchitecturalTerms(castle);
    archStyles.forEach(style => {
      if (!this.searchIndex.architectural.has(style)) {
        this.searchIndex.architectural.set(style, []);
      }
      this.searchIndex.architectural.get(style).push({
        castleIndex: index,
        relevance: this.calculateArchitecturalRelevance(style, castle)
      });
    });

    // Geographical index
    const geoTerms = this.extractGeographicalTerms(castle);
    geoTerms.forEach(term => {
      if (!this.searchIndex.geographical.has(term)) {
        this.searchIndex.geographical.set(term, []);
      }
      this.searchIndex.geographical.get(term).push({
        castleIndex: index,
        relevance: this.calculateGeographicalRelevance(term, castle)
      });
    });
  }

  extractKeywords(castle) {
    const keywords = new Set();
    
    // Basic information
    keywords.add(castle.castleName.toLowerCase());
    keywords.add(castle.country.toLowerCase());
    keywords.add(castle.location.toLowerCase());
    keywords.add(castle.architecturalStyle.toLowerCase());
    
    // Split compound words
    castle.castleName.split(/[\s\-_]/).forEach(word => 
      keywords.add(word.toLowerCase()));
    
    // Key features
    if (castle.keyFeatures) {
      castle.keyFeatures.forEach(feature => {
        keywords.add(feature.toLowerCase());
        feature.split(/[\s\-_]/).forEach(word => 
          keywords.add(word.toLowerCase()));
      });
    }
    
    // Description words
    if (castle.shortDescription) {
      const words = castle.shortDescription.toLowerCase()
        .match(/\b\w{3,}\b/g) || [];
      words.forEach(word => keywords.add(word));
    }
    
    // Enhanced content
    if (castle.culturalSignificance) {
      const culturalWords = castle.culturalSignificance.toLowerCase()
        .match(/\b\w{4,}\b/g) || [];
      culturalWords.forEach(word => keywords.add(word));
    }
    
    if (castle.legends) {
      castle.legends.forEach(legend => {
        const legendWords = legend.toLowerCase()
          .match(/\b\w{4,}\b/g) || [];
        legendWords.forEach(word => keywords.add(word));
      });
    }
    
    return Array.from(keywords);
  }

  createSearchInterface() {
    this.container.innerHTML = `
      <div class="advanced-search-container">
        <div class="search-header">
          <h2>Advanced Castle Search</h2>
          <div class="search-stats">
            <span id="search-stats">${this.database.length} castles in database</span>
          </div>
        </div>

        <div class="search-main">
          <div class="search-input-section">
            <div class="search-input-container">
              <input type="text" id="main-search" placeholder="Search castles, regions, periods, architectural styles..." autocomplete="off">
              <div class="search-suggestions" id="search-suggestions"></div>
              <button class="search-btn" id="search-btn">
                <span class="search-icon">🔍</span>
              </button>
              <button class="advanced-toggle" id="advanced-toggle" title="Advanced Filters">
                <span class="filter-icon">🔧</span>
              </button>
            </div>
            
            <div class="search-options">
              <div class="search-mode">
                <label><input type="radio" name="search-mode" value="all" checked> All words</label>
                <label><input type="radio" name="search-mode" value="any"> Any word</label>
                <label><input type="radio" name="search-mode" value="exact"> Exact phrase</label>
                <label><input type="radio" name="search-mode" value="fuzzy"> Smart search</label>
              </div>
              
              <div class="search-scope">
                <label><input type="checkbox" id="scope-name" checked> Castle names</label>
                <label><input type="checkbox" id="scope-description" checked> Descriptions</label>
                <label><input type="checkbox" id="scope-history" checked> Historical events</label>
                <label><input type="checkbox" id="scope-legends" checked> Legends & folklore</label>
                <label><input type="checkbox" id="scope-cultural" checked> Cultural significance</label>
              </div>
            </div>
          </div>

          <div class="advanced-filters" id="advanced-filters" style="display: none;">
            <div class="filters-grid">
              <div class="filter-group">
                <h4>Geography</h4>
                <div class="filter-content">
                  <select id="filter-country" multiple>
                    <option value="">All Countries</option>
                  </select>
                  <select id="filter-region" multiple>
                    <option value="">All Regions</option>
                  </select>
                </div>
              </div>

              <div class="filter-group">
                <h4>Time Period</h4>
                <div class="filter-content">
                  <div class="period-slider">
                    <input type="range" id="period-start" min="500" max="2000" value="500">
                    <input type="range" id="period-end" min="500" max="2000" value="2000">
                    <div class="period-labels">
                      <span id="period-start-label">500 CE</span>
                      <span id="period-end-label">2000 CE</span>
                    </div>
                  </div>
                  <div class="period-presets">
                    <button class="period-preset" data-period="medieval">Medieval</button>
                    <button class="period-preset" data-period="renaissance">Renaissance</button>
                    <button class="period-preset" data-period="modern">Modern</button>
                  </div>
                </div>
              </div>

              <div class="filter-group">
                <h4>Architecture</h4>
                <div class="filter-content">
                  <div class="style-checkboxes">
                    <label><input type="checkbox" value="gothic"> Gothic</label>
                    <label><input type="checkbox" value="romanesque"> Romanesque</label>
                    <label><input type="checkbox" value="renaissance"> Renaissance</label>
                    <label><input type="checkbox" value="baroque"> Baroque</label>
                    <label><input type="checkbox" value="medieval"> Medieval</label>
                    <label><input type="checkbox" value="neoclassical"> Neoclassical</label>
                  </div>
                </div>
              </div>

              <div class="filter-group">
                <h4>Characteristics</h4>
                <div class="filter-content">
                  <div class="characteristic-filters">
                    <select id="filter-size">
                      <option value="">Any Size</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="massive">Massive</option>
                    </select>
                    
                    <select id="filter-condition">
                      <option value="">Any Condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="ruins">Ruins</option>
                    </select>
                    
                    <select id="filter-purpose">
                      <option value="">Any Purpose</option>
                      <option value="defensive">Defensive</option>
                      <option value="residential">Residential</option>
                      <option value="ceremonial">Ceremonial</option>
                      <option value="religious">Religious</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="filter-group">
                <h4>Significance</h4>
                <div class="filter-content">
                  <label><input type="checkbox" id="filter-unesco"> UNESCO World Heritage</label>
                  <label><input type="checkbox" id="filter-battles"> Historical battles</label>
                  <label><input type="checkbox" id="filter-legends"> Rich in legends</label>
                  <label><input type="checkbox" id="filter-literature"> Literary connections</label>
                  <label><input type="checkbox" id="filter-films"> Featured in films</label>
                </div>
              </div>

              <div class="filter-group">
                <h4>Visitor Features</h4>
                <div class="filter-content">
                  <label><input type="checkbox" id="filter-tours"> Guided tours</label>
                  <label><input type="checkbox" id="filter-accessible"> Wheelchair accessible</label>
                  <label><input type="checkbox" id="filter-virtual"> Virtual tour available</label>
                  <label><input type="checkbox" id="filter-museum"> Museum on site</label>
                </div>
              </div>
            </div>
            
            <div class="filter-actions">
              <button class="filter-btn clear" id="clear-filters">Clear All</button>
              <button class="filter-btn save" id="save-search">Save Search</button>
              <button class="filter-btn apply" id="apply-filters">Apply Filters</button>
            </div>
          </div>
        </div>

        <div class="search-results-section">
          <div class="results-header">
            <div class="results-info">
              <span id="results-count">0 results</span>
              <span id="search-time">0ms</span>
            </div>
            
            <div class="results-controls">
              <div class="sort-options">
                <label>Sort by:</label>
                <select id="sort-select">
                  <option value="relevance">Relevance</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="chronological">Age (Oldest first)</option>
                  <option value="reverse-chronological">Age (Newest first)</option>
                  <option value="popularity">Popularity</option>
                  <option value="significance">Historical significance</option>
                </select>
              </div>
              
              <div class="view-options">
                <button class="view-btn active" data-view="grid">⊞</button>
                <button class="view-btn" data-view="list">☰</button>
                <button class="view-btn" data-view="map">🗺</button>
              </div>
            </div>
          </div>

          <div class="search-results" id="search-results">
            <div class="no-results" id="no-results" style="display: none;">
              <h3>No castles found</h3>
              <p>Try adjusting your search terms or filters</p>
              <div class="search-suggestions-help">
                <h4>Search tips:</h4>
                <ul>
                  <li>Use broader terms (e.g., "Gothic" instead of "Gothic Revival")</li>
                  <li>Check spelling of castle names and locations</li>
                  <li>Try searching by historical period or architectural style</li>
                  <li>Use the "Smart search" mode for fuzzy matching</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="pagination" id="pagination" style="display: none;">
            <button class="page-btn" id="prev-page">« Previous</button>
            <div class="page-numbers" id="page-numbers"></div>
            <button class="page-btn" id="next-page">Next »</button>
          </div>
        </div>

        <div class="search-sidebar">
          <div class="search-history">
            <h4>Recent Searches</h4>
            <div class="history-list" id="history-list">
              <!-- Populated by JavaScript -->
            </div>
          </div>

          <div class="saved-searches">
            <h4>Saved Searches</h4>
            <div class="saved-list" id="saved-list">
              <!-- Populated by JavaScript -->
            </div>
          </div>

          <div class="search-insights">
            <h4>Search Insights</h4>
            <div class="insights-content">
              <div class="popular-searches">
                <h5>Popular this week:</h5>
                <div class="popular-tags">
                  <span class="tag">Neuschwanstein</span>
                  <span class="tag">Gothic</span>
                  <span class="tag">Medieval</span>
                  <span class="tag">Scotland</span>
                </div>
              </div>
              
              <div class="trending-topics">
                <h5>Trending topics:</h5>
                <div class="trending-list">
                  <div class="trending-item">📈 Castle legends</div>
                  <div class="trending-item">📈 Siege warfare</div>
                  <div class="trending-item">📈 Royal residences</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.populateFilterOptions();
  }

  populateFilterOptions() {
    // Populate country filter
    const countries = [...new Set(this.database.map(castle => castle.country))].sort();
    const countrySelect = document.getElementById('filter-country');
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });

    // Populate region filter based on locations
    const regions = [...new Set(this.database.map(castle => castle.location))].sort();
    const regionSelect = document.getElementById('filter-region');
    regions.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
  }

  setupEventListeners() {
    // Main search input
    const searchInput = document.getElementById('main-search');
    searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });

    // Search button
    document.getElementById('search-btn').addEventListener('click', () => {
      this.performSearch();
    });

    // Advanced filters toggle
    document.getElementById('advanced-toggle').addEventListener('click', () => {
      this.toggleAdvancedFilters();
    });

    // Filter controls
    document.getElementById('apply-filters').addEventListener('click', () => {
      this.applyFilters();
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
      this.clearFilters();
    });

    document.getElementById('save-search').addEventListener('click', () => {
      this.saveCurrentSearch();
    });

    // Sort and view controls
    document.getElementById('sort-select').addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.sortResults();
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.target.dataset.view);
      });
    });

    // Search mode radio buttons
    document.querySelectorAll('input[name="search-mode"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.performSearch();
      });
    });

    // Period sliders
    document.getElementById('period-start').addEventListener('input', (e) => {
      document.getElementById('period-start-label').textContent = e.target.value + ' CE';
    });

    document.getElementById('period-end').addEventListener('input', (e) => {
      document.getElementById('period-end-label').textContent = e.target.value + ' CE';
    });

    // Period presets
    document.querySelectorAll('.period-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setPeriodPreset(e.target.dataset.period);
      });
    });
  }

  handleSearchInput(e) {
    const query = e.target.value;
    this.currentQuery = query;
    
    if (query.length >= 2) {
      this.showSuggestions(query);
    } else {
      this.hideSuggestions();
    }
    
    // Real-time search with debouncing
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        this.performSearch();
      }
    }, 300);
  }

  showSuggestions(query) {
    const suggestions = this.generateSuggestions(query);
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (suggestions.length > 0) {
      suggestionsContainer.innerHTML = suggestions.map(suggestion => 
        `<div class="suggestion-item" data-suggestion="${suggestion.text}">
          <span class="suggestion-type">${suggestion.type}</span>
          <span class="suggestion-text">${this.highlightMatch(suggestion.text, query)}</span>
        </div>`
      ).join('');
      
      suggestionsContainer.style.display = 'block';
      
      // Add click handlers to suggestions
      suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          document.getElementById('main-search').value = item.dataset.suggestion;
          this.hideSuggestions();
          this.performSearch();
        });
      });
    } else {
      this.hideSuggestions();
    }
  }

  generateSuggestions(query) {
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Castle name suggestions
    this.database.forEach(castle => {
      if (castle.castleName.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: castle.castleName,
          type: 'Castle',
          relevance: this.calculateSuggestionRelevance(castle.castleName, query)
        });
      }
    });
    
    // Location suggestions
    const locations = [...new Set(this.database.map(c => c.location))];
    locations.forEach(location => {
      if (location.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: location,
          type: 'Location',
          relevance: this.calculateSuggestionRelevance(location, query)
        });
      }
    });
    
    // Architectural style suggestions
    const styles = [...new Set(this.database.map(c => c.architecturalStyle))];
    styles.forEach(style => {
      if (style.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: style,
          type: 'Style',
          relevance: this.calculateSuggestionRelevance(style, query)
        });
      }
    });
    
    // Historical terms from enhanced data
    this.database.forEach(castle => {
      if (castle.historicalEvents) {
        castle.historicalEvents.forEach(event => {
          if (event.toLowerCase().includes(queryLower)) {
            suggestions.push({
              text: event,
              type: 'Historical',
              relevance: this.calculateSuggestionRelevance(event, query)
            });
          }
        });
      }
    });
    
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8);
  }

  performSearch() {
    const startTime = performance.now();
    const query = this.currentQuery.trim();
    
    if (!query) {
      this.showAllCastles();
      return;
    }
    
    // Add to search history
    this.addToSearchHistory(query);
    
    // Perform the search
    this.results = this.executeSearch(query);
    
    // Apply current filters
    this.results = this.applyCurrentFilters(this.results);
    
    // Sort results
    this.sortResults();
    
    // Display results
    const searchTime = performance.now() - startTime;
    this.displayResults(searchTime);
    
    // Hide suggestions
    this.hideSuggestions();
  }

  executeSearch(query) {
    const searchMode = document.querySelector('input[name="search-mode"]:checked').value;
    const scope = this.getSearchScope();
    
    let results = [];
    
    switch (searchMode) {
      case 'all':
        results = this.searchAllWords(query, scope);
        break;
      case 'any':
        results = this.searchAnyWord(query, scope);
        break;
      case 'exact':
        results = this.searchExactPhrase(query, scope);
        break;
      case 'fuzzy':
        results = this.searchFuzzy(query, scope);
        break;
    }
    
    return results;
  }

  searchAllWords(query, scope) {
    const words = query.toLowerCase().split(/\s+/);
    const results = [];
    
    this.database.forEach((castle, index) => {
      const searchableText = this.getSearchableText(castle, scope).toLowerCase();
      const matches = words.every(word => searchableText.includes(word));
      
      if (matches) {
        results.push({
          castle,
          index,
          relevance: this.calculateSearchRelevance(castle, words, searchableText),
          matchedFields: this.getMatchedFields(castle, words, scope)
        });
      }
    });
    
    return results;
  }

  searchFuzzy(query, scope) {
    const results = [];
    const queryWords = query.toLowerCase().split(/\s+/);
    
    this.database.forEach((castle, index) => {
      const searchableText = this.getSearchableText(castle, scope).toLowerCase();
      let totalRelevance = 0;
      let matchCount = 0;
      
      queryWords.forEach(word => {
        // Direct match
        if (searchableText.includes(word)) {
          totalRelevance += 10;
          matchCount++;
        } else {
          // Fuzzy match
          const fuzzyScore = this.calculateFuzzyMatch(word, searchableText);
          if (fuzzyScore > 0.7) {
            totalRelevance += fuzzyScore * 5;
            matchCount++;
          }
        }
      });
      
      if (matchCount > 0) {
        results.push({
          castle,
          index,
          relevance: totalRelevance / queryWords.length,
          matchedFields: this.getMatchedFields(castle, queryWords, scope)
        });
      }
    });
    
    return results;
  }

  calculateFuzzyMatch(word, text) {
    // Simple fuzzy matching algorithm
    const words = text.split(/\s+/);
    let bestScore = 0;
    
    words.forEach(textWord => {
      const score = this.levenshteinSimilarity(word, textWord);
      bestScore = Math.max(bestScore, score);
    });
    
    return bestScore;
  }

  levenshteinSimilarity(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    return 1 - (distance / maxLength);
  }

  getSearchableText(castle, scope) {
    let text = '';
    
    if (scope.name) text += castle.castleName + ' ';
    if (scope.description) text += castle.shortDescription + ' ';
    if (scope.history && castle.historicalEvents) {
      text += castle.historicalEvents.join(' ') + ' ';
    }
    if (scope.legends && castle.legends) {
      text += castle.legends.join(' ') + ' ';
    }
    if (scope.cultural && castle.culturalSignificance) {
      text += castle.culturalSignificance + ' ';
    }
    
    text += castle.country + ' ' + castle.location + ' ' + castle.architecturalStyle + ' ';
    
    if (castle.keyFeatures) {
      text += castle.keyFeatures.join(' ') + ' ';
    }
    
    return text;
  }

  getSearchScope() {
    return {
      name: document.getElementById('scope-name').checked,
      description: document.getElementById('scope-description').checked,
      history: document.getElementById('scope-history').checked,
      legends: document.getElementById('scope-legends').checked,
      cultural: document.getElementById('scope-cultural').checked
    };
  }

  displayResults(searchTime) {
    const resultsContainer = document.getElementById('search-results');
    const resultsCount = document.getElementById('results-count');
    const searchTimeElement = document.getElementById('search-time');
    const noResults = document.getElementById('no-results');
    
    resultsCount.textContent = `${this.results.length} result${this.results.length !== 1 ? 's' : ''}`;
    searchTimeElement.textContent = `${Math.round(searchTime)}ms`;
    
    if (this.results.length === 0) {
      resultsContainer.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }
    
    noResults.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    const currentView = document.querySelector('.view-btn.active').dataset.view;
    
    switch (currentView) {
      case 'grid':
        this.displayGridResults();
        break;
      case 'list':
        this.displayListResults();
        break;
      case 'map':
        this.displayMapResults();
        break;
    }
  }

  displayGridResults() {
    const resultsContainer = document.getElementById('search-results');
    
    resultsContainer.innerHTML = `
      <div class="results-grid">
        ${this.results.map(result => this.createGridResultCard(result)).join('')}
      </div>
    `;
  }

  createGridResultCard(result) {
    const castle = result.castle;
    const relevanceScore = Math.round(result.relevance * 100);
    
    return `
      <div class="result-card grid-card" data-castle-id="${castle.id}">
        <div class="card-image">
          <img src="images/${castle.id}/thumbnail.jpg" alt="${castle.castleName}" 
               onerror="this.src='images/placeholder-castle.jpg'">
          <div class="relevance-badge">${relevanceScore}%</div>
        </div>
        
        <div class="card-content">
          <h3 class="castle-name">${this.highlightSearchTerms(castle.castleName)}</h3>
          <div class="castle-location">${castle.location}, ${castle.country}</div>
          <div class="castle-period">${castle.yearBuilt} • ${castle.architecturalStyle}</div>
          
          <p class="castle-description">
            ${this.highlightSearchTerms(this.truncateText(castle.shortDescription, 120))}
          </p>
          
          <div class="castle-features">
            ${castle.keyFeatures ? castle.keyFeatures.slice(0, 3).map(feature => 
              `<span class="feature-tag">${this.highlightSearchTerms(feature)}</span>`
            ).join('') : ''}
          </div>
          
          <div class="card-actions">
            <button class="action-btn primary" onclick="this.viewCastle('${castle.id}')">
              View Details
            </button>
            <button class="action-btn" onclick="this.compareCastle('${castle.id}')">
              Compare
            </button>
            <button class="action-btn" onclick="this.startTour('${castle.id}')">
              Virtual Tour
            </button>
          </div>
          
          ${result.matchedFields.length > 0 ? `
            <div class="matched-fields">
              <small>Matched in: ${result.matchedFields.join(', ')}</small>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Additional styling for the search system
  injectStyles() {
    const styles = `
      .advanced-search-container {
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f8f9fa;
        min-height: 100vh;
      }
      
      .search-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid #3498db;
      }
      
      .search-header h2 {
        color: #2c3e50;
        margin: 0;
        font-size: 28px;
      }
      
      .search-stats {
        color: #7f8c8d;
        font-size: 14px;
      }
      
      .search-main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .search-input-container {
        position: relative;
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      #main-search {
        flex: 1;
        padding: 15px 20px;
        border: 2px solid #bdc3c7;
        border-radius: 8px;
        font-size: 16px;
        outline: none;
        transition: border-color 0.3s ease;
      }
      
      #main-search:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }
      
      .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 80px;
        background: white;
        border: 1px solid #bdc3c7;
        border-top: none;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 100;
        max-height: 300px;
        overflow-y: auto;
        display: none;
      }
      
      .suggestion-item {
        padding: 12px 15px;
        cursor: pointer;
        border-bottom: 1px solid #ecf0f1;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .suggestion-item:hover {
        background: #f8f9fa;
      }
      
      .suggestion-type {
        background: #3498db;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        text-transform: uppercase;
        font-weight: bold;
      }
      
      .search-btn, .advanced-toggle {
        padding: 15px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
      }
      
      .search-btn {
        background: #3498db;
        color: white;
      }
      
      .search-btn:hover {
        background: #2980b9;
        transform: translateY(-2px);
      }
      
      .advanced-toggle {
        background: #95a5a6;
        color: white;
      }
      
      .advanced-toggle:hover {
        background: #7f8c8d;
      }
      
      .search-options {
        display: flex;
        gap: 30px;
        align-items: center;
        flex-wrap: wrap;
      }
      
      .search-mode, .search-scope {
        display: flex;
        gap: 15px;
        align-items: center;
      }
      
      .search-mode label, .search-scope label {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .advanced-filters {
        background: white;
        border: 1px solid #bdc3c7;
        border-radius: 8px;
        padding: 25px;
        margin-top: 20px;
      }
      
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 25px;
        margin-bottom: 25px;
      }
      
      .filter-group h4 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-size: 16px;
        border-bottom: 1px solid #ecf0f1;
        padding-bottom: 8px;
      }
      
      .filter-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .filter-content select {
        padding: 8px 12px;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .filter-content label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .period-slider {
        position: relative;
        margin: 15px 0;
      }
      
      .period-slider input[type="range"] {
        width: 100%;
        margin: 10px 0;
      }
      
      .period-labels {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #7f8c8d;
      }
      
      .period-presets {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .period-preset {
        padding: 4px 12px;
        background: #ecf0f1;
        border: 1px solid #bdc3c7;
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
      }
      
      .period-preset:hover {
        background: #3498db;
        color: white;
      }
      
      .filter-actions {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
        padding-top: 20px;
        border-top: 1px solid #ecf0f1;
      }
      
      .filter-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      }
      
      .filter-btn.clear {
        background: #e74c3c;
        color: white;
      }
      
      .filter-btn.save {
        background: #f39c12;
        color: white;
      }
      
      .filter-btn.apply {
        background: #27ae60;
        color: white;
      }
      
      .filter-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .search-results-section {
        background: white;
        border-radius: 8px;
        padding: 25px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 1px solid #ecf0f1;
      }
      
      .results-info {
        display: flex;
        gap: 20px;
        align-items: center;
      }
      
      #results-count {
        font-weight: bold;
        color: #2c3e50;
        font-size: 16px;
      }
      
      #search-time {
        color: #7f8c8d;
        font-size: 14px;
      }
      
      .results-controls {
        display: flex;
        gap: 20px;
        align-items: center;
      }
      
      .sort-options {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .sort-options select {
        padding: 6px 12px;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
      }
      
      .view-options {
        display: flex;
        gap: 5px;
      }
      
      .view-btn {
        padding: 8px 12px;
        border: 1px solid #bdc3c7;
        background: white;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
      }
      
      .view-btn.active {
        background: #3498db;
        color: white;
        border-color: #3498db;
      }
      
      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 25px;
      }
      
      .result-card {
        background: white;
        border: 1px solid #ecf0f1;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .result-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
      }
      
      .card-image {
        position: relative;
        height: 200px;
        overflow: hidden;
      }
      
      .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      
      .result-card:hover .card-image img {
        transform: scale(1.05);
      }
      
      .relevance-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(52, 152, 219, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .card-content {
        padding: 20px;
      }
      
      .castle-name {
        color: #2c3e50;
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: bold;
      }
      
      .castle-location {
        color: #7f8c8d;
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .castle-period {
        color: #95a5a6;
        font-size: 13px;
        margin-bottom: 15px;
      }
      
      .castle-description {
        color: #34495e;
        line-height: 1.6;
        margin-bottom: 15px;
        font-size: 14px;
      }
      
      .castle-features {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 20px;
      }
      
      .feature-tag {
        background: #ecf0f1;
        color: #2c3e50;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }
      
      .card-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
      }
      
      .action-btn {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
        background: white;
      }
      
      .action-btn.primary {
        background: #3498db;
        color: white;
        border-color: #3498db;
      }
      
      .action-btn:hover {
        transform: translateY(-1px);
      }
      
      .matched-fields {
        padding-top: 10px;
        border-top: 1px solid #ecf0f1;
      }
      
      .matched-fields small {
        color: #7f8c8d;
        font-style: italic;
      }
      
      .no-results {
        text-align: center;
        padding: 60px 20px;
        color: #7f8c8d;
      }
      
      .no-results h3 {
        color: #2c3e50;
        margin-bottom: 15px;
      }
      
      .search-suggestions-help {
        margin-top: 30px;
        text-align: left;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .search-suggestions-help ul {
        list-style-type: none;
        padding: 0;
      }
      
      .search-suggestions-help li {
        padding: 5px 0;
        color: #34495e;
      }
      
      .search-suggestions-help li:before {
        content: "💡 ";
        margin-right: 8px;
      }
      
      @media (max-width: 768px) {
        .advanced-search-container {
          padding: 15px;
        }
        
        .search-header {
          flex-direction: column;
          gap: 10px;
          text-align: center;
        }
        
        .search-input-container {
          flex-direction: column;
        }
        
        .search-options {
          flex-direction: column;
          gap: 15px;
          align-items: flex-start;
        }
        
        .filters-grid {
          grid-template-columns: 1fr;
        }
        
        .results-header {
          flex-direction: column;
          gap: 15px;
          align-items: flex-start;
        }
        
        .results-controls {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
        }
        
        .results-grid {
          grid-template-columns: 1fr;
        }
        
        .card-actions {
          flex-direction: column;
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
  const search = new AdvancedSearchSystem();
  search.injectStyles();
}

module.exports = AdvancedSearchSystem;