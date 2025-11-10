import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/context/AuthContext'
import Navigation from './components/common/Navigation';
import Home from './components/Home.jsx';
import Login from './components/Auth/Login.jsx'
import Register from './components/Auth/Register';
import UserList from './components/Admin/UserList';
import FileList from './components/FileStorage/FileList';

import './App.css';
import FileEdit from './components/FileStorage/FileEdit.jsx';
import SpecialLink from './components/FileStorage/SpecialLink.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <div className="content">
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
      </Router>
    </AuthProvider>
  );
}
function RequireAuth({ children, roles }) {
    const { user, isAuthenticated } = useAuth();
       if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    if (roles && !roles.includes(user?.is_admin)) {
        return <Navigate to="/" />;
    }
    return children;
}
export default App;

