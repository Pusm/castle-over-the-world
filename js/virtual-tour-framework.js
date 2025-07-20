// Virtual Tour Framework for Immersive Castle Exploration
// Provides 3D virtual tours exceeding Wikipedia standards

class VirtualTourFramework {
  constructor(containerId, castleData) {
    this.container = document.getElementById(containerId);
    this.castleData = castleData;
    this.currentRoom = 'entrance';
    this.tourMode = 'guided'; // guided, free, expert
    this.isVRMode = false;
    this.tourProgress = 0;
    this.audioEnabled = true;
    this.annotations = [];
    
    this.init();
  }

  init() {
    this.detectCapabilities();
    this.createTourInterface();
    this.initializeViewer();
    this.setupControls();
    this.loadTourData();
  }

  detectCapabilities() {
    this.capabilities = {
      webXR: navigator.xr !== undefined,
      webGL: this.checkWebGLSupport(),
      webAudio: window.AudioContext !== undefined,
      fullscreen: document.fullscreenEnabled,
      deviceOrientation: window.DeviceOrientationEvent !== undefined,
      touch: 'ontouchstart' in window
    };
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  createTourInterface() {
    this.container.innerHTML = `
      <div class="virtual-tour-container">
        <div class="tour-header">
          <h2>Virtual Castle Tour</h2>
          <div class="tour-info">
            <span class="castle-name">${this.castleData.castleName}</span>
            <span class="current-location" id="current-location">Entrance</span>
          </div>
          <div class="tour-controls">
            <button class="tour-btn" id="tour-mode-btn" title="Switch Tour Mode">
              <span class="mode-icon">🎓</span>
              <span class="mode-text">Guided</span>
            </button>
            <button class="tour-btn" id="vr-btn" title="VR Mode" ${!this.capabilities.webXR ? 'disabled' : ''}>
              <span class="vr-icon">🥽</span>
            </button>
            <button class="tour-btn" id="fullscreen-btn" title="Fullscreen">
              <span class="fullscreen-icon">⛶</span>
            </button>
            <button class="tour-btn" id="audio-btn" title="Toggle Audio">
              <span class="audio-icon">🔊</span>
            </button>
          </div>
        </div>

        <div class="tour-main">
          <div class="tour-viewer" id="tour-viewer">
            <div class="viewer-canvas" id="viewer-canvas">
              <div class="panorama-container" id="panorama-container">
                <!-- 360° panoramic view will be loaded here -->
              </div>
              
              <div class="hotspots-container" id="hotspots-container">
                <!-- Interactive hotspots for navigation and information -->
              </div>
              
              <div class="annotations-overlay" id="annotations-overlay">
                <!-- Contextual annotations and information -->
              </div>
              
              <div class="navigation-compass" id="navigation-compass">
                <div class="compass-needle"></div>
                <div class="compass-directions">
                  <span class="compass-n">N</span>
                  <span class="compass-e">E</span>
                  <span class="compass-s">S</span>
                  <span class="compass-w">W</span>
                </div>
              </div>
            </div>

            <div class="tour-overlay">
              <div class="room-navigation" id="room-navigation">
                <div class="nav-buttons">
                  <button class="nav-btn" id="nav-up" title="Look Up">↑</button>
                  <button class="nav-btn" id="nav-down" title="Look Down">↓</button>
                  <button class="nav-btn" id="nav-left" title="Turn Left">←</button>
                  <button class="nav-btn" id="nav-right" title="Turn Right">→</button>
                </div>
                <button class="nav-btn center" id="nav-center" title="Center View">⊙</button>
              </div>

              <div class="tour-minimap" id="tour-minimap">
                <div class="minimap-container">
                  <svg class="castle-layout" id="castle-layout">
                    <!-- Castle floor plan will be generated here -->
                  </svg>
                  <div class="player-position" id="player-position"></div>
                </div>
              </div>

              <div class="tour-progress" id="tour-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <span class="progress-text">0% Complete</span>
              </div>
            </div>
          </div>

          <div class="tour-sidebar" id="tour-sidebar">
            <div class="room-info" id="room-info">
              <h3 class="room-title">Castle Entrance</h3>
              <div class="room-description">
                <p>Welcome to the grand entrance of the castle. Notice the impressive stonework and defensive features.</p>
              </div>
              
              <div class="room-details">
                <div class="detail-item">
                  <span class="detail-label">Period:</span>
                  <span class="detail-value">Medieval (12th Century)</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Architecture:</span>
                  <span class="detail-value">Gothic Revival</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Materials:</span>
                  <span class="detail-value">Limestone, Oak</span>
                </div>
              </div>

              <div class="interactive-elements" id="interactive-elements">
                <h4>Explore Interactive Elements</h4>
                <div class="element-list">
                  <!-- Dynamic content based on current room -->
                </div>
              </div>
            </div>

            <div class="tour-playlist" id="tour-playlist">
              <h4>Tour Rooms</h4>
              <div class="room-list">
                <div class="room-item active" data-room="entrance">
                  <div class="room-thumbnail"></div>
                  <div class="room-info">
                    <h5>Entrance Hall</h5>
                    <span class="room-status">Current</span>
                  </div>
                </div>
                <div class="room-item" data-room="great_hall">
                  <div class="room-thumbnail"></div>
                  <div class="room-info">
                    <h5>Great Hall</h5>
                    <span class="room-duration">5 min</span>
                  </div>
                </div>
                <div class="room-item" data-room="tower">
                  <div class="room-thumbnail"></div>
                  <div class="room-info">
                    <h5>Tower</h5>
                    <span class="room-duration">3 min</span>
                  </div>
                </div>
                <div class="room-item" data-room="courtyard">
                  <div class="room-thumbnail"></div>
                  <div class="room-info">
                    <h5>Courtyard</h5>
                    <span class="room-duration">4 min</span>
                  </div>
                </div>
                <div class="room-item" data-room="chapel">
                  <div class="room-thumbnail"></div>
                  <div class="room-info">
                    <h5>Chapel</h5>
                    <span class="room-duration">6 min</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="tour-settings" id="tour-settings">
              <h4>Tour Settings</h4>
              <div class="setting-group">
                <label>
                  <input type="range" id="tour-speed" min="0.5" max="2" step="0.1" value="1">
                  <span>Narration Speed</span>
                </label>
              </div>
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="auto-advance" checked>
                  <span>Auto-advance rooms</span>
                </label>
              </div>
              <div class="setting-group">
                <label>
                  <input type="checkbox" id="show-annotations" checked>
                  <span>Show annotations</span>
                </label>
              </div>
              <div class="setting-group">
                <label>
                  <input type="range" id="mouse-sensitivity" min="0.1" max="2" step="0.1" value="1">
                  <span>Mouse sensitivity</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="tour-controls-bottom">
          <button class="control-btn" id="prev-room" title="Previous Room">⏮</button>
          <button class="control-btn primary" id="play-pause" title="Play/Pause Tour">▶</button>
          <button class="control-btn" id="next-room" title="Next Room">⏭</button>
          
          <div class="tour-timeline">
            <input type="range" id="tour-scrubber" min="0" max="100" value="0">
          </div>
          
          <button class="control-btn" id="screenshot" title="Take Screenshot">📷</button>
          <button class="control-btn" id="share" title="Share Tour">🔗</button>
          <button class="control-btn" id="info" title="Tour Information">ℹ</button>
        </div>
      </div>

      <div class="tour-modal" id="tour-modal" style="display: none;">
        <div class="modal-content">
          <span class="modal-close" id="modal-close">&times;</span>
          <div class="modal-body" id="modal-body">
            <!-- Dynamic modal content -->
          </div>
        </div>
      </div>

      <div class="ar-mode" id="ar-mode" style="display: none;">
        <div class="ar-interface">
          <div class="ar-overlay">
            <div class="ar-info-panel">
              <h3>AR Castle Explorer</h3>
              <p>Point your device at the castle to see additional information</p>
            </div>
          </div>
          <button class="ar-exit" id="ar-exit">Exit AR</button>
        </div>
      </div>
    `;
  }

  initializeViewer() {
    this.panoramaContainer = document.getElementById('panorama-container');
    this.hotspotsContainer = document.getElementById('hotspots-container');
    this.annotationsOverlay = document.getElementById('annotations-overlay');
    
    // Initialize 360° panorama viewer
    this.initPanoramaViewer();
    
    // Load initial room
    this.loadRoom(this.currentRoom);
  }

  initPanoramaViewer() {
    // Create WebGL context for 3D rendering
    if (this.capabilities.webGL) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.panoramaContainer.clientWidth;
      this.canvas.height = this.panoramaContainer.clientHeight;
      this.panoramaContainer.appendChild(this.canvas);
      
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      this.setupWebGLScene();
    } else {
      // Fallback to CSS 3D transforms
      this.setupCSSPanorama();
    }
  }

