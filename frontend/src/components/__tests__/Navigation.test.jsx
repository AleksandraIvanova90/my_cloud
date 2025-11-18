import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from '../common/Navigation.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(), 
}));

const renderWithContextAndRouter = (authContextValue, route = '/') => {
    mockUseLocation.mockReturnValue({
        pathname: route,
        search: '',
        hash: '',
        state: null,
        key: 'testKey',
    });

    return render(
        <MemoryRouter initialEntries={[route]}>
            <AuthContext.Provider value={authContextValue}>
                <Navigation />
            </AuthContext.Provider>
        </MemoryRouter>
    );
};

describe('Navigation Component', () => {
    it('renders login and register links when not authenticated on home page', () => {
        const authContextValue = {
            isAuthenticated: false,
            user: null,
            logout: jest.fn(),
        };
        renderWithContextAndRouter(authContextValue, '/');

        expect(screen.getByText(/Войти/i)).toBeInTheDocument();
        expect(screen.getByText(/Регистрация/i)).toBeInTheDocument();
    });

    it('renders admin link when authenticated as admin on home page', () => {
        const authContextValue = {
            isAuthenticated: true,
            user: { is_staff: true },
            logout: jest.fn(),
        };
        renderWithContextAndRouter(authContextValue, '/');

        expect(screen.getByText(/Список пользователей/i)).toBeInTheDocument();
    });

    it('renders files link when authenticated as regular user on home page', () => {
        const authContextValue = {
            isAuthenticated: true,
            user: { is_staff: false },
            logout: jest.fn(),
        };
        renderWithContextAndRouter(authContextValue, '/');

        expect(screen.getByText(/Файлы/i)).toBeInTheDocument();
    });

    it('renders logout button when authenticated', () => {
        const authContextValue = {
            isAuthenticated: true,
            user: { is_staff: false },
            logout: jest.fn(),
        };
        renderWithContextAndRouter(authContextValue, '/');

        expect(screen.getByText(/Выйти/i)).toBeInTheDocument();
    });
});
