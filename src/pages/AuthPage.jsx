import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function AuthPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Creamos un estado para verificar si el usuario está logueado, y otro para almacenar los atributos del usuario.
    const [userAttributes, setUserAttributes] = useState({
        usermail: '',
        userID: '',
        userName: '',
    });
    const navigate = useNavigate();
    // Para cerrar sesión, eliminamos el token del localStorage y actualizamos el estado de isLoggedIn y userAttributes, luego redirigimos al usuario a la página de inicio.
    const logout = () => {
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        setUserAttributes({
            usermail: '',
            userID: '',
            userName: '',
        });
        navigate('/');
        window.location.reload()
    };

    // Cambiar esto a que use UseJWTBoilerplate para verificar el token JWT por razones de seguridad ya que así revelamos menos información sobre como funciona la autenticación.
    useEffect(() => {
        const verifyToken = () => {
            const userToken = localStorage.getItem('userToken');
            
            if (userToken) {
                try {
                    // Decodificar el payload del JWT
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
    // Si el usuario ya ha ingresado con su cuenta, mostramos un mensaje de bienvenida y sus datos
    // Si no, mostramos un mensaje de bienvenida y opciones para iniciar sesión o registrarse
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
