import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from '../pages/Signup/SignupPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup/:token" element={<SignupPage />} />
            {/* Add more routes as needed */}
            <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
    );
};

export default AppRoutes;