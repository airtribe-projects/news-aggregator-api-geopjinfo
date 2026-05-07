import {
  validatePreferences,
} from '../../../src/utils/validators.js';

describe('Utility - Validators', () => {
  describe('validatePreferences', () => {
    it('should not throw for valid preferences', () => {
      expect(() =>
        validatePreferences(['technology', 'sports'], ['en', 'fr'], 'us', ['bitcoin'], ['bbc-news'])
      ).not.toThrow();
    });

    it('should not throw for empty/undefined preferences', () => {
      expect(() => validatePreferences(undefined, undefined, undefined, undefined, undefined)).not.toThrow();
    });

    it('should throw 400 for invalid category', () => {
      expect(() =>
        validatePreferences(['invalid_cat'], ['en'], 'us', [], [])
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('should throw 400 for invalid language code', () => {
      expect(() =>
        validatePreferences(['technology'], ['xx'], 'us', [], [])
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('should throw 400 for invalid country code', () => {
      expect(() =>
        validatePreferences(['technology'], ['en'], 'zz', [], [])
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('should throw 400 if keywords is not an array', () => {
      expect(() =>
        validatePreferences([], ['en'], 'us', 'bitcoin', [])
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('should throw 400 if sources is not an array', () => {
      expect(() =>
        validatePreferences([], ['en'], 'us', [], 'bbc-news')
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('should throw 400 if keywords contains empty strings', () => {
      expect(() =>
        validatePreferences([], ['en'], 'us', ['', 'valid'], [])
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });
  });
});
