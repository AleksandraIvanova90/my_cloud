const login = async(username, password) => {
  const response = await fetch('http://127.0.0.1:8000/api/users/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),       
  });
    

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Не удалось войти в систему.');
  }
  return await response.json();
};

const register = async(username, fullname, email, password) => {
  const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, fullname, email, password}),       
  });
    
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Не удалось зарегистрироваться.');
  }

  return await response.json();
};

export {login, register};