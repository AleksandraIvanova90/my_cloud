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
    logoutButton = (
      <li className="nav-item">
        <button className="nav-link btn btn-link" onClick={logout}>
          Выйти
        </button>
      </li>
    );
  }

  if (currentPath === '/') {
    if (!isAuthenticated) {
      navigationItems.push(
        <li className="nav-item" key="login">
          <Link className="nav-link" to="/login">
            Войти
          </Link>
        </li>
      );
      navigationItems.push(
        <li className="nav-item" key="register">
          <Link className="nav-link" to="/register">
            Регистрация
          </Link>
        </li>
      );
    } else {
      
      if (user?.is_staff === true) {
        navigationItems.push(
          <li className="nav-item" key="admin">
            <Link className="nav-link" to="/admin">
              Список пользователей
            </Link>
          </li>
        );
      } else {
        navigationItems.push(
          <li className="nav-item" key="files">
            <Link className="nav-link" to="/files">
              Файлы
            </Link>
          </li>
        );
      }
    }
    showHomeLink = false;
  } else if (currentPath === '/login') {
    navigationItems.push(
      <li className="nav-item" key="home">
        <Link className="nav-link" to="/">
          Главная
        </Link>
      </li>
    );
    navigationItems.push(
      <li className="nav-item" key="register">
        <Link className="nav-link" to="/register">
          Регистрация
        </Link>
      </li>
    );
    showHomeLink = false;
  } else if (currentPath === '/register') {
    navigationItems.push(
      <li className="nav-item" key="home">
        <Link className="nav-link" to="/">
          Главная
        </Link>
      </li>
    );
    navigationItems.push(
      <li className="nav-item" key="login">
        <Link className="nav-link" to="/login">
          Войти
        </Link>
      </li>
    );
    showHomeLink = false;
  } else if (currentPath === '/files' && isAuthenticated) {
    
    if (user?.is_staff) {
      navigationItems.push(
        <li className="nav-item" key="admin">
          <Link className="nav-link" to="/admin">
            Список пользователей
          </Link>
        </li>
      );
    }
  } else if (
    currentPath.startsWith('/files/') &&
    (currentPath.endsWith('/edit') || currentPath.endsWith('/special_link')) &&
    isAuthenticated
  ) {
    navigationItems.push(
      <li className="nav-item" key="files">
        <Link className="nav-link" to="/files">
          Список файлов
        </Link>
      </li>
    );
    
    if (user?.is_staff) {
      navigationItems.push(
        <li className="nav-item" key="admin">
          <Link className="nav-link" to="/admin">
            Список пользователей
          </Link>
        </li>
      );
    }
  } else if (currentPath === '/admin' && isAuthenticated && user?.is_staff) {
 
    
  } else {
    navigationItems = [];
    showHomeLink = false;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          My Cloud
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {showHomeLink && (
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Главная
                </Link>
              </li>
            )}
            {navigationItems}
            {logoutButton}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;