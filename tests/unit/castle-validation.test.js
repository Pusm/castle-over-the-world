const fs = require('fs-extra');
const path = require('path');

// Castle validation utilities
class CastleValidator {
  static validateStructure(castle) {
    const requiredFields = [
      'id', 'castleName', 'country', 'location', 
      'architecturalStyle', 'yearBuilt', 'shortDescription', 'keyFeatures'
    ];
    
    return requiredFields.every(field => castle.hasOwnProperty(field));
  }

  static validateTypes(castle) {
    const stringFields = ['id', 'castleName', 'country', 'location', 'architecturalStyle', 'yearBuilt', 'shortDescription'];
    const arrayFields = ['keyFeatures'];
    
    const stringValid = stringFields.every(field => 
      typeof castle[field] === 'string' && castle[field].length > 0
    );
    
    const arrayValid = arrayFields.every(field => 
      Array.isArray(castle[field]) && castle[field].length > 0
    );
    
    return stringValid && arrayValid;
  }

  static validateIdFormat(id) {
    // ID should be string with underscores, no spaces or special chars
    return /^[a-z0-9_]+$/.test(id);
  }

  static validateUniqueness(castles) {
    const ids = castles.map(c => c.id);
    const names = castles.map(c => c.castleName);
    
    return ids.length === new Set(ids).size && 
           names.length === new Set(names).size;
  }

  static validateRealCastle(castle) {
    // Basic validation for real castle data
    const suspiciousPatterns = [
      'test', 'mock', 'fake', 'sample', 'example',
      'placeholder', 'dummy', 'generic'
    ];
    
    const text = [castle.castleName, castle.location, castle.shortDescription].join(' ').toLowerCase();
    
    return !suspiciousPatterns.some(pattern => text.includes(pattern));
  }
}

describe('Castle Validation Unit Tests', () => {
  describe('Structure Validation', () => {
    test('should validate complete castle structure', () => {
      const validCastle = {
        id: 'neuschwanstein_castle',
        castleName: 'Neuschwanstein Castle',
        country: 'Germany',
        location: 'Bavaria',
        architecturalStyle: 'Romanesque Revival',
        yearBuilt: '19th century',
        shortDescription: 'A fairytale castle commissioned by Ludwig II of Bavaria.',
        keyFeatures: ['Gothic Revival architecture', 'Mountain setting', 'Disney inspiration']
      };

      expect(CastleValidator.validateStructure(validCastle)).toBe(true);
    });

    test('should reject incomplete castle structure', () => {
      const incompleteCastle = {
        id: 'incomplete_castle',
        castleName: 'Incomplete Castle',
        country: 'Somewhere'
        // Missing required fields
      };

      expect(CastleValidator.validateStructure(incompleteCastle)).toBe(false);
    });
  });

  describe('Type Validation', () => {
    test('should validate correct data types', () => {
      const validCastle = {
        id: 'valid_castle',
        castleName: 'Valid Castle',
        country: 'Valid Country',
        location: 'Valid Location',
        architecturalStyle: 'Valid Style',
        yearBuilt: '12th century',
        shortDescription: 'A valid description.',
        keyFeatures: ['Feature 1', 'Feature 2']
      };

      expect(CastleValidator.validateTypes(validCastle)).toBe(true);
    });

    test('should reject invalid data types', () => {
      const invalidCastle = {
        id: 123, // Should be string
        castleName: 'Invalid Castle',
        country: '',  // Should not be empty
        location: 'Valid Location',
        architecturalStyle: 'Valid Style',
        yearBuilt: '12th century',
        shortDescription: 'A valid description.',
        keyFeatures: 'Not an array' // Should be array
      };

      expect(CastleValidator.validateTypes(invalidCastle)).toBe(false);
    });
  });

  describe('ID Format Validation', () => {
    test('should accept valid ID formats', () => {
      const validIds = [
        'neuschwanstein_castle',
        'edinburgh_castle',
        'castle_of_good_hope',
        'castle123',
        'my_castle_2'
      ];

      validIds.forEach(id => {
        expect(CastleValidator.validateIdFormat(id)).toBe(true);
      });
    });

    test('should reject invalid ID formats', () => {
      const invalidIds = [
        'Castle With Spaces',
        'castle-with-dashes',
        'castle.with.dots',
        'castle@with@symbols',
        'UPPERCASE_CASTLE',
        ''
      ];

      invalidIds.forEach(id => {
        expect(CastleValidator.validateIdFormat(id)).toBe(false);
      });
    });
  });

  describe('Uniqueness Validation', () => {
    test('should validate unique castles', () => {
      const uniqueCastles = [
        { id: 'castle1', castleName: 'Castle One' },
        { id: 'castle2', castleName: 'Castle Two' },
        { id: 'castle3', castleName: 'Castle Three' }
      ];

      expect(CastleValidator.validateUniqueness(uniqueCastles)).toBe(true);
    });

    test('should reject duplicate IDs', () => {
      const duplicateIds = [
        { id: 'castle1', castleName: 'Castle One' },
        { id: 'castle1', castleName: 'Castle Two' }
      ];

      expect(CastleValidator.validateUniqueness(duplicateIds)).toBe(false);
    });

    test('should reject duplicate names', () => {
      const duplicateNames = [
        { id: 'castle1', castleName: 'Same Castle' },
        { id: 'castle2', castleName: 'Same Castle' }
      ];

      expect(CastleValidator.validateUniqueness(duplicateNames)).toBe(false);
    });
  });

  describe('Real Castle Validation', () => {
    test('should accept real castle data', () => {
      const realCastle = {
        castleName: 'Windsor Castle',
        location: 'Berkshire, England',
        shortDescription: 'A royal residence at Windsor in the English county of Berkshire.'
      };

      expect(CastleValidator.validateRealCastle(realCastle)).toBe(true);
    });

    test('should reject test/mock data', () => {
      const mockCastle = {
        castleName: 'Test Castle',
        location: 'Mock Location',
        shortDescription: 'This is a sample description for testing purposes.'
      };

      expect(CastleValidator.validateRealCastle(mockCastle)).toBe(false);
    });
  });
});

// Export validator for use in other tests
module.exports = CastleValidator;