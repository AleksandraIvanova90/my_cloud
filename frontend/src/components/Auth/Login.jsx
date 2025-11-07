import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import {login} from '../services/autoService.js'
import ErrorMessage from '../common/ErrorMessage.jsx';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setAuthInfo }= useContext(AuthContext)
    const navigate = useNavigate()
    

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const data = await login(username, password);
            console.log(data)
            setAuthInfo(data.token, data.user)
            if(data.user.is_admin) {
                navigate('/admin')
            } else {
                navigate(`/files?user_id=${data.user.id}`)
            }
        } catch (err) {
            setError('Неверный логин или пароль.')
    }
}

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
