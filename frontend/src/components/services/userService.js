const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://127.0.0.1:8000/api/users/users',{
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось получить список пользователей.');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    throw error;
  }

};

const deleteUser = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось удалить пользователя.');
    }

  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    throw error;
  }
};

const updateUser = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось получить информацию о пользователе.');
    }
    const user = await response.json();

   
    const updateData = {
      ...data,
      username: user.username 
    };

    console.log(updateData);

    const updateResponse = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      const message = await updateResponse.text();
      throw new Error(message || 'Не удалось обновить пользователя.');
    }
    return await updateResponse.json();

  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    throw error;
  }
};



export {getAllUsers, updateUser, deleteUser};