#!/usr/bin/env python3
"""
Castle Cultural Data Bridge - Integration between Worker4's Pipeline and Worker3's Cultural Generator
Coordinates 50,000+ castle data extraction with automated cultural narrative generation
"""

import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import sqlite3
from datetime import datetime

# Import Worker4's castle extractor
from castle_data_extractor import CastleData as Worker4CastleData, CastleDataPipeline

# Import Worker3's cultural generator format
from automated_cultural_narrative_generator import CastleData as Worker3CastleData, ScalableCastleProcessor

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class UnifiedCastleData:
    """Unified data structure bridging Worker4 and Worker3 systems"""
    # Core identification
    id: str
    name: str
    country: str
    location: str
    
    # Geographic data
    coordinates: Optional[tuple] = None
    region: str = ""
    
    # Historical data
    built_year: Optional[int] = None
    architectural_style: str = ""
    historical_periods: List[str] = None
    
    # Cultural data for narrative generation
    notable_rulers: List[str] = None
    military_events: List[str] = None
    cultural_themes: List[str] = None
    
    # Data provenance
    external_sources: List[str] = None
    data_quality_score: float = 0.0
    extraction_timestamp: str = ""
    
    # Raw data for preservation and debugging
    raw_worker4_data: Dict[str, Any] = None
    raw_external_data: Dict[str, Any] = None

