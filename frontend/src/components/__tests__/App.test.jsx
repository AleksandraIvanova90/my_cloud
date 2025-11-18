import { render, screen } from '@testing-library/react';
import App from '../../App.jsx';

jest.mock('../context/AuthContext', () => {
  const React = require('react'); 
  const MockAuthContext = React.createContext(null); 

  return {
    AuthContext: MockAuthContext, 
    useAuth: () => ({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    }),
    AuthProvider: ({ children }) => (
      <MockAuthContext.Provider value={{
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      }}>
        {children}
      </MockAuthContext.Provider>
    ),
  };
});

describe('App Component', () => {
  it('renders the home page when not authenticated', () => {
    render( <App />);
    const homeElement = screen.getByText(/My Cloud: Ваше персональное облачное пространство/i);
    expect(homeElement).toBeInTheDocument();
  });

  it('renders the login page route', () => {
    render(<App />);
    const loginLink = screen.getByRole('link', { name: /Войти/i });
    expect(loginLink).toBeInTheDocument();
  });
});
