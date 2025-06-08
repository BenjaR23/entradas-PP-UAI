import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './LoginContainer.css';
import ButtonLoader from '../ButtonLoader'; // Asegúrate que este sea tu loader

function LoginContainer() {
    const [usermail, setusermail] = useState(''); // Estado para el correo del usuario
    const [password, setPassword] = useState(''); // Estado para la contraseña del usuario
    const [error, setError] = useState(null); // Estado para manejar errores
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para manejar el estado de inicio de sesión
    const [loading, setLoading] = useState(false); // Estado para manejar el estado de carga
    const navigate = useNavigate(); // Hook para redireccionar al usuario

    // Función para verificar las credenciales del usuario haciendo un fetch al backend con los datos del usuario
    // Retorna un objeto con el mensaje de éxito o error y el token del usuario si el inicio de sesión es exitoso
    async function checkLogin(usermail, password) {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usermail, password }),
        });
        const data = await response.json(); // Esperamos la respuesta del servidor y la convertimos a un objeto
        return data; // Retornamos el objeto con los datos del usuario o el mensaje de error
    }

    const handleSubmit = async (e) => { // Función que maneja el envío del formulario
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
        setLoading(true);
        const server_response = await checkLogin(usermail, password); // Llamamos a la función checkLogin para verificar las credenciales del usuario
        setLoading(false);

        if (server_response.message === 'Login successful') { // Si el mensaje del servidor indica que el inicio de sesión fue exitoso
            setIsLoggedIn(true); // Actualizamos el estado de isLoggedIn a true
            setError(null); // Limpiamos el estado de error
            localStorage.setItem('userToken', server_response.userToken); // Guardamos el token del usuario en el localStorage
            localStorage.setItem('userName', server_response.UserFullName); // Guardamos el nombre completo del usuario en el localStorage
            localStorage.setItem('userId', server_response.userId); // Guardamos el ID del usuario en el localStorage
            toast.success("Login successful!"); // Mostramos un mensaje de éxito al usuario
            navigate('/'); // Redireccionamos al usuario a la página principal
        } else {
            setError('Invalid credentials. Please try again.'); // Si el mensaje del servidor indica que las credenciales son inválidas, actualizamos el estado de error
            setIsLoggedIn(false); // Actualizamos el estado de isLoggedIn a false
            toast.error("Invalid credentials! Please try again."); // Mostramos un mensaje de error al usuario
        }
    };
    // Mostramos el formulario de inicio de sesión con los campos de correo y contraseña, un botón para enviar el formulario y un mensaje de error si las credenciales son inválidas
    // También mostramos un mensaje de éxito si el inicio de sesión fue exitoso y un loader mientras se verifica el inicio de sesión
    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="usermail">Mail</label>
                    <input
                        type="text"
                        id="usermail"
                        value={usermail}
                        onChange={(e) => setusermail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                {error && <p className="error">{error}</p>}

                {loading ? (
                    <ButtonLoader />
                ) : (
                    <button type="submit">Login</button>
                )}

            </form>

            {isLoggedIn && <p className="success">Login successful!</p>}
        </div>
    );
}

export default LoginContainer;
