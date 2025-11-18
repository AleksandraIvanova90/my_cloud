import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../Auth/Register.jsx';
import * as autoService from '../services/autoService.js';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('../services/autoService');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('../utils/validation', () => ({
    validateLogin: jest.fn(() => ''),
    validateEmail: jest.fn(() => ''),
    validatePassword: jest.fn(() => ''),
}));


describe('Register Component', () => {

    beforeEach(() => {
        autoService.register.mockReset();
        mockNavigate.mockReset();

       
        require('../utils/validation').validateLogin.mockReturnValue('');
        require('../utils/validation').validateEmail.mockReturnValue('');
        require('../utils/validation').validatePassword.mockReturnValue('');
    });

    it('allows the user to register successfully', async () => {
        autoService.register.mockResolvedValueOnce({}); 

        render(
            <BrowserRouter>
              <Register />
            </BrowserRouter>
          );

        const usernameInput = screen.getByLabelText(/Логин/i);
        const fullnameInput = screen.getByLabelText(/Полное имя/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Пароль/i);
        const submitButton = screen.getByRole('button', { name: /Зарегистрироваться/i });

        await userEvent.type(usernameInput, 'testuser');
        await userEvent.type(fullnameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Password123!'); 

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(autoService.register).toHaveBeenCalledWith(
                'testuser',
                'Test User',
                'test@example.com',
                'Password123!'
            );
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/api/users/login');
        });

        await waitFor(() => {
            expect(screen.getByText('Регистрация прошла успешно.')).toBeInTheDocument();
        });
    });

    it('displays an error message if registration fails', async () => {
        autoService.register.mockRejectedValueOnce(new Error('Пример ошибки для регистрации'));

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        const usernameInput = screen.getByLabelText(/Логин/i);
        const fullnameInput = screen.getByLabelText(/Полное имя/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Пароль/i);
        const submitButton = screen.getByRole('button', { name: /Зарегистрироваться/i });

        await userEvent.type(usernameInput, 'testuser');
        await userEvent.type(fullnameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Password123!');

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(autoService.register).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(screen.getByText('Ошибка регистрации', { exact: false })).toBeInTheDocument(); 
        });

        await waitFor(() => {
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
