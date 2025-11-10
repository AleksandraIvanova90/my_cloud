import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navigation() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;

  let navigationItems = [];
  let showHomeLink = true;
  let logoutButton = null; 

  if (isAuthenticated) {
    logoutButton = <li><button onClick={logout}>Выйти</button></li>; 
  }

  if (currentPath === '/') {
    if (!isAuthenticated) {
      navigationItems.push(<li key="login"><Link to='/login'>Войти</Link></li>);
      navigationItems.push(<li key="register"><Link to='/register'>Регистрация</Link></li>);
    } else {
      if (user?.is_admin === true) {
        navigationItems.push(<li key="admin"><Link to='/admin'>Список пользователей</Link></li>);
      } else {
        navigationItems.push(<li key="files"><Link to='/files'>Файлы</Link></li>);
      }
    }
    showHomeLink = false; 
  } else if (currentPath === '/login') {
    navigationItems.push(<li key="home"><Link to='/'>Главная</Link></li>);
    navigationItems.push(<li key="register"><Link to='/register'>Регистрация</Link></li>);
    showHomeLink = false;
  } else if (currentPath === '/register') {
    navigationItems.push(<li key="home"><Link to='/'>Главная</Link></li>);
    navigationItems.push(<li key="login"><Link to='/login'>Войти</Link></li>);
    showHomeLink = false;
  } else if (currentPath === '/files' && isAuthenticated) {
    if (user?.is_admin) {
      navigationItems.push(<li key="admin"><Link to='/admin'>Список пользователей</Link></li>);
    }
  } else if (
    currentPath.startsWith('/files/') &&
    (currentPath.endsWith('/edit') || currentPath.endsWith('/special_link')) &&
    isAuthenticated
  ) {
    navigationItems.push(<li key="files"><Link to='/files'>Список файлов</Link></li>);
    if (user?.is_admin) {
      navigationItems.push(<li key="admin"><Link to='/admin'>Список пользователей</Link></li>);
    }
  } else if (currentPath === '/admin' && isAuthenticated && user?.is_admin) {
   
  } else {
    navigationItems = [];
    showHomeLink = false; 
  }

  return (
    <nav>
      <ul>
        {showHomeLink && <li><Link to='/'>Главная</Link></li>}
        {navigationItems}
        {logoutButton} 
      </ul>
    </nav>
  );
}

export default Navigation;
