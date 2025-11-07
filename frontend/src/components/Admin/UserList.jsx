import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUser } from '../services/userService';
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage';
import { Link } from 'react-router-dom';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
 

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      console.log(data.results)
      setUsers(data.results);
    } catch (err) {
      setError('Не удалось загрузить список пользователей.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleDeleteUser = async (id) => {
    console.log(id)
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await deleteUser(id);
        fetchUsers(); 
      } catch (err) {
        setError('Не удалось удалить пользователя.');
      }
    }
  };
  const handleToggleAdmin = async (id, isAdmin) => {
    try {
      await updateUser(id, { is_admin: !isAdmin });
      fetchUsers(); 
    } catch (err) {
      setError('Не удалось изменить права пользователя.');
    }
  };
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <h2>Список пользователей</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>Полное имя</th>
            <th>Email</th>
            <th>Администратор</th>
            <th>Действия</th>
            <th>Хранилище пользователя</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.fullname}</td>
              <td>{user.email}</td>
              <td>
                <input
                  type="checkbox"
                  checked={user.is_admin}
                  onChange={() => handleToggleAdmin(user.id, user.is_admin)}
                />
              </td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
              </td>
              <td>
          <p>Количество файлов: {user.file_count}</p> 
          <p>Размер файлов: {user.total_size} байт</p>
          <Link to={`/files?user_id=${user.id}`}>
    <button>Управление файлами</button>
</Link>
          </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default UserList;