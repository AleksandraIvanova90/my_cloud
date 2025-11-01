import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register.jsx'
import './App.css'
import UserList from './components/Admin/UserList.jsx';

function App() {
 

  const handleLoginSuccess = (data) => {
    // Сохраняем токен и информацию о пользователе в localStorage или state
    console.log('Успешный вход:', JSON.stringify(data.user));
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
      {/* <h1>Форма входа</h1> */}
      {/* <Login onLoginSuccess={handleLoginSuccess} onError={handleLoginError} /> */}
      <Register />
      {/* {<UserList />} */}
      {/* <Login /> */}
    </div>
  );
}

export default App