class DataFormatTranslator:
    """Translates between Worker4 and Worker3 data formats"""
    
    def __init__(self):
        self.translation_rules = {
            "architectural_styles": {
                "Norman": ["Norman", "Early Medieval"],
                "Gothic": ["Gothic", "High Medieval"],
                "Gothic Revival": ["Gothic Revival", "Victorian", "19th Century"],
                "Renaissance": ["Renaissance", "Early Modern"],
                "Islamic": ["Islamic", "Moorish", "Medieval"],
                "Romanesque": ["Romanesque", "Medieval"],
                "Baroque": ["Baroque", "Early Modern"],
                "Byzantine": ["Byzantine", "Early Medieval"]
            },
            "countries": {
                "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
                "Germany": ["Holy Roman Empire", "Prussia", "Bavaria"],
                "France": ["Frankish Kingdom", "French Kingdom", "French Empire"],
                "Spain": ["Castile", "León", "Aragon", "Al-Andalus"],
                "Italy": ["Papal States", "Venetian Republic", "Kingdom of Sicily"]
            }
        }
    
    def worker4_to_unified(self, w4_data: Worker4CastleData) -> UnifiedCastleData:
        """Convert Worker4 castle data to unified format"""
        
        # Extract historical periods from architectural style and year
        historical_periods = self._derive_historical_periods(
            w4_data.architectural_style, 
            self._parse_year(w4_data.year_built)
        )
        
        # Extract potential rulers and events from description
        rulers, events = self._extract_historical_elements(w4_data.description)
        
        unified_data = UnifiedCastleData(
            id=w4_data.id,
            name=w4_data.name,
            country=w4_data.country,
            location=w4_data.location,
            coordinates=w4_data.coordinates,
            built_year=self._parse_year(w4_data.year_built),
            architectural_style=w4_data.architectural_style,
            historical_periods=historical_periods,
            notable_rulers=rulers,
            military_events=events,
            cultural_themes=self._derive_cultural_themes(w4_data),
            external_sources=[w4_data.source] if w4_data.source else [],
            data_quality_score=self._assess_quality(w4_data),
            extraction_timestamp=w4_data.extraction_timestamp,
            raw_worker4_data=asdict(w4_data),
            raw_external_data={}
        )
        
        return unified_data
    
    def unified_to_worker3(self, unified_data: UnifiedCastleData) -> Worker3CastleData:
        """Convert unified format to Worker3 cultural generator format"""
        
        w3_data = Worker3CastleData(
            name=unified_data.name,
            location=unified_data.location,
            country=unified_data.country,
            built_year=unified_data.built_year,
            architectural_style=unified_data.architectural_style,
            historical_periods=unified_data.historical_periods or [],
            notable_rulers=unified_data.notable_rulers or [],
            military_events=unified_data.military_events or [],
            coordinates=unified_data.coordinates,
            external_sources=unified_data.external_sources or [],
            raw_data=unified_data.raw_external_data or {}
        )
        
        return w3_data
    
    def _derive_historical_periods(self, architectural_style: str, year: Optional[int]) -> List[str]:
        """Derive historical periods from architectural style and construction year"""
        periods = []
        
        # From architectural style
        for style, period_list in self.translation_rules["architectural_styles"].items():
            if style.lower() in architectural_style.lower():
                periods.extend(period_list)
        
        # From year
        if year:
            if 500 <= year < 1000:
                periods.append("Early Medieval")
            elif 1000 <= year < 1300:
                periods.append("High Medieval")
            elif 1300 <= year < 1500:
                periods.append("Late Medieval")
            elif 1500 <= year < 1650:
                periods.append("Early Modern")
            elif 1650 <= year < 1800:
                periods.append("Baroque")
            elif 1800 <= year < 1900:
                periods.append("19th Century")
            elif 1900 <= year:
                periods.append("Modern")
        
        return list(set(periods))  # Remove duplicates
    
    def _extract_historical_elements(self, description: str) -> tuple[List[str], List[str]]:
        """Extract potential rulers and military events from description text"""
        rulers = []
        events = []
        
        if not description:
            return rulers, events
        
        # Simple keyword extraction (in production, would use NLP)
        ruler_keywords = ["King", "Queen", "Emperor", "Duke", "Earl", "Baron", "Count", "Prince", "Princess"]
        event_keywords = ["siege", "battle", "war", "conquest", "rebellion", "revolution"]
        
        words = description.split()
        
        for i, word in enumerate(words):
            if word in ruler_keywords and i + 1 < len(words):
                potential_ruler = f"{word} {words[i+1]}"
                rulers.append(potential_ruler)
            
            for event_keyword in event_keywords:
                if event_keyword.lower() in word.lower():
                    events.append(f"{event_keyword.title()} at {description.split('.')[0][:50]}...")
                    break
        
        return rulers[:3], events[:3]  # Limit to 3 each
    
    def _derive_cultural_themes(self, w4_data: Worker4CastleData) -> List[str]:
        """Derive cultural themes from castle data"""
        themes = []
        
        # From architectural style
        if any(style in w4_data.architectural_style.lower() for style in ["gothic", "cathedral"]):
            themes.append("religious_authority")
        if any(style in w4_data.architectural_style.lower() for style in ["renaissance", "palace"]):
            themes.append("artistic_patronage")
        if any(style in w4_data.architectural_style.lower() for style in ["fortress", "military"]):
            themes.append("military_power")
        
        # From description
        if any(word in w4_data.description.lower() for word in ["king", "royal", "crown"]):
            themes.append("royal_authority")
        if any(word in w4_data.description.lower() for word in ["trade", "merchant", "economic"]):
            themes.append("economic_power")
        
        return themes if themes else ["political_authority"]
    
    def _parse_year(self, year_string: str) -> Optional[int]:
        """Parse year from various string formats"""
        if not year_string:
            return None
        
        try:
            # Extract first 4-digit number
            import re
            match = re.search(r'(\d{4})', str(year_string))
            if match:
                return int(match.group(1))
        except:
            pass
        
        return None
    
    def _assess_quality(self, w4_data: Worker4CastleData) -> float:
        """Assess data quality for unified format"""
        score = 0.0
        
        if w4_data.name: score += 0.2
        if w4_data.country: score += 0.2
        if w4_data.location: score += 0.2
        if w4_data.coordinates: score += 0.2
        if w4_data.year_built: score += 0.1
        if w4_data.architectural_style: score += 0.1
        if w4_data.description and len(w4_data.description) > 100: score += 0.2
        
        return min(score, 1.0)

