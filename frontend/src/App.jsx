import Login from './components/Login'
import './App.css'

function App() {
 

  const handleLoginSuccess = (data) => {
    // Сохраняем токен и информацию о пользователе в localStorage или state
    console.log('Успешный вход:', data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const handleLoginError = (error) => {
    // Обрабатываем ошибки, например, отображаем сообщение об ошибке пользователю
    console.error('Ошибка входа:', error);
    alert('Ошибка входа: ' + (error.message || JSON.stringify(error)));
  };

  return (
    <div>
      <h1>Форма входа</h1>
      <Login onLoginSuccess={handleLoginSuccess} onError={handleLoginError} />
    </div>
  );
}

export default App
