import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Navigation() {
    const { isAuthenticated, logout, user } = useContext(AuthContext)

    return (
        <nav>
            <ul>
                <li><Link to="/">Главная</Link></li>
                {isAuthenticated ? (
                    <>
                    {user?.is_admin === true && <li><Link to='/admin'>Список пользователей</Link></li>}
                    <li> <button onClick={logout}>Выйти</button></li>
                    </>
                ):(
                    <>
                    <li> <Link to='/login'>Войти</Link></li>
                    <li> <Link to='/register'>Регистрация</Link></li>
                    </>
                )}
            </ul>
        </nav>
    )
}

export default Navigation