class CulturalAutomationIntegrator:
    """Main integration system coordinating Worker4 and Worker3"""
    
    def __init__(self, database_path: str = "cultural_automation_integration.db"):
        self.database_path = database_path
        self.translator = DataFormatTranslator()
        self.worker4_pipeline = CastleDataPipeline()
        self.worker3_processor = ScalableCastleProcessor()
        self.setup_integration_database()
    
    def setup_integration_database(self):
        """Setup integration tracking database"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS integration_pipeline (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                castle_id TEXT UNIQUE,
                castle_name TEXT,
                worker4_extraction_status TEXT,
                worker3_generation_status TEXT,
                data_quality_score REAL,
                cultural_narratives_generated BOOLEAN,
                processing_timestamp REAL,
                error_log TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS automation_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                processing_batch_id TEXT,
                total_castles_processed INTEGER,
                successful_extractions INTEGER,
                successful_generations INTEGER,
                average_processing_time REAL,
                average_quality_score REAL,
                batch_timestamp REAL
            )
        """)
        
        conn.commit()
        conn.close()
    
    async def run_integrated_pipeline(self, 
                                    target_castle_count: int = 10000,
                                    batch_size: int = 50,
                                    enable_cultural_generation: bool = True) -> Dict[str, Any]:
        """Run the complete integrated pipeline"""
        
        logger.info(f"Starting integrated pipeline - Target: {target_castle_count} castles")
        
        pipeline_results = {
            "extraction_results": {},
            "cultural_generation_results": {},
            "integration_metrics": {},
            "processing_summary": {}
        }
        
        # Phase 1: Extract castle data using Worker4's pipeline
        logger.info("Phase 1: Extracting castle data from external sources...")
        extracted_castles = self.worker4_pipeline.run_full_extraction(target_castle_count)
        pipeline_results["extraction_results"] = {
            "total_extracted": len(extracted_castles),
            "sources_used": list(set(c.source for c in extracted_castles)),
            "countries_covered": len(set(c.country for c in extracted_castles))
        }
        
        # Phase 2: Convert to unified format
        logger.info("Phase 2: Converting to unified data format...")
        unified_castles = []
        for castle in extracted_castles:
            unified_castle = self.translator.worker4_to_unified(castle)
            unified_castles.append(unified_castle)
        
        # Phase 3: Cultural narrative generation (if enabled)
        if enable_cultural_generation:
            logger.info("Phase 3: Generating cultural narratives...")
            
            # Convert to Worker3 format
            worker3_castles = []
            for unified_castle in unified_castles:
                w3_castle = self.translator.unified_to_worker3(unified_castle)
                worker3_castles.append(w3_castle)
            
            # Process in batches
            total_generated = 0
            for i in range(0, len(worker3_castles), batch_size):
                batch = worker3_castles[i:i + batch_size]
                try:
                    batch_results = await self.worker3_processor.process_castle_batch(batch)
                    total_generated += len(batch_results)
                    logger.info(f"Generated cultural narratives for batch {i//batch_size + 1}")
                except Exception as e:
                    logger.error(f"Error in cultural generation batch: {e}")
            
            pipeline_results["cultural_generation_results"] = {
                "total_generated": total_generated,
                "generation_rate": total_generated / len(unified_castles) if unified_castles else 0
            }
        
        # Phase 4: Store integration metrics
        self._store_integration_metrics(pipeline_results)
        
        pipeline_results["processing_summary"] = {
            "pipeline_completed": True,
            "total_processed": len(unified_castles),
            "cultural_generation_enabled": enable_cultural_generation,
            "completion_timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Integrated pipeline completed: {len(unified_castles)} castles processed")
        return pipeline_results
    
    def create_testing_framework(self) -> Dict[str, Any]:
        """Create comprehensive testing framework for Worker3's cultural generation"""
        
        # Generate test data samples
        test_cases = self._generate_test_cases()
        
        testing_framework = {
            "test_configuration": {
                "test_data_samples": len(test_cases),
                "testing_modes": ["quality_assessment", "performance_testing", "integration_testing"],
                "validation_criteria": {
                    "cultural_significance_length": {"min": 150, "max": 500},
                    "legends_count": {"min": 1, "max": 5},
                    "historical_events_completeness": True,
                    "data_quality_threshold": 0.7
                }
            },
            "automated_tests": {
                "data_format_validation": True,
                "narrative_quality_scoring": True,
                "performance_benchmarking": True,
                "integration_consistency": True
            },
            "test_cases": test_cases,
            "expected_outputs": self._define_expected_outputs(),
            "testing_infrastructure": {
                "test_database": "test_cultural_automation.db",
                "mock_external_apis": True,
                "performance_monitoring": True,
                "error_simulation": True
            }
        }
        
        return testing_framework
    
    def _generate_test_cases(self) -> List[Dict]:
        """Generate comprehensive test cases for cultural generation testing"""
        
        test_cases = [
            {
                "test_id": "TC001",
                "description": "Medieval English castle with rich history",
                "input_data": {
                    "name": "Warwick Castle",
                    "country": "England",
                    "location": "Warwick, Warwickshire",
                    "built_year": 1068,
                    "architectural_style": "Norman Medieval",
                    "notable_rulers": ["William the Conqueror", "Richard Neville"],
                    "military_events": ["English Civil War Siege"]
                },
                "expected_quality_score": 0.9,
                "test_focus": "comprehensive_narrative_generation"
            },
            {
                "test_id": "TC002", 
                "description": "Renaissance French château",
                "input_data": {
                    "name": "Château de Chambord",
                    "country": "France",
                    "location": "Loire Valley",
                    "built_year": 1519,
                    "architectural_style": "French Renaissance",
                    "notable_rulers": ["Francis I"],
                    "military_events": []
                },
                "expected_quality_score": 0.8,
                "test_focus": "artistic_cultural_significance"
            },
            {
                "test_id": "TC003",
                "description": "Islamic palace complex",
                "input_data": {
                    "name": "Alhambra",
                    "country": "Spain", 
                    "location": "Granada, Andalusia",
                    "built_year": 1238,
                    "architectural_style": "Islamic",
                    "notable_rulers": ["Nasrid Dynasty"],
                    "military_events": ["Reconquista"]
                },
                "expected_quality_score": 0.85,
                "test_focus": "multicultural_narrative_synthesis"
            }
        ]
        
        return test_cases
    
    def _define_expected_outputs(self) -> Dict:
        """Define expected output structure and quality criteria"""
        
        return {
            "narrative_structure": {
                "required_sections": [
                    "culturalSignificance",
                    "legends", 
                    "historicalEvents",
                    "rulerBiographies",
                    "socialHistory"
                ],
                "optional_sections": [
                    "architecturalEvolution",
                    "modernLegacy"
                ]
            },
            "quality_metrics": {
                "cultural_significance_coherence": True,
                "historical_accuracy_validation": True,
                "narrative_completeness": True,
                "cultural_sensitivity": True
            },
            "performance_benchmarks": {
                "processing_time_per_castle": {"target": 30, "max": 60, "unit": "seconds"},
                "memory_usage_per_batch": {"target": 500, "max": 1000, "unit": "MB"},
                "api_calls_efficiency": {"external_calls_per_castle": {"target": 5, "max": 10}}
            }
        }
    
    def _store_integration_metrics(self, results: Dict):
        """Store integration metrics in database"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO automation_metrics 
            (processing_batch_id, total_castles_processed, successful_extractions, 
             successful_generations, batch_timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (
            f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            results.get("extraction_results", {}).get("total_extracted", 0),
            results.get("extraction_results", {}).get("total_extracted", 0),
            results.get("cultural_generation_results", {}).get("total_generated", 0),
            datetime.now().timestamp()
        ))
        
        conn.commit()
        conn.close()

def main():
    """Main execution for testing integration"""
    integrator = CulturalAutomationIntegrator()
    
    # Create testing framework
    testing_framework = integrator.create_testing_framework()
    
    # Save testing framework
    with open("cultural_automation_testing_framework.json", "w") as f:
        json.dump(testing_framework, f, indent=2)
    
    logger.info("Cultural automation integration components created successfully")
    logger.info(f"Testing framework: {len(testing_framework['test_cases'])} test cases generated")

if __name__ == "__main__":
    main()