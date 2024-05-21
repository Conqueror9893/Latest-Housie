// generateJoiningCode.test.js
const generateJoiningCode = require('../../utils/generateJoiningCode');

describe('generateJoiningCode', () => {
  test('should return a string of length 6', () => {
    const code = generateJoiningCode();
    expect(typeof code).toBe('string');
    expect(code.length).toBe(6);
  });

  test('should return a string containing only uppercase letters and digits', () => {
    const code = generateJoiningCode();
    const regex = /^[A-Z0-9]*$/; // Regular expression to match uppercase letters and digits
    expect(regex.test(code)).toBe(true);
  });

  test('should generate unique codes for multiple invocations', () => {
    const code1 = generateJoiningCode();
    const code2 = generateJoiningCode();
    expect(code1).not.toBe(code2);
  });

  test('should return a different code each time when called in rapid succession', () => {
    const codes = new Set();
    for (let i = 0; i < 1000; i++) {
      const code = generateJoiningCode();
      expect(codes.has(code)).toBe(false);
      codes.add(code);
    }
  });

  test('should return different codes for different lengths', () => {
    const codeLengths = new Set();
    for (let i = 0; i < 1000; i++) {
      const code = generateJoiningCode();
      codeLengths.add(code.length);
    }
    expect(codeLengths.size).toBeGreaterThan(1);
  });

  test('should return codes that are not all the same', () => {
    let allSame = true;
    const code = generateJoiningCode();
    for (let i = 0; i < 1000; i++) {
      const newCode = generateJoiningCode();
      if (code !== newCode) {
        allSame = false;
        break;
      }
    }
    expect(allSame).toBe(false);
  });
});