  setupWebGLScene() {
    // Initialize Three.js-like scene for 360° rendering
    this.scene = {
      camera: {
        fov: 75,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      sphere: null,
      texture: null
    };
    
    this.setupShaders();
    this.createSphericalGeometry();
    this.setupControls();
  }

  setupShaders() {
    const vertexShaderSource = `
      attribute vec3 position;
      attribute vec2 uv;
      uniform mat4 projectionMatrix;
      uniform mat4 modelViewMatrix;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D panoramaTexture;
      varying vec2 vUv;
      
      void main() {
        gl_FragColor = texture2D(panoramaTexture, vUv);
      }
    `;
    
    this.shaderProgram = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
  }

  createShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Shader program linking failed');
      return null;
    }
    
    return program;
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  setupControls() {
    this.mouseState = {
      isDown: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    };
    
    // Mouse controls
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
    
    // Touch controls for mobile
    if (this.capabilities.touch) {
      this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
      this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
      this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    // Device orientation for mobile VR
    if (this.capabilities.deviceOrientation) {
      window.addEventListener('deviceorientation', (e) => this.onDeviceOrientation(e));
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  loadRoom(roomId) {
    this.currentRoom = roomId;
    
    // Update UI
    document.getElementById('current-location').textContent = this.getRoomDisplayName(roomId);
    this.updateRoomInfo(roomId);
    this.updateMinimap(roomId);
    
    // Load panorama image
    const panoramaUrl = `images/tours/${this.castleData.id}/${roomId}/panorama.jpg`;
    this.loadPanoramaTexture(panoramaUrl);
    
    // Load hotspots for this room
    this.loadHotspots(roomId);
    
    // Load audio narration
    if (this.audioEnabled && this.tourMode === 'guided') {
      this.loadRoomAudio(roomId);
    }
    
    // Update tour progress
    this.updateTourProgress();
  }

  loadPanoramaTexture(url) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      if (this.capabilities.webGL) {
        this.updateWebGLTexture(image);
      } else {
        this.updateCSSBackground(url);
      }
      this.renderFrame();
    };
    
    image.onerror = () => {
      console.error('Failed to load panorama:', url);
      this.loadFallbackPanorama();
    };
    
    image.src = url;
  }

  loadHotspots(roomId) {
    this.hotspotsContainer.innerHTML = '';
    
    // Get hotspots data for this room
    const hotspotsData = this.getTourData().rooms[roomId]?.hotspots || [];
    
    hotspotsData.forEach(hotspot => {
      const hotspotElement = this.createHotspot(hotspot);
      this.hotspotsContainer.appendChild(hotspotElement);
    });
  }

  createHotspot(hotspotData) {
    const hotspot = document.createElement('div');
    hotspot.className = `tour-hotspot ${hotspotData.type}`;
    hotspot.style.left = `${hotspotData.position.x}%`;
    hotspot.style.top = `${hotspotData.position.y}%`;
    
    hotspot.innerHTML = `
      <div class="hotspot-marker">
        <div class="hotspot-icon">${this.getHotspotIcon(hotspotData.type)}</div>
        <div class="hotspot-pulse"></div>
      </div>
      <div class="hotspot-tooltip">
        <h4>${hotspotData.title}</h4>
        <p>${hotspotData.description}</p>
        ${hotspotData.type === 'navigation' ? '<span class="hotspot-action">Click to enter</span>' : ''}
      </div>
    `;
    
    hotspot.addEventListener('click', () => this.handleHotspotClick(hotspotData));
    
    return hotspot;
  }

  getHotspotIcon(type) {
    const icons = {
      navigation: '🚪',
      information: 'ℹ️',
      artifact: '🏺',
      audio: '🔊',
      video: '🎬',
      interaction: '👆'
    };
    return icons[type] || '📍';
  }

  handleHotspotClick(hotspotData) {
    switch (hotspotData.type) {
      case 'navigation':
        this.navigateToRoom(hotspotData.target);
        break;
      case 'information':
        this.showInformationModal(hotspotData);
        break;
      case 'artifact':
        this.showArtifactDetail(hotspotData);
        break;
      case 'audio':
        this.playAudioClip(hotspotData.audioUrl);
        break;
      case 'video':
        this.playVideoClip(hotspotData.videoUrl);
        break;
      case 'interaction':
        this.triggerInteraction(hotspotData);
        break;
    }
  }

  navigateToRoom(targetRoom) {
    // Smooth transition between rooms
    this.fadeOut(() => {
      this.loadRoom(targetRoom);
      this.fadeIn();
    });
  }

  fadeOut(callback) {
    this.panoramaContainer.style.transition = 'opacity 0.5s ease';
    this.panoramaContainer.style.opacity = '0';
    setTimeout(callback, 500);
  }

  fadeIn() {
    this.panoramaContainer.style.opacity = '1';
    setTimeout(() => {
      this.panoramaContainer.style.transition = '';
    }, 500);
  }

  setupEventListeners() {
    // Tour mode switching
    document.getElementById('tour-mode-btn').addEventListener('click', () => {
      this.cycleTourMode();
    });
    
    // VR mode toggle
    document.getElementById('vr-btn').addEventListener('click', () => {
      this.toggleVRMode();
    });
    
    // Fullscreen toggle
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      this.toggleFullscreen();
    });
    
