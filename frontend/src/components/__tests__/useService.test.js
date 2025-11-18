import { getAllUsers, updateUser, deleteUser } from '../services/userService';

describe('userService', () => {
  const mockToken = 'test-token';
  const mockUsers = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];
  const mockUser = { id: 1, username: 'testuser', name: 'User 1' }; 

  beforeEach(() => {
    localStorage.setItem('token', mockToken);
    global.fetch = jest.fn(); 
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks(); 
  });

  describe('getAllUsers', () => {
    it('should successfully fetch all users', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers),
      });

      const users = await getAllUsers();

      expect(fetch).toHaveBeenCalledWith('/api/users/users', {
        headers: {
          'Authorization': `Token ${mockToken}`
        }
      });
      expect(users).toEqual(mockUsers);
    });

    it('should throw an error if fetching users fails', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('Failed to fetch'),
      });

      await expect(getAllUsers()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
      });

      await deleteUser(1);

      expect(fetch).toHaveBeenCalledWith('/api/users/1/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${mockToken}`
        }
      });
    });

    it('should throw an error if deleting a user fails', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('Failed to delete'),
      });

      await expect(deleteUser(1)).rejects.toThrow('Failed to delete');
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      const updatedData = { name: 'Updated Name' };
      const mergedData = { ...updatedData, username: mockUser.username };

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser), 
        })
      );

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mergedData), 
        })
      );

      const result = await updateUser(1, updatedData); 

      expect(fetch).toHaveBeenCalledTimes(2); 

      expect(fetch).toHaveBeenNthCalledWith(1, `/api/users/1/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${mockToken}`,
        },
      });


      expect(fetch).toHaveBeenNthCalledWith(2, `/api/users/1/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${mockToken}`,
        },
        body: JSON.stringify(mergedData),
      });



      expect(result).toEqual(mergedData);
    });

    it('should throw an error if getting user data fails', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('Failed to get user data'),
      });

      await expect(updateUser(1, { name: 'Updated Name' })).rejects.toThrow('Failed to get user data');
    });

    it('should throw an error if updating a user fails', async () => {

      const updatedData = { name: 'Updated Name' };
      const mergedData = { ...updatedData, username: mockUser.username };

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser), 
        })
      );


      global.fetch.mockImplementationOnce(() => {
        return Promise.resolve({
          ok: false,
          text: jest.fn().mockResolvedValue('Failed to update user'),
        });
      });

      await expect(updateUser(1, { name: 'Updated Name' })).rejects.toThrow('Failed to update user');
    });
  });
});
