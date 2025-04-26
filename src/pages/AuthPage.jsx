import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function AuthPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [userAtributes, setUserAtributes] = useState({
        usermail: '',
        userID: '',
        userName: '',})

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        setUserAtributes({
            usermail: '',
            userID: '',
            userName: '',})
        navigate('/')
    }

    useEffect(() => {
        const verifyToken = async () => {
            const userToken = localStorage.getItem('userToken');
            if (userToken) {
                try {
                    const response = await fetch('http://localhost:8080/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: userToken }),
                    });
    
                    const tokendata = await response.json();
                    if (tokendata.status === 'success') {
                        setIsLoggedIn(true);
                        setUserAtributes({
                            usermail: tokendata.items.userEmail,
                            userID: tokendata.items.userId,
                            userName: tokendata.items.userName,
                        });
                    }
                } catch (error) {
                    console.error("Token verification failed:", error);
                }
            }
        };
        verifyToken()}, [])
    
    if (isLoggedIn === true) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
                <p className="text-lg mb-8">You are already logged in.</p>
                <p className="text-lg mb-8">User Email: {userAtributes.usermail}</p>
                <p className="text-lg mb-8">User ID: {userAtributes.userID}</p>
                <p className="text-lg mb-8">User Name: {userAtributes.userName}</p>
                <Link to="/home" className="mb-4 text-blue-500 hover:underline">Go to Home</Link>
                <button onClick={logout} className="mb-4 text-red-500 hover:underline">Logout</button>
            </div>
        );
    }

    else return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Auth Page (Under construction)</h1>
            <p className="text-lg mb-8">Please log in to continue or register if you don't have an account.</p>
            <Link to="/login" className="mb-4 text-blue-500 hover:underline">Log In </Link>//
            <Link to="/register" className="mb-4 text-blue-500 hover:underline"> Register</Link>
        </div>
    );
}

export default AuthPage;