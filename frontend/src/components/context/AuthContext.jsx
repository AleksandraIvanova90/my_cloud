
import React, { createContext, useEffect, useState, useContext } from 'react'

const AuthContext = createContext()

function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        if (storedToken && storedUser) {
            setIsAuthenticated(true)
            setUser(JSON.parse(storedUser))
        }

    },[]);

    // const setAuthInfo = (token, userData) => {
    //     localStorage.setItem('token', token)
    //     localStorage.setItem('user', JSON.stringify(userData))
    //     setIsAuthenticated(true)
    //     setUser({ ...userData, role: userData.role === 'administrator' ? 'admin' : userData.role });
    //     setUser(userData)
    //       console.log("setAuthInfo called with:", token, userData); 
    // }

        const setAuthInfo = (token, user) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setIsAuthenticated(true)
        setUser({ ...user, role: user.role === 'administrator' ? 'admin' : user.role });
        setUser(user)
          console.log("setAuthInfo called with:", token, user); 
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setUser(null)
        
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, setAuthInfo, logout }}>
            {children}
        </AuthContext.Provider>
    )
    
}

const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthContext, AuthProvider, useAuth }