import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import './App.css';
import UserList from './components/Admin/UserList';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register';
import Navigation from './components/common/Navigation';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import FileEdit from './components/FileStorage/FileEdit.jsx';
import FileList from './components/FileStorage/FileList';
import SpecialLink from './components/FileStorage/SpecialLink.jsx';
import Home from './components/Home.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <div className="container">
            <div className="mt-5">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<RequireAuth roles={[true]}><UserList /></RequireAuth>} />
                <Route path="/files" element={<RequireAuth><FileList /></RequireAuth>} /> 
                <Route path="/files/:id/edit" element={<RequireAuth><FileEdit /></RequireAuth>} /> 
                <Route path="/files/:id/special_link" element={<RequireAuth><SpecialLink /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

function RequireAuth({ children, roles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (roles && !roles.includes(user?.is_staff)) {
    return <Navigate to="/" />;
  }
  return children;
}
export default App;