    // Audio toggle
    document.getElementById('audio-btn').addEventListener('click', () => {
      this.toggleAudio();
    });
    
    // Room navigation
    document.querySelectorAll('.room-item').forEach(item => {
      item.addEventListener('click', () => {
        const roomId = item.dataset.room;
        this.loadRoom(roomId);
      });
    });
    
    // Playback controls
    document.getElementById('play-pause').addEventListener('click', () => {
      this.togglePlayback();
    });
    
    document.getElementById('prev-room').addEventListener('click', () => {
      this.previousRoom();
    });
    
    document.getElementById('next-room').addEventListener('click', () => {
      this.nextRoom();
    });
    
    // Screenshot
    document.getElementById('screenshot').addEventListener('click', () => {
      this.takeScreenshot();
    });
    
    // Share tour
    document.getElementById('share').addEventListener('click', () => {
      this.shareTour();
    });
  }

  cycleTourMode() {
    const modes = ['guided', 'free', 'expert'];
    const currentIndex = modes.indexOf(this.tourMode);
    this.tourMode = modes[(currentIndex + 1) % modes.length];
    
    const modeBtn = document.getElementById('tour-mode-btn');
    const modeText = modeBtn.querySelector('.mode-text');
    const modeIcon = modeBtn.querySelector('.mode-icon');
    
    const modeConfig = {
      guided: { text: 'Guided', icon: '🎓' },
      free: { text: 'Free', icon: '🎮' },
      expert: { text: 'Expert', icon: '🔬' }
    };
    
    modeText.textContent = modeConfig[this.tourMode].text;
    modeIcon.textContent = modeConfig[this.tourMode].icon;
    
    this.applyTourMode();
  }

  applyTourMode() {
    switch (this.tourMode) {
      case 'guided':
        this.enableAutoNarration();
        this.showBasicAnnotations();
        break;
      case 'free':
        this.disableAutoNarration();
        this.showInteractiveElements();
        break;
      case 'expert':
        this.enableExpertMode();
        this.showDetailedAnnotations();
        break;
    }
  }

  async toggleVRMode() {
    if (!this.capabilities.webXR) {
      alert('WebXR not supported on this device');
      return;
    }
    
    if (!this.isVRMode) {
      try {
        const session = await navigator.xr.requestSession('immersive-vr');
        this.vrSession = session;
        this.isVRMode = true;
        this.setupVRRendering();
        document.getElementById('vr-btn').classList.add('active');
      } catch (error) {
        console.error('Failed to start VR session:', error);
      }
    } else {
      if (this.vrSession) {
        this.vrSession.end();
        this.isVRMode = false;
        document.getElementById('vr-btn').classList.remove('active');
      }
    }
  }

  // Additional utility methods for tour functionality
  getTourData() {
    return {
      rooms: {
        entrance: {
          name: 'Entrance Hall',
          description: 'Grand entrance with impressive stonework',
          duration: 240, // seconds
          hotspots: [
            {
              type: 'navigation',
              position: { x: 60, y: 45 },
              title: 'Great Hall',
              description: 'Enter the magnificent Great Hall',
              target: 'great_hall'
            },
            {
              type: 'information',
              position: { x: 25, y: 30 },
              title: 'Coat of Arms',
              description: 'Learn about the family heraldry'
            }
          ]
        },
        great_hall: {
          name: 'Great Hall',
          description: 'The heart of castle life and ceremonies',
          duration: 300,
          hotspots: [
            {
              type: 'navigation',
              position: { x: 80, y: 50 },
              title: 'Tower Stairs',
              description: 'Climb to the tower',
              target: 'tower'
            },
            {
              type: 'artifact',
              position: { x: 40, y: 35 },
              title: 'Medieval Tapestry',
              description: 'Examine this 14th-century tapestry'
            }
          ]
        }
        // Additional rooms would be defined here
      }
    };
  }

  // CSS Styles for the virtual tour
  injectStyles() {
    const styles = `
      .virtual-tour-container {
        width: 100%;
        height: 100vh;
        background: #000;
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .tour-header {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #3498db;
      }
      
      .tour-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .castle-name {
        font-size: 18px;
        font-weight: bold;
        color: #ecf0f1;
      }
      
      .current-location {
        font-size: 14px;
        color: #bdc3c7;
      }
      
      .tour-controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .tour-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .tour-btn:hover {
        background: rgba(255,255,255,0.2);
        transform: translateY(-2px);
      }
      
      .tour-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .tour-btn.active {
        background: #3498db;
        border-color: #3498db;
      }
      
      .tour-main {
        flex: 1;
        display: flex;
        overflow: hidden;
      }
      
      .tour-viewer {
        flex: 1;
        position: relative;
        background: #000;
      }
      
      .viewer-canvas {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      }
      
      .panorama-container {
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      .panorama-container canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      
      .hotspots-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      
      .tour-hotspot {
        position: absolute;
        pointer-events: all;
        z-index: 10;
        cursor: pointer;
      }
      
      .hotspot-marker {
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(52, 152, 219, 0.8);
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.3s ease;
      }
      
      .hotspot-marker:hover {
        transform: scale(1.2);
        background: rgba(52, 152, 219, 1);
      }
      
      .hotspot-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        border: 2px solid #3498db;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
      }
      
      .hotspot-tooltip {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        padding: 10px 15px;
        border-radius: 8px;
        min-width: 200px;
        text-align: center;
        margin-top: 10px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      
      .tour-hotspot:hover .hotspot-tooltip {
        opacity: 1;
      }
      
      .navigation-compass {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 80px;
        height: 80px;
        background: rgba(0,0,0,0.7);
        border-radius: 50%;
        border: 2px solid #3498db;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tour-sidebar {
        width: 350px;
        background: #2c3e50;
        border-left: 1px solid #34495e;
        overflow-y: auto;
        padding: 20px;
      }
      
      .room-info h3 {
        color: #ecf0f1;
        margin-bottom: 15px;
        border-bottom: 2px solid #3498db;
        padding-bottom: 8px;
      }
      
      .room-description {
        margin-bottom: 20px;
        line-height: 1.6;
        color: #bdc3c7;
      }
      
      .room-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 25px;
      }
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid #34495e;
      }
      
      .detail-label {
        font-weight: bold;
        color: #95a5a6;
      }
      
      .detail-value {
        color: #ecf0f1;
      }
      
      .tour-playlist {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #34495e;
      }
      
      .room-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 15px;
      }
      
      .room-item {
        display: flex;
        gap: 12px;
        padding: 10px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .room-item:hover {
        background: rgba(255,255,255,0.1);
      }
      
      .room-item.active {
        background: #3498db;
      }
      
      .room-thumbnail {
        width: 60px;
        height: 45px;
        background: #34495e;
        border-radius: 4px;
        background-size: cover;
        background-position: center;
      }
      
      .tour-controls-bottom {
        background: #2c3e50;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        border-top: 1px solid #34495e;
      }
      
      .control-btn {
        background: #34495e;
        border: none;
        color: white;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 16px;
      }
      
      .control-btn:hover {
        background: #4a6741;
        transform: translateY(-2px);
      }
      
      .control-btn.primary {
        background: #3498db;
      }
      
      .control-btn.primary:hover {
        background: #2980b9;
      }
      
      .tour-timeline {
        flex: 1;
        margin: 0 20px;
      }
      
      .tour-timeline input[type="range"] {
        width: 100%;
        height: 6px;
        background: #34495e;
        outline: none;
        border-radius: 3px;
      }
      
      .tour-modal {
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
        background: #2c3e50;
        border-radius: 10px;
        padding: 30px;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
        position: relative;
        color: white;
      }
      
      .modal-close {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 28px;
        cursor: pointer;
        color: #bdc3c7;
      }
      
      .modal-close:hover {
        color: white;
      }
      
      @media (max-width: 768px) {
        .tour-sidebar {
          display: none;
        }
        
        .tour-main {
          flex-direction: column;
        }
        
        .tour-controls {
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .tour-btn {
          padding: 6px 8px;
          font-size: 12px;
        }
        
        .tour-controls-bottom {
          padding: 10px 15px;
        }
        
        .control-btn {
          padding: 8px 12px;
          font-size: 14px;
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
  const tour = new VirtualTourFramework();
  tour.injectStyles();
}

module.exports = VirtualTourFramework;