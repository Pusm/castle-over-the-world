#!/usr/bin/env python3
"""
Castle Data Extractor - Automated Pipeline for 10,000+ Castle Goal
Demonstrates scalable data extraction from multiple external sources
Worker4 - External Data Research Implementation
"""

import requests
import json
import time
import csv
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class CastleData:
    """Standardized castle data structure"""
    id: str
    name: str
    country: str
    location: str = ""
    coordinates: Optional[tuple] = None
    architectural_style: str = ""
    year_built: str = ""
    description: str = ""
    source: str = ""
    source_url: str = ""
    unesco_status: bool = False
    extraction_timestamp: str = ""

class WikidataCastleExtractor:
    """Extract castle data using Wikidata SPARQL queries"""
    
    def __init__(self):
        self.endpoint = "https://query.wikidata.org/sparql"
        self.headers = {
            'User-Agent': 'CastleDataExtractor/1.0 (https://github.com/castle-research)',
            'Accept': 'application/sparql-results+json'
        }
    
    def get_castles_by_country(self, country_code: str = None, limit: int = 1000) -> List[CastleData]:
        """Extract castles from Wikidata with comprehensive information"""
        
        # SPARQL query for castles with architectural and historical data
        query = f"""
        SELECT DISTINCT ?castle ?castleLabel ?countryLabel ?coordinates ?styleLabel ?built ?description ?architectLabel WHERE {{
          ?castle wdt:P31/wdt:P279* wd:Q23413 .  # Instance of castle
          ?castle wdt:P17 ?country .              # Country
          OPTIONAL {{ ?castle wdt:P625 ?coordinates . }}  # Coordinates
          OPTIONAL {{ ?castle wdt:P149 ?style . }}        # Architectural style
          OPTIONAL {{ ?castle wdt:P571 ?built . }}        # Inception date
          OPTIONAL {{ ?castle wdt:P84 ?architect . }}     # Architect
          OPTIONAL {{ ?castle schema:description ?description . FILTER(LANG(?description) = "en") }}
          
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
        }}
        LIMIT {limit}
        """
        
        try:
            response = requests.get(
                self.endpoint,
                params={'query': query, 'format': 'json'},
                headers=self.headers,
                timeout=60
            )
            response.raise_for_status()
            
            data = response.json()
            castles = []
            
            for binding in data['results']['bindings']:
                castle_data = CastleData(
                    id=self._extract_wikidata_id(binding.get('castle', {}).get('value', '')),
                    name=binding.get('castleLabel', {}).get('value', 'Unknown'),
                    country=binding.get('countryLabel', {}).get('value', 'Unknown'),
                    coordinates=self._parse_coordinates(binding.get('coordinates', {}).get('value', '')),
                    architectural_style=binding.get('styleLabel', {}).get('value', ''),
                    year_built=self._parse_date(binding.get('built', {}).get('value', '')),
                    description=binding.get('description', {}).get('value', ''),
                    source="Wikidata",
                    source_url=binding.get('castle', {}).get('value', ''),
                    extraction_timestamp=datetime.now().isoformat()
                )
                castles.append(castle_data)
            
            logger.info(f"Extracted {len(castles)} castles from Wikidata")
            return castles
            
        except Exception as e:
            logger.error(f"Error extracting from Wikidata: {e}")
            return []
    
    def _extract_wikidata_id(self, uri: str) -> str:
        """Extract Wikidata ID from URI"""
        return uri.split('/')[-1] if uri else ""
    
    def _parse_coordinates(self, coord_string: str) -> Optional[tuple]:
        """Parse coordinate string to lat/lon tuple"""
        if not coord_string or not coord_string.startswith('Point('):
            return None
        try:
            coords = coord_string.replace('Point(', '').replace(')', '').split()
            return (float(coords[1]), float(coords[0]))  # lat, lon
        except:
            return None
    
    def _parse_date(self, date_string: str) -> str:
        """Parse date string to year"""
        if not date_string:
            return ""
        try:
            return date_string.split('-')[0]  # Extract year
        except:
            return date_string

