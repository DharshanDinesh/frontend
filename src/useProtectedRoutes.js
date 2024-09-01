
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ element }) => {
    const { user } = useAuth();
    return user ? element : <Navigate to="/login" />;
};

