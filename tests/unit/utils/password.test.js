import { hashPassword, comparePassword } from '../../../src/utils/password.js';

describe('Utils - password', () => {
  describe('hashPassword', () => {
    it('should return a bcrypt hash string', async () => {
      const hash = await hashPassword('MyPassword1!');
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2b\$/);
    });

    it('should produce different hashes for the same password', async () => {
      const hash1 = await hashPassword('MyPassword1!');
      const hash2 = await hashPassword('MyPassword1!');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const hash = await hashPassword('CorrectPass1!');
      const result = await comparePassword('CorrectPass1!', hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await hashPassword('CorrectPass1!');
      const result = await comparePassword('WrongPass1!', hash);
      expect(result).toBe(false);
    });
  });
});