class OpenStreetMapCastleExtractor:
    """Extract castle data using OpenStreetMap Overpass API"""
    
    def __init__(self):
        self.endpoint = "https://overpass-api.de/api/interpreter"
        self.headers = {
            'User-Agent': 'CastleDataExtractor/1.0'
        }
    
    def get_castles_by_bbox(self, south: float, west: float, north: float, east: float) -> List[CastleData]:
        """Extract castles from OSM within bounding box"""
        
        # Overpass QL query for castles and fortresses
        query = f"""
        [out:json][timeout:30];
        (
          node["historic"="castle"]({south},{west},{north},{east});
          way["historic"="castle"]({south},{west},{north},{east});
          relation["historic"="castle"]({south},{west},{north},{east});
          node["historic"="fortress"]({south},{west},{north},{east});
          way["historic"="fortress"]({south},{west},{north},{east});
        );
        out geom meta;
        """
        
        try:
            response = requests.post(
                self.endpoint,
                data=query,
                headers=self.headers,
                timeout=60
            )
            response.raise_for_status()
            
            data = response.json()
            castles = []
            
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                
                # Extract coordinates
                coords = None
                if element['type'] == 'node':
                    coords = (element.get('lat'), element.get('lon'))
                elif 'center' in element:
                    coords = (element['center']['lat'], element['center']['lon'])
                
                castle_data = CastleData(
                    id=f"osm_{element['type']}_{element['id']}",
                    name=tags.get('name', tags.get('historic', 'Unknown Castle')),
                    country=self._get_country_from_coords(coords) if coords else 'Unknown',
                    location=f"{tags.get('addr:city', '')}, {tags.get('addr:state', '')}".strip(', '),
                    coordinates=coords,
                    architectural_style=tags.get('castle_type', tags.get('building:architecture', '')),
                    year_built=self._parse_date_tags(tags),
                    description=tags.get('description', tags.get('wikipedia', '')),
                    source="OpenStreetMap",
                    source_url=f"https://www.openstreetmap.org/{element['type']}/{element['id']}",
                    extraction_timestamp=datetime.now().isoformat()
                )
                castles.append(castle_data)
            
            logger.info(f"Extracted {len(castles)} castles from OpenStreetMap")
            return castles
            
        except Exception as e:
            logger.error(f"Error extracting from OpenStreetMap: {e}")
            return []
    
    def _get_country_from_coords(self, coords: tuple) -> str:
        """Reverse geocode coordinates to country (simplified)"""
        # In production, use proper reverse geocoding service
        return "Unknown"
    
    def _parse_date_tags(self, tags: Dict) -> str:
        """Extract construction date from various OSM tags"""
        for date_key in ['start_date', 'construction_date', 'built_date']:
            if date_key in tags:
                return tags[date_key].split('-')[0]  # Extract year
        return ""

