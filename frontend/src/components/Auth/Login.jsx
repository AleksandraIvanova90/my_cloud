import React, { useState } from 'react';
import {login} from '../services/autoService.js'
import ErrorMessage from '../Common/ErrorMessage.jsx';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [loading, setLoading] = useState(false);  
    const [error, setError] = useState(null);
    

    const handleSubmit = async (event) => {
        event.preventDefault();
        // setLoading(true);
        setError(null);

        try {
            const data = await login(username, password);

        } catch(err) {
            setError('Неверный логин или пароль.')
        }
    }

    //     try {
    //     const response = await fetch('http://127.0.0.1:8000/api/users/login/', {
    //         method: 'POST',
    //         headers: {
    //         'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ username, password }),
    //     });

    //     const data = await response.json();

    //     if (response.ok) {
    //         onLoginSuccess(data); 
    //     } else {
    //         setError(data); 
    //         if (onError) {
    //         onError(data); 
    //         }
    //     }
    //     } catch (err) {
    //         setError({ message: 'Ошибка подключения к серверу' });
    //         if (onError) {
    //             onError({ message: 'Ошибка подключения к серверу' });
    //         }
    //         } finally {
    //             setLoading(false);
    //         }
    // };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <h2>Вход</h2>
                {error && <ErrorMessage message={error} />}
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Логин</label>
                    <input 
                        type="text" 
                        className="form-control"  
                        aria-describedby="emailHelp" 
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Пароль</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    /> 
                </div>
                <button type="submit" className="btn btn-primary" >Войти</button>
            </form>
        </>
    )
}
  
export default Login
