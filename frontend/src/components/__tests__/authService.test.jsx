import { login, register } from '../services/autoService.js'

global.fetch = jest.fn();

describe('authService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('login', () => {
    it('should successfully log in a user and return data', async () => {
      const mockResponseData = { token: 'test_token', user: { username: 'testuser' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
      });

      const result = await login('testuser', 'password');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password' }),
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error if login fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Invalid credentials'),
      });

      await expect(login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw a generic error if the server returns an empty error message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve(''),
      });

      await expect(login('testuser', 'wrongpassword')).rejects.toThrow('Не удалось войти в систему.');
    });
  });

  describe('register', () => {
    it('should successfully register a user and return data', async () => {
      const mockResponseData = { id: 1, username: 'newuser', email: 'test@example.com' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponseData),
      });

      const result = await register('newuser', 'Test User', 'test@example.com', 'password');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'newuser',
          fullname: 'Test User',
          email: 'test@example.com',
          password: 'password',
        }),
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error if registration fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Username already exists'),
      });

      await expect(register('existinguser', 'Test User', 'test@example.com', 'password')).rejects.toThrow(
        'Username already exists'
      );
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
