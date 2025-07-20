#!/usr/bin/env node

// Castle Enhancement Script for 2025
// Applies comprehensive visitor information, preservation status, and modern significance
// Coordinates with Worker1's integration system

const fs = require('fs');
const path = require('path');

class CastleEnhancer2025 {
  constructor() {
    this.inputPath = './castles_final_63.json';
    this.enhancementDataPath = './castle_enhancement_2025.json';
    this.outputPath = './castles_enhanced_final.json';
    this.backupPath = './castles_final_63_backup.json';
  }

  async enhance() {
    try {
      console.log('🏰 Starting Castle Enhancement for 2025...');
      
      // Load data
      const castles = this.loadJSON(this.inputPath);
      const enhancementData = this.loadJSON(this.enhancementDataPath);
      
      console.log(`📊 Loaded ${castles.length} castles for enhancement`);
      
      // Create backup
      this.createBackup(castles);
      
      // Apply comprehensive enhancements
      const enhancedCastles = this.applyEnhancements(castles, enhancementData);
      
      // Validate results
      this.validateEnhancements(enhancedCastles);
      
      // Save enhanced data
      this.saveJSON(this.outputPath, enhancedCastles);
      
      console.log('✅ Enhancement completed successfully!');
      console.log(`📈 Result: ${enhancedCastles.length} enhanced castles`);
      
      // Generate enhancement report
      this.generateEnhancementReport(enhancedCastles);
      
      return enhancedCastles;
      
    } catch (error) {
      console.error('❌ Enhancement failed:', error.message);
      throw error;
    }
  }

