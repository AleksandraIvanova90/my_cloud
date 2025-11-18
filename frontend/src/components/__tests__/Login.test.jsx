import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Auth/Login.jsx';
import * as autoService from '../services/autoService.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../common/ErrorMessage.jsx', () => {
  return function MockErrorMessage({ message }) {
    return <div data-testid="error-message">{message}</div>;
  };
});




jest.mock('../services/autoService');

const mockSetAuthInfo = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


describe('Login Component', () => {

  const renderWithContext = (ui) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ setAuthInfo: mockSetAuthInfo }}>
                {ui}
            </AuthContext.Provider>
        </BrowserRouter>
    );
};
  beforeEach(() => {
    autoService.login.mockReset();
    mockSetAuthInfo.mockReset();
    mockNavigate.mockReset();
  });

  it('allows the user to login', async () => {
    autoService.login.mockResolvedValue({
      token: 'mockToken',
      user: { id: 1, username: 'testuser', is_staff: false },
      });

    renderWithContext(<Login />);

    const usernameInput = screen.getByLabelText(/Логин/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const submitButton = screen.getByRole('button', { name: /Войти/i });

   
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password');
    await userEvent.click(submitButton);
        
    await waitFor(() => {
            
      expect(autoService.login).toHaveBeenCalledWith('testuser', 'password');
            
      expect(mockSetAuthInfo).toHaveBeenCalledWith('mockToken', { id: 1, username: 'testuser', is_staff: false });
            
      expect(mockNavigate).toHaveBeenCalledWith('/files?user_id=1');
    });
  });

  it('displays an error message on failed login', async () => {
    autoService.login.mockRejectedValue(new Error('Invalid credentials'));

        renderWithContext(<Login />);

        const usernameInput = screen.getByLabelText(/Логин/i);
        const passwordInput = screen.getByLabelText(/Пароль/i);
        const submitButton = screen.getByRole('button', { name: /Войти/i });

        await userEvent.type(usernameInput, 'testuser');
        await userEvent.type(passwordInput, 'password');
        await userEvent.click(submitButton);

        const errorMessageElement = await screen.findByTestId('error-message', { timeout: 4000 });

        await waitFor(() => {
            expect(errorMessageElement).toHaveTextContent('Неверный логин или пароль.');
            expect(mockNavigate).not.toHaveBeenCalled(); 
            expect(mockSetAuthInfo).not.toHaveBeenCalled();
        });
    });
    
});
