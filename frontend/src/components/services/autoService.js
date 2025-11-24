
const login = async (username, password) => {
  try {
    const response = await fetch('/api/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password}),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось войти в систему.');
    }

    try {
      return await response.json(); 
    } catch (jsonError) {
      console.error('Ошибка при парсинге JSON:', jsonError);
      throw new Error('Не удалось обработать ответ сервера.');  
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error; 
  }
};

const register = async (username, fullname, email, password) => {
  try {
    const response = await fetch('/api/users/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, fullname, email, password}),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось зарегистрироваться.');
    }

    try {
      return await response.json(); 
    } catch (jsonError) {
      console.error('Ошибка при парсинге JSON:', jsonError);
      throw new Error('Не удалось обработать ответ сервера.'); 
    }
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error; 
  }
};

export {login, register};