class WikipediaCastleExtractor:
    """Extract castle data from Wikipedia using MediaWiki API"""
    
    def __init__(self):
        self.base_url = "https://en.wikipedia.org/w/api.php"
        self.headers = {
            'User-Agent': 'CastleDataExtractor/1.0'
        }
    
    def get_castles_from_category(self, category: str = "Category:Castles_by_country", limit: int = 500) -> List[CastleData]:
        """Extract castle articles from Wikipedia categories"""
        
        try:
            # Get category members
            params = {
                'action': 'query',
                'list': 'categorymembers',
                'cmtitle': category,
                'cmlimit': limit,
                'format': 'json'
            }
            
            response = requests.get(self.base_url, params=params, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            castle_pages = data.get('query', {}).get('categorymembers', [])
            
            castles = []
            for page in castle_pages:
                if 'Castle' in page['title'] or 'castle' in page['title']:
                    castle_data = self._extract_castle_data(page['title'], page['pageid'])
                    if castle_data:
                        castles.append(castle_data)
                        time.sleep(0.1)  # Rate limiting
            
            logger.info(f"Extracted {len(castles)} castles from Wikipedia category: {category}")
            return castles
            
        except Exception as e:
            logger.error(f"Error extracting from Wikipedia: {e}")
            return []
    
    def _extract_castle_data(self, title: str, page_id: int) -> Optional[CastleData]:
        """Extract detailed information for a specific castle page"""
        
        try:
            # Get page content and basic info
            params = {
                'action': 'query',
                'pageids': page_id,
                'prop': 'extracts|coordinates|pageprops',
                'exintro': True,
                'explaintext': True,
                'format': 'json'
            }
            
            response = requests.get(self.base_url, params=params, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            page_data = data.get('query', {}).get('pages', {}).get(str(page_id), {})
            
            # Extract coordinates
            coords = None
            if 'coordinates' in page_data:
                coord_data = page_data['coordinates'][0]
                coords = (coord_data.get('lat'), coord_data.get('lon'))
            
            castle_data = CastleData(
                id=f"wikipedia_{page_id}",
                name=title,
                country=self._extract_country_from_title(title),
                coordinates=coords,
                description=page_data.get('extract', '')[:500] + '...' if page_data.get('extract') else '',
                source="Wikipedia",
                source_url=f"https://en.wikipedia.org/?curid={page_id}",
                extraction_timestamp=datetime.now().isoformat()
            )
            
            return castle_data
            
        except Exception as e:
            logger.error(f"Error extracting castle data for {title}: {e}")
            return None
    
    def _extract_country_from_title(self, title: str) -> str:
        """Extract country from castle title (simplified heuristic)"""
        # Look for country indicators in title
        countries = ["England", "Scotland", "Wales", "Ireland", "France", "Germany", "Spain", "Italy"]
        for country in countries:
            if country in title:
                return country
        return "Unknown"

class CastleDataPipeline:
    """Main pipeline orchestrating multiple data extractors"""
    
    def __init__(self):
        self.wikidata_extractor = WikidataCastleExtractor()
        self.osm_extractor = OpenStreetMapCastleExtractor()
        self.wikipedia_extractor = WikipediaCastleExtractor()
        self.all_castles = []
    
    def run_full_extraction(self, target_count: int = 10000) -> List[CastleData]:
        """Run complete extraction pipeline"""
        
        logger.info(f"Starting castle data extraction pipeline - Target: {target_count} castles")
        
        # Phase 1: Wikidata extraction
        logger.info("Phase 1: Extracting from Wikidata...")
        wikidata_castles = self.wikidata_extractor.get_castles_by_country(limit=5000)
        self.all_castles.extend(wikidata_castles)
        
        if len(self.all_castles) >= target_count:
            return self.all_castles[:target_count]
        
        # Phase 2: OpenStreetMap extraction (sample bounding boxes)
        logger.info("Phase 2: Extracting from OpenStreetMap...")
        sample_regions = [
            (50.0, -5.0, 60.0, 5.0),   # British Isles
            (45.0, -5.0, 55.0, 15.0),  # Central Europe
            (35.0, -10.0, 45.0, 5.0),  # Iberian Peninsula
            (45.0, 5.0, 55.0, 25.0)    # Eastern Europe
        ]
        
        for bbox in sample_regions:
            osm_castles = self.osm_extractor.get_castles_by_bbox(*bbox)
            self.all_castles.extend(osm_castles)
            time.sleep(2)  # Rate limiting
            
            if len(self.all_castles) >= target_count:
                break
        
        # Phase 3: Wikipedia extraction
        if len(self.all_castles) < target_count:
            logger.info("Phase 3: Extracting from Wikipedia...")
            wiki_castles = self.wikipedia_extractor.get_castles_from_category()
            self.all_castles.extend(wiki_castles)
        
        # Deduplicate and clean
        self.all_castles = self._deduplicate_castles(self.all_castles)
        
        logger.info(f"Extraction complete: {len(self.all_castles)} unique castles found")
        return self.all_castles[:target_count]
    
    def _deduplicate_castles(self, castles: List[CastleData]) -> List[CastleData]:
        """Remove duplicate castles based on name and coordinates"""
        seen = set()
        unique_castles = []
        
        for castle in castles:
            # Create deduplication key
            key = (castle.name.lower(), castle.coordinates)
            if key not in seen:
                seen.add(key)
                unique_castles.append(castle)
        
        logger.info(f"Deduplication: {len(castles)} -> {len(unique_castles)} unique castles")
        return unique_castles
    
    def export_to_json(self, filename: str = "extracted_castles.json"):
        """Export castle data to JSON format"""
        castle_dicts = []
        for castle in self.all_castles:
            castle_dict = {
                'id': castle.id,
                'castleName': castle.name,
                'country': castle.country,
                'location': castle.location,
                'coordinates': castle.coordinates,
                'architecturalStyle': castle.architectural_style,
                'yearBuilt': castle.year_built,
                'shortDescription': castle.description,
                'source': castle.source,
                'sourceUrl': castle.source_url,
                'unescoStatus': castle.unesco_status,
                'extractionTimestamp': castle.extraction_timestamp
            }
            castle_dicts.append(castle_dict)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(castle_dicts, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Exported {len(castle_dicts)} castles to {filename}")

def main():
    """Main execution function"""
    pipeline = CastleDataPipeline()
    
    # Extract castles
    castles = pipeline.run_full_extraction(target_count=1000)  # Start with 1000 for testing
    
    # Export results
    pipeline.export_to_json("castle_extraction_demo.json")
    
    # Print summary
    print(f"\\n🏰 Castle Data Extraction Summary:")
    print(f"   Total extracted: {len(castles)}")
    print(f"   Sources: Wikidata, OpenStreetMap, Wikipedia")
    print(f"   Countries: {len(set(c.country for c in castles))}")
    print(f"   With coordinates: {len([c for c in castles if c.coordinates])}")
    print(f"   Output file: castle_extraction_demo.json")

if __name__ == "__main__":
    main()