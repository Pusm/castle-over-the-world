// Interactive Timeline System for Castle History
// Provides immersive historical visualization exceeding Wikipedia standards

class InteractiveTimeline {
  constructor(containerId, castleData) {
    this.container = document.getElementById(containerId);
    this.castleData = castleData;
    this.timeline = castleData.timeline || [];
    this.currentView = 'overview';
    this.selectedPeriod = null;
    this.zoomLevel = 1;
    
    this.init();
  }

  init() {
    this.createTimelineStructure();
    this.createTimelineControls();
    this.createEventDetails();
    this.bindEvents();
    this.render();
  }

  createTimelineStructure() {
    this.container.innerHTML = `
      <div class="timeline-container">
        <div class="timeline-header">
          <h2>Interactive Historical Timeline</h2>
          <div class="timeline-controls">
            <button class="timeline-btn" data-view="overview">Overview</button>
            <button class="timeline-btn" data-view="detailed">Detailed</button>
            <button class="timeline-btn" data-view="comparative">Comparative</button>
            <div class="timeline-zoom">
              <button class="zoom-btn" data-action="zoom-in">+</button>
              <button class="zoom-btn" data-action="zoom-out">-</button>
            </div>
          </div>
        </div>
        
        <div class="timeline-main">
          <div class="timeline-axis">
            <div class="timeline-track"></div>
            <div class="timeline-markers"></div>
          </div>
          
          <div class="timeline-events">
            <div class="timeline-periods"></div>
            <div class="timeline-points"></div>
          </div>
          
          <div class="timeline-scale">
            <div class="scale-labels"></div>
          </div>
        </div>
        
        <div class="timeline-sidebar">
          <div class="event-details">
            <h3>Select an event to view details</h3>
            <div class="event-content"></div>
          </div>
          
          <div class="timeline-filters">
            <h4>Filter Events</h4>
            <div class="filter-group">
              <label><input type="checkbox" value="construction" checked> Construction</label>
              <label><input type="checkbox" value="battle" checked> Battles</label>
              <label><input type="checkbox" value="renovation" checked> Renovations</label>
              <label><input type="checkbox" value="ownership" checked> Ownership Changes</label>
            </div>
          </div>
          
          <div class="timeline-legend">
            <h4>Legend</h4>
            <div class="legend-items">
              <div class="legend-item">
                <span class="legend-color construction"></span>
                <span>Construction Events</span>
              </div>
              <div class="legend-item">
                <span class="legend-color battle"></span>
                <span>Military Events</span>
              </div>
              <div class="legend-item">
                <span class="legend-color renovation"></span>
                <span>Renovations</span>
              </div>
              <div class="legend-item">
                <span class="legend-color ownership"></span>
                <span>Ownership Changes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="timeline-modal" id="event-modal" style="display: none;">
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <div class="modal-body"></div>
        </div>
      </div>
    `;
  }

  createTimelineControls() {
    // Add advanced controls for different timeline views
    const controls = this.container.querySelector('.timeline-controls');
    
    // Period selector
    const periodSelector = document.createElement('select');
    periodSelector.className = 'period-selector';
    periodSelector.innerHTML = `
      <option value="all">All Periods</option>
      <option value="medieval">Medieval (500-1500)</option>
      <option value="renaissance">Renaissance (1500-1700)</option>
      <option value="modern">Modern (1700+)</option>
    `;
    controls.appendChild(periodSelector);

    // Animation controls
    const animationControls = document.createElement('div');
    animationControls.className = 'animation-controls';
    animationControls.innerHTML = `
      <button class="anim-btn" data-action="play">▶ Play Animation</button>
      <button class="anim-btn" data-action="pause">⏸ Pause</button>
      <button class="anim-btn" data-action="reset">⏹ Reset</button>
    `;
    controls.appendChild(animationControls);
  }

  createEventDetails() {
    // Enhanced event detail structure
    const sidebar = this.container.querySelector('.timeline-sidebar');
    
    const enhancedDetails = document.createElement('div');
    enhancedDetails.className = 'enhanced-event-details';
    enhancedDetails.innerHTML = `
      <div class="event-multimedia">
        <div class="event-images"></div>
        <div class="event-audio-controls"></div>
      </div>
      
      <div class="event-context">
        <div class="historical-context">
          <h5>Historical Context</h5>
          <div class="context-content"></div>
        </div>
        
        <div class="related-events">
          <h5>Related Events</h5>
          <div class="related-content"></div>
        </div>
        
        <div class="event-sources">
          <h5>Sources & References</h5>
          <div class="sources-content"></div>
        </div>
      </div>
      
      <div class="event-interactive">
        <button class="interactive-btn" data-action="compare">Compare with Similar Events</button>
        <button class="interactive-btn" data-action="explore">Explore in 3D</button>
        <button class="interactive-btn" data-action="virtual-tour">Virtual Tour of Period</button>
      </div>
    `;
    
    sidebar.appendChild(enhancedDetails);
  }