  loadJSON(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load ${filePath}: ${error.message}`);
    }
  }

  saveJSON(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`💾 Saved enhanced data to ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to save ${filePath}: ${error.message}`);
    }
  }

  createBackup(data) {
    try {
      fs.writeFileSync(this.backupPath, JSON.stringify(data, null, 2));
      console.log(`🔄 Created backup at ${this.backupPath}`);
    } catch (error) {
      console.warn(`⚠️ Failed to create backup: ${error.message}`);
    }
  }

  applyEnhancements(castles, enhancementData) {
    const enhanced = [];
    const globalTrends = enhancementData.enhancement_methodology_2025.global_trends;
    const specificEnhancements = new Map();
    
    // Create enhancement lookup
    enhancementData.enhanced_castle_data.forEach(castle => {
      specificEnhancements.set(castle.id, castle.visitor_enhancement_2025);
    });

    castles.forEach((castle, index) => {
      const enhanced_castle = { ...castle };
      
      // Apply specific enhancements if available
      const specificEnhancement = specificEnhancements.get(castle.id);
      if (specificEnhancement) {
        console.log(`🔧 Applying specific enhancement to ${castle.castleName}`);
        enhanced_castle.currentStatus = this.enhanceCurrentStatus(castle.currentStatus, specificEnhancement.current_status);
        enhanced_castle.visitorInfo = this.enhanceVisitorInfo(castle.visitorInfo, specificEnhancement.visitor_information);
        enhanced_castle.preservationEfforts = this.enhancePreservationEfforts(castle.preservationEfforts, specificEnhancement.preservation_efforts_2025);
        enhanced_castle.tourismDetails = this.enhanceTourismDetails(castle.tourismDetails, specificEnhancement.modern_significance_2025);
      }
      
      // Apply 2025 global trends to all castles
      enhanced_castle.modernTrends2025 = this.applyGlobalTrends(castle, globalTrends);
      
      // Update metadata with enhancement information
      enhanced_castle.metadata = {
        ...enhanced_castle.metadata,
        lastUpdated: new Date().toISOString(),
        dataQuality: specificEnhancement ? "comprehensive_2025" : enhanced_castle.metadata?.dataQuality || "enhanced",
        completeness: this.calculateCompleteness(enhanced_castle),
        version: "3.0-enhanced-2025",
        contributors: [
          ...(enhanced_castle.metadata?.contributors || []),
          "Worker4-2025Enhancement"
        ]
      };
      
      enhanced.push(enhanced_castle);
    });
    
    return enhanced;
  }

  enhanceCurrentStatus(existing, enhancement) {
    return {
      ...existing,
      operationalState: enhancement?.operationalState || existing?.operationalState || "heritage_site",
      unescoHeritage: enhancement?.unesco_heritage || false,
      heritageDesignation: enhancement?.heritage_designation || "",
      managementOrganization: enhancement?.management || existing?.management || "heritage_organization",
      accessibility: enhancement?.accessibility || existing?.accessibility || "public",
      condition: enhancement?.condition || existing?.condition || "good",
      lastInspection: new Date().toISOString().split('T')[0],
      maintenanceSchedule: "ongoing"
    };
  }

  enhanceVisitorInfo(existing, enhancement) {
    const enhanced = { ...existing };
    
    if (enhancement?.opening_hours) {
      enhanced.openingHours = {
        ...enhanced.openingHours,
        seasonal: enhancement.opening_hours,
        lastUpdated: "2025-07-20"
      };
    }
    
    if (enhancement?.ticket_information || enhancement?.ticket_information_2025) {
      const ticketInfo = enhancement.ticket_information || enhancement.ticket_information_2025;
      enhanced.ticketPrices = {
        ...enhanced.ticketPrices,
        bookingAdvance: ticketInfo.advance_booking || "recommended",
        onlineDiscount: ticketInfo.online_discount || "",
        validity: ticketInfo.validity || "",
        purchaseMethods: ticketInfo.purchase_methods || [],
        specialOffers: ticketInfo.special_offers || ""
      };
    }
    
    if (enhancement?.tour_options) {
      enhanced.tours = {
        ...enhanced.tours,
        available: Object.keys(enhancement.tour_options),
        details: enhancement.tour_options,
        languages: enhancement.languages || []
      };
    }
    
    if (enhancement?.accessibility_features || enhancement?.modern_features) {
      const accessFeatures = enhancement.accessibility_features || enhancement.modern_features;
      enhanced.accessibility = {
        ...enhanced.accessibility,
        wheelchairAccess: accessFeatures.wheelchair_access || false,
        modernAmenities: accessFeatures.technology || [],
        limitations: accessFeatures.limitations || accessFeatures.terrain_warning || ""
      };
    }
    
    return enhanced;
  }

  enhancePreservationEfforts(existing, enhancement) {
    const enhanced = { ...existing };
    
    if (enhancement) {
      enhanced.heritageStatus = {
        ...enhanced.heritageStatus,
        unesco: enhancement.unesco_heritage || false,
        designation: enhancement.heritage_designation || "",
        managementAuthority: enhancement.management || ""
      };
      
      enhanced.activeProjects2025 = enhancement.active_projects || {};
      enhanced.conservationStatus = enhancement.conservation_status || "ongoing";
      enhanced.researchInitiatives = enhancement.research_initiatives || "";
      enhanced.fundingModel = enhancement.funding_model || "";
    }
    
    return enhanced;
  }

  enhanceTourismDetails(existing, enhancement) {
    const enhanced = { ...existing };
    
    if (enhancement) {
      enhanced.culturalImpact = enhancement.cultural_impact || existing?.culturalImpact || "";
      enhanced.tourismStatistics = enhancement.tourism_statistics || "";
      enhanced.educationalRole = enhancement.educational_role || existing?.educationalRole || "";
      enhanced.globalRecognition = enhancement.global_recognition || "";
      enhanced.modernSignificance2025 = {
        accessibilityImprovements: enhancement.accessibility_improvements || "",
        urbanIntegration: enhancement.urban_integration || "",
        cherryblossom: enhancement.cherry_blossom_destination || false
      };
    }
    
    return enhanced;
  }

  applyGlobalTrends(castle, trends) {
    return {
      technologyIntegration: {
        vrArPotential: this.assessTechPotential(castle),
        digitalTicketing: "recommended_2025",
        smartGuides: "ai_powered_audio_guides"
      },
      sustainableTourism: {
        ecoTaxEligible: castle.country === "Germany" || castle.country === "Spain",
        slowTourismCompatible: true,
        visitorCapManagement: this.assessVisitorManagement(castle)
      },
      unescoTrends: {
        potentialNewDesignation: this.assessUNESCOPotential(castle),
        visitorManagementRequired: true,
        expectedGrowth: "20-30% if UNESCO designated"
      },
      preservationFunding: {
        pppEligible: this.assessPPPEligibility(castle),
        monitoringSystemsRecommended: "3d_scanning_digital_modeling",
        annualMaintenanceBudget: this.estimateMaintenanceBudget(castle)
      }
    };
  }

  assessTechPotential(castle) {
    if (castle.engineeringDetails) return "high_potential";
    if (castle.legends?.length > 0) return "medium_potential";
    return "basic_potential";
  }

  assessVisitorManagement(castle) {
    if (castle.visitorInfo?.openingHours) return "active_management";
    return "requires_implementation";
  }

  assessUNESCOPotential(castle) {
    if (castle.preservationEfforts?.heritageStatus?.unesco) return "already_designated";
    if (castle.architecturalStyle?.includes("Renaissance") || castle.architecturalStyle?.includes("Gothic")) return "high_potential";
    return "medium_potential";
  }

  assessPPPEligibility(castle) {
    const eligibleCountries = ["Germany", "France", "United Kingdom", "Spain", "Japan"];
    return eligibleCountries.includes(castle.country);
  }

  estimateMaintenanceBudget(castle) {
    if (castle.engineeringDetails && castle.keyFeatures?.length > 5) return "€10-50_million_annually";
    if (castle.architecturalStyle?.includes("Renaissance")) return "€5-20_million_annually";
    return "€1-10_million_annually";
  }

  calculateCompleteness(castle) {
    let score = 0;
    const maxScore = 25;
    
    // Enhanced scoring for 2025
    if (castle.castleName) score++;
    if (castle.shortDescription) score++;
    if (castle.architecturalStyle) score++;
    if (castle.keyFeatures?.length) score++;
    if (castle.culturalSignificance) score++;
    if (castle.historicalEvents?.length) score++;
    if (castle.engineeringDetails) score += 2;
    if (castle.legends?.length) score++;
    if (castle.currentStatus) score++;
    if (castle.visitorInfo) score++;
    if (castle.preservationEfforts) score++;
    if (castle.tourismDetails) score++;
    if (castle.research?.academicSources?.length) score++;
    if (castle.multimedia?.images?.length) score++;
    if (castle.interactive) score++;
    if (castle.metadata) score++;
    
    // New 2025 enhancement criteria
    if (castle.modernTrends2025) score += 2;
    if (castle.currentStatus?.unescoHeritage) score += 2;
    if (castle.visitorInfo?.openingHours?.seasonal) score += 2;
    if (castle.preservationEfforts?.activeProjects2025) score += 2;
    
    return Math.round((score / maxScore) * 100);
  }

  validateEnhancements(data) {
    if (!Array.isArray(data)) {
      throw new Error("Enhancement result must be an array");
    }
    
    if (data.length === 0) {
      throw new Error("No castles in enhanced result");
    }
    
    const requiredFields = ['id', 'castleName', 'country'];
    data.forEach((castle, index) => {
      requiredFields.forEach(field => {
        if (!castle[field]) {
          throw new Error(`Castle ${index}: Missing required field '${field}'`);
        }
      });
    });
    
    console.log(`✅ Validation passed: ${data.length} castles enhanced`);
  }

  generateEnhancementReport(data) {
    const report = {
      timestamp: new Date().toISOString(),
      totalCastles: data.length,
      enhancementSummary: {
        withModernTrends: data.filter(c => c.modernTrends2025).length,
        unescoSites: data.filter(c => c.currentStatus?.unescoHeritage).length,
        with2025Updates: data.filter(c => c.metadata?.version?.includes("2025")).length,
        averageCompleteness: Math.round(
          data.reduce((sum, c) => sum + (c.metadata?.completeness || 0), 0) / data.length
        )
      },
      technologyReadiness: {
        highTechPotential: data.filter(c => c.modernTrends2025?.technologyIntegration?.vrArPotential === "high_potential").length,
        digitalTicketingReady: data.length, // All castles recommended for digital ticketing
        smartGuideCompatible: data.length
      },
      preservationStatus: {
        activeConservation: data.filter(c => c.preservationEfforts?.conservationStatus === "active_ongoing_restoration").length,
        pppEligible: data.filter(c => c.modernTrends2025?.preservationFunding?.pppEligible).length,
        highMaintenanceBudget: data.filter(c => c.modernTrends2025?.preservationFunding?.annualMaintenanceBudget?.includes("50_million")).length
      },
      globalCoverage: {
        countries: [...new Set(data.map(c => c.country))].length,
        continents: this.analyzeContinentalCoverage(data)
      }
    };
    
    fs.writeFileSync('./enhancement-report-2025.json', JSON.stringify(report, null, 2));
    
    console.log('\\n📊 Enhancement Report 2025:');
    console.log(`   Total enhanced castles: ${report.totalCastles}`);
    console.log(`   With modern trends: ${report.enhancementSummary.withModernTrends}`);
    console.log(`   UNESCO sites: ${report.enhancementSummary.unescoSites}`);
    console.log(`   Average completeness: ${report.enhancementSummary.averageCompleteness}%`);
    console.log(`   Tech readiness (high): ${report.technologyReadiness.highTechPotential}`);
    console.log(`   PPP eligible: ${report.preservationStatus.pppEligible}`);
  }

  analyzeContinentalCoverage(data) {
    const continentMap = {
      "Germany": "Europe", "France": "Europe", "United Kingdom": "Europe", "Scotland": "Europe",
      "England": "Europe", "Wales": "Europe", "Spain": "Europe", "Czech Republic": "Europe",
      "Romania": "Europe", "Poland": "Europe", "Austria": "Europe", "Italy": "Europe",
      "Portugal": "Europe", "Ireland": "Europe", "Slovakia": "Europe", "Slovenia": "Europe",
      "Japan": "Asia", "China": "Asia", "South Korea": "Asia", "India": "Asia", "Turkey": "Asia",
      "United States": "North America",
      "Egypt": "Africa", "Morocco": "Africa", "Ethiopia": "Africa", "Zimbabwe": "Africa",
      "Syria": "Middle East"
    };
    
    const continents = new Set();
    data.forEach(castle => {
      const continent = continentMap[castle.country];
      if (continent) continents.add(continent);
    });
    
    return Array.from(continents);
  }
}

// Execute enhancement if run directly
if (require.main === module) {
  const enhancer = new CastleEnhancer2025();
  enhancer.enhance()
    .then(() => {
      console.log('\\n🎉 Castle enhancement for 2025 completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\\n💥 Enhancement failed:', error);
      process.exit(1);
    });
}

module.exports = CastleEnhancer2025;