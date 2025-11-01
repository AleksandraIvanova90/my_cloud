import React, { useState } from 'react';
import { register } from '../services/autoService.js'
import {validateLogin, validateEmail, validatePassword} from '../ utils/validation.js';
import ErrorMessage from '../Common/ErrorMessage.jsx';

function Register() {

    const [username, setUsername] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setError] = useState({});
    const [successMessage, setSuccessMessage] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault();
        // setLoading(true);
        setError({});
        setSuccessMessage('')
        const validationErrors = {
                username: validateLogin(username),
                email: validateEmail(email),
                password: validatePassword(password),
            }
        if (Object.values(validationErrors).some(error => error != '')){
            setError(validationErrors)
            return
        }
        try {
            const data = await register(username, fullname, email, password)
            setSuccessMessage('Регистрация прошла успешно.')
        } catch(err) {
            setError({form: 'Ошибка регистрации'})          
        }
    };

    //     try {
    //         const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
    //             method: 'POST',
    //             headers: {
    //             'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ username, password, fullname, email}),
    //         });

    //         const data = await response.json();

    //         console.log(data)

    //         if (response.ok) {
               
    //             alert('User registered successfully!');
    //         } else {
               

    //             console.log(data)
    //             setError(data); 
    //             if (onError) {
    //             onError(data);
    //             }
    //         }
    //     } catch (err) {
            
    //         setError({ message: 'Ошибка подключения к серверу' });
    //         if (onError) {
    //             onError({ message: 'Ошибка подключения к серверу' });
    //         }
    //         } finally {
    //             setLoading(false);
    //         }
    

    return (
        <>
        <form onSubmit={handleSubmit}>
            <h2>Регистрация</h2>
            {successMessage && <p className='success-message'>{successMessage}</p>}
            {errors.form && <ErrorMessage message={errors.form} />}

                <div data-mdb-input-init className="form-outline mb-4">
                    <label className="form-label" htmlFor="form3Example1cg">Логин</label>
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

                <div data-mdb-input-init className="form-outline mb-4">
                  <label className="form-label" htmlFor="form3Example1cg">Полное имя</label>
                   <input 
                        type="text" 
                        id="fullname"
                        value={fullname}
                        className="form-control form-control-lg"
                        onChange={(e) => setFullname(e.target.value)}
                        required
                    />
                </div>

                <div data-mdb-input-init className="form-outline mb-4">
                  <label className="form-label" htmlFor="form3Example3cg">Email</label>
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

                <div data-mdb-input-init className="form-outline mb-4">
                  <label className="form-label" htmlFor="form3Example4cg">Пароль</label>
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
                  <button  type="submit" data-mdb-button-init
                    data-mdb-ripple-init className="btn btn-success btn-block btn-lg gradient-custom-4 text-body">Зарегистрироваться</button>
                </div>

              </form>
              </>
    )
}

export default Register