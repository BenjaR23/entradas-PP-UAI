import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function AuthPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAttributes, setUserAttributes] = useState({
        usermail: '',
        userID: '',
        userName: '',
    });
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        setUserAttributes({
            usermail: '',
            userID: '',
            userName: '',
        });
        navigate('/');
    };

    useEffect(() => {
        const verifyToken = () => {
            const userToken = localStorage.getItem('userToken');
            
            if (userToken) {
                try {
                    // ✅ Decodificar el payload del JWT
                    const base64Url = userToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const decodedPayload = JSON.parse(atob(base64));

                    setIsLoggedIn(true);
                    setUserAttributes({
                        usermail: decodedPayload.userEmail,
                        userID: decodedPayload.userId,
                        userName: decodedPayload.userName,
                    });
                } catch (error) {
                    console.error("Token decoding failed:", error);
                    localStorage.removeItem('userToken');
                }
            }
        };
        verifyToken();
    }, []);

    if (isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
                <p className="text-lg mb-8">You are already logged in.</p>
                <p className="text-lg mb-8">User Email: {userAttributes.usermail}</p>
                <p className="text-lg mb-8">User ID: {userAttributes.userID}</p>
                <p className="text-lg mb-8">User Name: {userAttributes.userName}</p>
                <Link to="/" className="mb-4 text-blue-500 hover:underline">Go to Home</Link>
                <button onClick={logout} className="mb-4 text-red-500 hover:underline">Logout</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Auth Page (Under construction)</h1>
            <p className="text-lg mb-8">Please log in to continue or register if you don't have an account.</p>
            <Link to="/login" className="mb-4 text-blue-500 hover:underline">Log In</Link>
            <Link to="/register" className="mb-4 text-blue-500 hover:underline">Register</Link>
        </div>
    );
}

export default AuthPage;
