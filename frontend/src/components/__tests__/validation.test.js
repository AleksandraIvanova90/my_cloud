import { validateLogin, validateEmail, validatePassword } from '../utils/validation.js'

describe('Validation functions', () => {
  describe('validateLogin', () => {
    it('should return an empty string for a valid login', () => {
      expect(validateLogin('testLogin123')).toBe('');
      expect(validateLogin('validLogin')).toBe('');
    });

    it('should return an error message for a login that does not start with a letter', () => {
      expect(validateLogin('1testLogin')).toBe(
        'Логин должен содержать только латинские буквы и цифры, начинаться с буквы и быть длиной от 4 до 20 символов.'
      );
    });

    it('should return an error message for a login with invalid characters', () => {
      expect(validateLogin('test-login')).toBe(
        'Логин должен содержать только латинские буквы и цифры, начинаться с буквы и быть длиной от 4 до 20 символов.'
      );
    });

    it('should return an error message for a login that is too short', () => {
      expect(validateLogin('abc')).toBe(
        'Логин должен содержать только латинские буквы и цифры, начинаться с буквы и быть длиной от 4 до 20 символов.'
      );
    });

    it('should return an error message for a login that is too long', () => {
      expect(validateLogin('thisLoginIsTooLongToBeValid')).toBe(
        'Логин должен содержать только латинские буквы и цифры, начинаться с буквы и быть длиной от 4 до 20 символов.'
      );
    });
  });

  describe('validateEmail', () => {
    it('should return an empty string for a valid email', () => {
      expect(validateEmail('test@example.com')).toBe('');
      expect(validateEmail('valid.email@subdomain.example.co.uk')).toBe('');
    });

    it('should return an error message for an email without an @ symbol', () => {
      expect(validateEmail('testexample.com')).toBe('Неверный формат email.');
    });

    it('should return an error message for an email without a domain', () => {
      expect(validateEmail('test@')).toBe('Неверный формат email.');
    });

    it('should return an error message for an email without a top-level domain', () => {
      expect(validateEmail('test@example')).toBe('Неверный формат email.');
    });

    it('should return an error message for an email with spaces', () => {
      expect(validateEmail('test @example.com')).toBe('Неверный формат email.');
    });
  });

  describe('validatePassword', () => {
    it('should return an empty string for a valid password', () => {
      expect(validatePassword('StrongPass123!')).toBe('');
      expect(validatePassword('P@sswOrd1')).toBe('');
    });

    it('should return an error message for a password that is too short', () => {
      expect(validatePassword('Short!1')).toBe(
        'Пароль должен содержать не менее 8 символов, как минимум одну заглавную букву, одну цифру и один специальный символ.'
      );
    });

    it('should return an error message for a password without an uppercase letter', () => {
      expect(validatePassword('password123!')).toBe(
        'Пароль должен содержать не менее 8 символов, как минимум одну заглавную букву, одну цифру и один специальный символ.'
      );
    });

    it('should return an error message for a password without a digit', () => {
      expect(validatePassword('Password!')).toBe(
        'Пароль должен содержать не менее 8 символов, как минимум одну заглавную букву, одну цифру и один специальный символ.'
      );
    });

    it('should return an error message for a password without a special character', () => {
      expect(validatePassword('Password123')).toBe(
        'Пароль должен содержать не менее 8 символов, как минимум одну заглавную букву, одну цифру и один специальный символ.'
      );
    });
  });
});