  bindEvents() {
    // View switching
    this.container.addEventListener('click', (e) => {
      if (e.target.matches('.timeline-btn')) {
        this.currentView = e.target.dataset.view;
        this.updateActiveButton(e.target);
        this.render();
      }
      
      if (e.target.matches('.zoom-btn')) {
        this.handleZoom(e.target.dataset.action);
      }
      
      if (e.target.matches('.anim-btn')) {
        this.handleAnimation(e.target.dataset.action);
      }
      
      if (e.target.matches('.interactive-btn')) {
        this.handleInteractiveAction(e.target.dataset.action);
      }
      
      if (e.target.matches('.timeline-point')) {
        this.selectEvent(e.target.dataset.eventId);
      }
      
      if (e.target.matches('.modal-close')) {
        this.closeModal();
      }
    });

    // Filter events
    this.container.addEventListener('change', (e) => {
      if (e.target.matches('.filter-group input')) {
        this.applyFilters();
      }
      
      if (e.target.matches('.period-selector')) {
        this.selectedPeriod = e.target.value;
        this.render();
      }
    });

    // Drag and zoom on timeline
    this.setupTimelineInteraction();
  }

  setupTimelineInteraction() {
    const timelineMain = this.container.querySelector('.timeline-main');
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    timelineMain.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - timelineMain.offsetLeft;
      scrollLeft = timelineMain.scrollLeft;
      timelineMain.style.cursor = 'grabbing';
    });

    timelineMain.addEventListener('mouseleave', () => {
      isDragging = false;
      timelineMain.style.cursor = 'grab';
    });

    timelineMain.addEventListener('mouseup', () => {
      isDragging = false;
      timelineMain.style.cursor = 'grab';
    });

    timelineMain.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - timelineMain.offsetLeft;
      const walk = (x - startX) * 2;
      timelineMain.scrollLeft = scrollLeft - walk;
    });

    // Wheel zoom
    timelineMain.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.handleZoom('zoom-in');
      } else {
        this.handleZoom('zoom-out');
      }
    });
  }

  render() {
    this.clearTimeline();
    
    switch (this.currentView) {
      case 'overview':
        this.renderOverviewTimeline();
        break;
      case 'detailed':
        this.renderDetailedTimeline();
        break;
      case 'comparative':
        this.renderComparativeTimeline();
        break;
    }
    
    this.updateScale();
    this.applyFilters();
  }

  renderOverviewTimeline() {
    const track = this.container.querySelector('.timeline-track');
    const points = this.container.querySelector('.timeline-points');
    const periods = this.container.querySelector('.timeline-periods');
    
    // Create major period blocks
    const timelineSpan = this.getTimelineSpan();
    const periodBlocks = this.createPeriodBlocks(timelineSpan);
    
    periodBlocks.forEach(period => {
      const periodElement = document.createElement('div');
      periodElement.className = `period-block ${period.type}`;
      periodElement.style.left = `${period.position}%`;
      periodElement.style.width = `${period.width}%`;
      periodElement.innerHTML = `
        <div class="period-label">${period.name}</div>
        <div class="period-description">${period.description}</div>
      `;
      periods.appendChild(periodElement);
    });
    
    // Create event points
    this.timeline.forEach((event, index) => {
      const position = this.calculateEventPosition(event.year, timelineSpan);
      const eventPoint = this.createEventPoint(event, position, index);
      points.appendChild(eventPoint);
    });
  }

  renderDetailedTimeline() {
    const points = this.container.querySelector('.timeline-points');
    const timelineSpan = this.getTimelineSpan();
    
    this.timeline.forEach((event, index) => {
      const position = this.calculateEventPosition(event.year, timelineSpan);
      const detailedPoint = this.createDetailedEventPoint(event, position, index);
      points.appendChild(detailedPoint);
    });
    
    // Add connecting lines between related events
    this.createEventConnections();
  }

  renderComparativeTimeline() {
    // Show this castle's timeline compared to major historical events
    const points = this.container.querySelector('.timeline-points');
    const timelineSpan = this.getTimelineSpan();
    
    // Add major historical context events
    const contextEvents = this.getHistoricalContext(timelineSpan);
    
    contextEvents.forEach((event, index) => {
      const position = this.calculateEventPosition(event.year, timelineSpan);
      const contextPoint = this.createContextEventPoint(event, position, index);
      points.appendChild(contextPoint);
    });
    
    // Add castle events with emphasis
    this.timeline.forEach((event, index) => {
      const position = this.calculateEventPosition(event.year, timelineSpan);
      const castlePoint = this.createCastleEventPoint(event, position, index);
      points.appendChild(castlePoint);
    });
  }

  createEventPoint(event, position, index) {
    const point = document.createElement('div');
    point.className = `timeline-point ${event.type}`;
    point.dataset.eventId = index;
    point.style.left = `${position}%`;
    
    point.innerHTML = `
      <div class="point-marker"></div>
      <div class="point-label">
        <div class="point-year">${event.year}</div>
        <div class="point-title">${event.event}</div>
      </div>
      <div class="point-preview">
        <p>${event.description}</p>
        <div class="point-significance">${event.significance}</div>
      </div>
    `;
    
    return point;
  }

  createDetailedEventPoint(event, position, index) {
    const point = this.createEventPoint(event, position, index);
    point.classList.add('detailed');
    
    // Add additional detail elements
    const details = document.createElement('div');
    details.className = 'point-details';
    details.innerHTML = `
      <div class="detail-sources">
        <strong>Sources:</strong> ${event.sources?.join(', ') || 'Various historical records'}
      </div>
      <div class="detail-duration">
        <strong>Duration:</strong> ${this.calculateEventDuration(event)}
      </div>
      <div class="detail-impact">
        <strong>Impact:</strong> ${this.assessEventImpact(event)}
      </div>
    `;
    
    point.appendChild(details);
    return point;
  }

  selectEvent(eventId) {
    const event = this.timeline[eventId];
    if (!event) return;
    
    // Highlight selected event
    this.container.querySelectorAll('.timeline-point').forEach(point => {
      point.classList.remove('selected');
    });
    
    this.container.querySelector(`[data-event-id="${eventId}"]`).classList.add('selected');
    
    // Update sidebar with event details
    this.updateEventDetails(event);
    
    // Create immersive modal for major events
    if (event.type === 'battle' || event.significance.includes('major')) {
      this.showEventModal(event);
    }
  }

  updateEventDetails(event) {
    const detailsContainer = this.container.querySelector('.event-content');
    
    detailsContainer.innerHTML = `
      <div class="event-header">
        <h3>${event.event}</h3>
        <div class="event-date">${event.year}</div>
        <div class="event-type ${event.type}">${event.type.toUpperCase()}</div>
      </div>
      
      <div class="event-description">
        <p>${event.description}</p>
      </div>
      
      <div class="event-significance">
        <h4>Historical Significance</h4>
        <p>${event.significance}</p>
      </div>
      
      <div class="event-sources">
        <h4>Sources</h4>
        <ul>${event.sources?.map(source => `<li>${source}</li>`).join('') || '<li>Historical records</li>'}</ul>
      </div>
      
      <div class="event-multimedia">
        ${this.generateEventMultimedia(event)}
      </div>
      
      <div class="event-actions">
        <button class="action-btn" onclick="this.exploreEvent('${event.event}')">
          🔍 Deep Dive Research
        </button>
        <button class="action-btn" onclick="this.compareEvent('${event.event}')">
          ⚖️ Compare Similar Events
        </button>
        <button class="action-btn" onclick="this.visualizeEvent('${event.event}')">
          🎬 Visualize Event
        </button>
      </div>
    `;
  }

  generateEventMultimedia(event) {
    // Generate appropriate multimedia based on event type
    const multimedia = [];
    
    if (event.type === 'construction') {
      multimedia.push(`
        <div class="multimedia-item">
          <img src="images/construction/${event.event.toLowerCase().replace(/\s+/g, '_')}.jpg" 
               alt="Construction phase illustration" class="event-image">
          <p>Artist's reconstruction of construction phase</p>
        </div>
      `);
    }
    
    if (event.type === 'battle') {
      multimedia.push(`
        <div class="multimedia-item">
          <div class="battle-map" data-battle="${event.event}">
            <canvas id="battle-visualization"></canvas>
          </div>
          <p>Interactive battle visualization</p>
        </div>
      `);
    }
    
    return multimedia.join('');
  }

  handleZoom(action) {
    if (action === 'zoom-in' && this.zoomLevel < 5) {
      this.zoomLevel *= 1.5;
    } else if (action === 'zoom-out' && this.zoomLevel > 0.5) {
      this.zoomLevel /= 1.5;
    }
    
    this.updateTimelineScale();
  }

  handleAnimation(action) {
    switch (action) {
      case 'play':
        this.startTimelineAnimation();
        break;
      case 'pause':
        this.pauseTimelineAnimation();
        break;
      case 'reset':
        this.resetTimelineAnimation();
        break;
    }
  }

  startTimelineAnimation() {
    // Animate through timeline events chronologically
    let currentIndex = 0;
    const animationSpeed = 2000; // 2 seconds per event
    
    const animateEvent = () => {
      if (currentIndex < this.timeline.length) {
        this.selectEvent(currentIndex);
        this.scrollToEvent(currentIndex);
        currentIndex++;
        setTimeout(animateEvent, animationSpeed);
      }
    };
    
    animateEvent();
  }

  // Additional utility methods
  getTimelineSpan() {
    const years = this.timeline.map(event => parseInt(event.year)).filter(year => !isNaN(year));
    return {
      start: Math.min(...years) - 10,
      end: Math.max(...years) + 10
    };
  }

  calculateEventPosition(year, timelineSpan) {
    const yearNum = parseInt(year);
    const totalSpan = timelineSpan.end - timelineSpan.start;
    return ((yearNum - timelineSpan.start) / totalSpan) * 100;
  }

  getHistoricalContext(timelineSpan) {
    // Return major historical events for comparative timeline
    return [
      { year: "1066", event: "Battle of Hastings", type: "battle", description: "Norman conquest of England" },
      { year: "1215", event: "Magna Carta", type: "political", description: "Foundation of constitutional law" },
      { year: "1347", event: "Black Death", type: "pandemic", description: "Plague devastates Europe" },
      { year: "1453", event: "Fall of Constantinople", type: "conquest", description: "End of Byzantine Empire" }
    ].filter(event => {
      const eventYear = parseInt(event.year);
      return eventYear >= timelineSpan.start && eventYear <= timelineSpan.end;
    });
  }

  // CSS for timeline styling
  injectStyles() {
    const styles = `
      .timeline-container {
        display: flex;
        flex-direction: column;
        height: 600px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      }
      
      .timeline-header {
        background: #2c3e50;
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .timeline-controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .timeline-btn, .zoom-btn, .anim-btn {
        background: #34495e;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .timeline-btn:hover, .zoom-btn:hover, .anim-btn:hover {
        background: #4a6741;
        transform: translateY(-2px);
      }
      
      .timeline-btn.active {
        background: #e74c3c;
      }
      
      .timeline-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow-x: auto;
        cursor: grab;
      }
      
      .timeline-track {
        height: 4px;
        background: linear-gradient(to right, #3498db, #e74c3c);
        margin: 50px 20px;
        position: relative;
        border-radius: 2px;
      }
      
      .timeline-points {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      
      .timeline-point {
        position: absolute;
        top: 30px;
        transform: translateX(-50%);
        cursor: pointer;
        z-index: 10;
      }
      
      .point-marker {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #3498db;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      }
      
      .timeline-point:hover .point-marker {
        transform: scale(1.5);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      
      .timeline-point.construction .point-marker { background: #f39c12; }
      .timeline-point.battle .point-marker { background: #e74c3c; }
      .timeline-point.renovation .point-marker { background: #2ecc71; }
      .timeline-point.ownership .point-marker { background: #9b59b6; }
      
      .point-label {
        position: absolute;
        top: 25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255,255,255,0.95);
        padding: 8px 12px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 120px;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .timeline-point:hover .point-label,
      .timeline-point.selected .point-label {
        opacity: 1;
      }
      
      .point-year {
        font-weight: bold;
        color: #2c3e50;
        font-size: 14px;
      }
      
      .point-title {
        font-size: 12px;
        color: #7f8c8d;
        margin-top: 2px;
      }
      
      .timeline-sidebar {
        width: 300px;
        background: white;
        border-left: 1px solid #ecf0f1;
        padding: 20px;
        overflow-y: auto;
      }
      
      .event-details h3 {
        color: #2c3e50;
        margin-bottom: 15px;
        border-bottom: 2px solid #3498db;
        padding-bottom: 5px;
      }
      
      .timeline-filters {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #ecf0f1;
      }
      
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
      }
      
      .filter-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      
      .timeline-legend {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #ecf0f1;
      }
      
      .legend-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      
      .legend-color.construction { background: #f39c12; }
      .legend-color.battle { background: #e74c3c; }
      .legend-color.renovation { background: #2ecc71; }
      .legend-color.ownership { background: #9b59b6; }
      
      .timeline-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .modal-content {
        background: white;
        border-radius: 10px;
        padding: 30px;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
        position: relative;
      }
      
      .modal-close {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 28px;
        cursor: pointer;
        color: #aaa;
      }
      
      .modal-close:hover {
        color: #333;
      }
      
      @media (max-width: 768px) {
        .timeline-container {
          flex-direction: column;
        }
        
        .timeline-sidebar {
          width: 100%;
          border-left: none;
          border-top: 1px solid #ecf0f1;
        }
        
        .timeline-controls {
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .timeline-btn, .zoom-btn, .anim-btn {
          padding: 6px 10px;
          font-size: 12px;
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
  const timeline = new InteractiveTimeline();
  timeline.injectStyles();
}

module.exports = InteractiveTimeline;