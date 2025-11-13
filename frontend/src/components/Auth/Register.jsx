import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {validateLogin, validateEmail, validatePassword} from '../ utils/validation.js';
import ErrorMessage from '../common/ErrorMessage.jsx';
import { register } from '../services/autoService.js';

function Register() {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError({});
    setSuccessMessage('');
    const validationErrors = {
      username: validateLogin(username),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    if (Object.values(validationErrors).some(error => error != '')){
      setError(validationErrors);
      return;
    }
    try {
      await register(username, fullname, email, password);
      setSuccessMessage('Регистрация прошла успешно.');
      navigate('/api/users/login');
    } catch(err) {
      setError({form: 'Ошибка регистрации'});          
    }
  };  

  return (
    <div className="container"> 
      <form onSubmit={handleSubmit}>
        <h2>Регистрация</h2>
        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errors.form && <ErrorMessage message={errors.form} />}
        <div className="mb-3">
          <label className="form-label" htmlFor="username">Логин</label>
          <input 
            type="text" 
            id="username"
            value={username}
            className="form-control form-control-lg"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {errors.username && <ErrorMessage message={errors.username} />}    
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="fullname">Полное имя</label>
          <input 
            type="text" 
            id="fullname"
            value={fullname}
            className="form-control form-control-lg"
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="femail">Email</label>
          <input 
            type="email" 
            id="email"
            value={email}
            className="form-control form-control-lg"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <ErrorMessage message={errors.email} />}
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="password">Пароль</label>
          <input 
            type="password" 
            id="password"
            value={password}
            className="form-control form-control-lg"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <ErrorMessage message={errors.password} />}
        </div>
        <div className="d-flex justify-content-center">
          <button  type="submit" className="btn btn-success btn-lg">Зарегистрироваться</button>
        </div>
      </form>
    </div>
  );
}

export default Register;