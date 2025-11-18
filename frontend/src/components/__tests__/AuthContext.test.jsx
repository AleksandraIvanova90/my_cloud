import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react'; 
import { AuthProvider, useAuth, AuthContext } from '../context/AuthContext'; 
import { AuthProvider as MockAuthProvider } from '../context/AuthContext'; 
import { renderHook } from '@testing-library/react';

beforeEach(() => {
  localStorage.clear();
});

describe('AuthProvider', () => {
   it('должен загружать информацию об аутентификации из localStorage при монтировании', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' })); 

    const TestComponent = () => {
      const { isAuthenticated, user, loading } = useAuth();

      return (
        <div>
          {loading ? (
            <div data-testid="loading">Загрузка...</div> 
          ) : (
            <>
              <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div> // Отображаем значение isAuthenticated
              <div data-testid="username">{user.username}</div> // Отображаем имя пользователя
            </>
          )}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => screen.getByText(/testuser/i))

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true'); 
    expect(screen.getByTestId('username')).toHaveTextContent('testuser'); 
  });

  
  it('должен устанавливать информацию об аутентификации и сохранять в localStorage при вызове setAuthInfo', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider }); 
    act(() => {
      result.current.setAuthInfo('new-token', { id: 2, username: 'newuser' }); 
    });

    expect(result.current.isAuthenticated).toBe(true); 
    expect(result.current.user).toEqual({ id: 2, username: 'newuser' }); 
    expect(localStorage.getItem('token')).toBe('new-token'); 
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ id: 2, username: 'newuser' })); 
  });

 
  it('должен очищать информацию об аутентификации и localStorage при вызове logout', () => {
    localStorage.setItem('token', 'initial-token'); 
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'initialuser' })); 

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider }); 

    act(() => {
      result.current.logout(); 
    });

    expect(result.current.isAuthenticated).toBe(false); 
    expect(result.current.user).toBeNull(); 
    expect(localStorage.getItem('token')).toBeNull(); 
    expect(localStorage.getItem('user')).toBeNull(); 
  });

 
  it('должен обрабатывать некорректный JSON в localStorage без сбоев', () => {
    localStorage.setItem('token', 'some-token'); 
    localStorage.setItem('user', 'invalid-json');

    const TestComponent = () => {
      const { isAuthenticated, user, loading } = useAuth();

      return (
        <div>
          {loading ? (
            <div data-testid="loading">Загрузка...</div> 
          ) : (
            <>
              <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div> // Отображаем значение isAuthenticated
              {user && <div data-testid="username">{user.username}</div>} // Отображаем имя пользователя (если user существует)
            </>
          )}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    return waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });
});


