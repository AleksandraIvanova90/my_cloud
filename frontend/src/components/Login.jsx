import React, { useState } from 'react';

function Login({ onLoginSuccess, onError }) {
    const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/login/', { // Убедитесь, что URL правильный для вашей настройки
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешный вход
        onLoginSuccess(data); // Передаем данные пользователя и токен родительскому компоненту
      } else {
        // Обработка ошибок с бэкенда
        setError(data); //  или data.message, если бэкенд возвращает сообщение об ошибке
        if (onError) {
          onError(data); // Передаем ошибку родительскому компоненту для отображения
        }
      }
    } catch (err) {
      // Ошибка сети или другая ошибка
      setError({ message: 'Ошибка подключения к серверу' });
      if (onError) {
        onError({ message: 'Ошибка подключения к серверу' });
      }
    } finally {
      setLoading(false);
    }
  };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">Логин</label>
                    <input 
                        type="text" 
                        class="form-control"  
                        aria-describedby="emailHelp" 
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                    />
                </div>
                <div class="mb-3">
                    <label for="exampleInputPassword1" class="form-label">Пароль</label>
                    <input 
                        type="password" 
                        class="form-control" 
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    /> 
                </div>
                <button type="submit" class="btn btn-primary" disabled={loading}>{loading ? 'Входим...' : 'Войти'}</button>
            </form>
        </>
    )
}
  
export default Login
