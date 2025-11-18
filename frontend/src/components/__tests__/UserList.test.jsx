import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserList from '../Admin/UserList.jsx';
import * as userService from '../services/userService.js';
import { BrowserRouter as Router } from 'react-router-dom'; 

jest.mock('../services/userService');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('UserList Component', () => {
  const mockUsers = [
    { id: 1, username: 'testuser1', fullname: 'Test User 1', email: 'test1@example.com', is_staff: false, file_count: 10, total_size: 1024 },
    { id: 2, username: 'testuser2', fullname: 'Test User 2', email: 'test2@example.com', is_staff: true, file_count: 5, total_size: 512 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userService.getAllUsers.mockResolvedValue(mockUsers);
    userService.updateUser.mockResolvedValue({});
  });


  it('renders the list of users', async () => {
    render(<UserList />);
    const user1Element = await screen.findByText('Test User 1');
    expect(user1Element).toBeInTheDocument();
  });

 
  it('renders the list of users', async () => {
    await act(async () => {
      render(
        <Router>
          <UserList />
        </Router>
      );
    });

    const user1Element = await screen.findByText('Test User 1');
    expect(user1Element).toBeInTheDocument();
    expect(screen.getByText('testuser2')).toBeInTheDocument();
  });

    it('toggles admin status correctly', async () => {
    userService.getAllUsers.mockResolvedValueOnce(mockUsers); 
    userService.updateUser.mockResolvedValueOnce({}); 
    userService.getAllUsers.mockResolvedValueOnce([ 
      { id: 1, username: 'testuser1', fullname: 'Test User 1', email: 'test1@example.com', is_staff: true, file_count: 10, total_size: 1024 },
      { id: 2, username: 'testuser2', fullname: 'Test User 2', email: 'test2@example.com', is_staff: true, file_count: 5, total_size: 512 },
    ]);

    await act(async () => {
      render(
        <Router>
          <UserList />
        </Router>
      );
    });

    const user1Element = await screen.findByText('Test User 1');
    expect(user1Element).toBeInTheDocument();

    const user1Row = screen.getByText('Test User 1').closest('tr');
    const checkbox = user1Row.querySelector('input[type="checkbox"]');

    expect(checkbox).not.toBeChecked(); 

    await act(async () => {
      userEvent.click(checkbox);
    });

    await waitFor(() => {
        expect(userService.updateUser).toHaveBeenCalledTimes(1);
    });

    expect(userService.updateUser).toHaveBeenCalledWith(1, { is_staff: true });

     await waitFor(() => {
        expect(userService.getAllUsers).toHaveBeenCalledTimes(2);
    });

    const updatedUser1Row = screen.getByText('Test User 1').closest('tr');
    const updatedCheckbox = updatedUser1Row.querySelector('input[type="checkbox"]');

    await waitFor(() => {
      expect(updatedCheckbox).toBeChecked();
    });

  });

   it('deletes a user correctly', async () => {
    userService.getAllUsers.mockResolvedValueOnce(mockUsers); 
    userService.deleteUser.mockResolvedValueOnce({}); 
    userService.getAllUsers.mockResolvedValueOnce([ 
      { id: 2, username: 'testuser2', fullname: 'Test User 2', email: 'test2@example.com', is_staff: true, file_count: 5, total_size: 512 },
    ]);

    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    await act(async () => {
      render(
        <Router>
          <UserList />
        </Router>
      );
    });

    const user1Element = await screen.findByText('Test User 1');
    expect(user1Element).toBeInTheDocument();

    const user1Row = user1Element.closest('tr');
    const deleteButtonForUser1 = user1Row.querySelector('.btn-danger'); 

    expect(deleteButtonForUser1).toBeInTheDocument();

    await act(async () => {
      userEvent.click(deleteButtonForUser1); 
    });

    await waitFor(() => { 
        expect(confirmSpy).toHaveBeenCalledTimes(1);
    });
    expect(confirmSpy).toHaveBeenCalledWith('Вы уверены, что хотите удалить этого пользователя?');

    await waitFor(() => { 
        expect(userService.deleteUser).toHaveBeenCalledTimes(1);
    });
    expect(userService.deleteUser).toHaveBeenCalledWith(1);


    await waitFor(() => {
      expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test User 2')).toBeInTheDocument();

    confirmSpy.mockRestore(); 
  });

  it('displays error message if fetching users fails', async () => {
    const errorMessage = 'Не удалось загрузить список пользователей.';
    userService.getAllUsers.mockRejectedValue(new Error(errorMessage)); 

    await act(async () => {
      render(
        <Router>
          <UserList />
        </Router>
      );
    });

    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

 it('displays error message if deleting user fails', async () => {
    userService.getAllUsers.mockResolvedValueOnce(mockUsers);
    userService.deleteUser.mockRejectedValue(new Error('Failed to delete'));
    const errorMessage = 'Не удалось удалить пользователя.';
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await act(async () => {
      render(
        <Router>
          <UserList />
        </Router>
      );
    });

    await screen.findByText('Test User 1');
    const deleteButton = screen.getAllByText('Удалить')[0];
    await act(async () => {
      userEvent.click(deleteButton);
    });

    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();

    expect(screen.getByText('Test User 1')).toBeInTheDocument();
});

});
