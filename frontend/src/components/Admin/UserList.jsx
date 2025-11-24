import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import { getAllUsers, deleteUser, updateUser } from '../services/userService';


function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteUpdateError, setDeleteUpdateError] = useState('');
   
  const fetchUsers = async () => {
    
    try {
      setLoading(true);
      setError('');
      const data = await getAllUsers();
      setUsers(data);
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
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        setDeleteUpdateError(''); 
        await deleteUser(id);
        fetchUsers(); 
      } catch (err) {
        setDeleteUpdateError('Не удалось удалить пользователя.');
      }
    }
  };
  const handleToggleAdmin = async (id, isAdmin) => {
    try {
      setDeleteUpdateError('');
      await updateUser(id, { is_staff: !isAdmin });
      fetchUsers(); 
    } catch (err) {
      setDeleteUpdateError('Не удалось изменить права пользователя.');
    }
  };
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container">
      <h2>Список пользователей</h2>
      {deleteUpdateError && <ErrorMessage message={deleteUpdateError} />}
      <div className="table-responsive">
        <table className="table table-striped">
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
                    checked={user.is_staff}
                    onChange={() => handleToggleAdmin(user.id, user.is_staff)}
                    className="form-check-input"
                  />
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.id)}>Удалить</button>
                </td>
                <td>
                  <p>Количество файлов: {user.file_count}</p> 
                  <p>Размер файлов: {user.total_size} байт</p>
                  <Link to={`/files?user_id=${user.id}`}>
                    <button className="btn btn-primary btn-sm">Управление файлами</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const userPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  fullname: PropTypes.string,
  email: PropTypes.string.isRequired,
  is_staff: PropTypes.bool.isRequired,
  file_count: PropTypes.number,
  total_size: PropTypes.number,
});

UserList.propTypes = {
  users: PropTypes.arrayOf(userPropTypes).isRequired, 
};

export default UserList;