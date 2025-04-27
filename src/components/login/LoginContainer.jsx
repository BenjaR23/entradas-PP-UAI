import { useState } from 'react';
import { toast } from 'react-toastify'; // Importar el toast
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir
import './LoginContainer.css'; // Import the CSS file for styling

function LoginContainer() {
    const [usermail, setusermail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track if the user is logged in
    const navigate = useNavigate(); // Hook to handle redirection

    async function checkLogin(usermail, password) {
        const name = usermail
        const pass = password
        console.log(name, pass)
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: name,
                password: pass
            })
        })


        const data = await response.json()
        console.log(data.message)
        return data
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const server_response = await checkLogin(usermail, password)
        if (server_response.message === 'Login successful') {
            setIsLoggedIn(true);
            setError(null);
            localStorage.setItem('userToken', server_response.userToken); // Guardar el token
            localStorage.setItem('userName', server_response.UserFullName); // Guardar el nombre del usuario
            localStorage.setItem('userId', server_response.userId); // 🔥 NUEVO: guardar el userId
            toast.success("Login successful!");
            navigate('/'); // Redirigir a la página de inicio
          } else {
            setError('Invalid credentials. Please try again.');
            setIsLoggedIn(false);
            toast.error("Invalid credentials! Please try again.");
          }
          

    };

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
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Login</button>
            </form>
            {isLoggedIn && <p className="success">Login successful!</p>} {/* Optional: Display success message if logged in */}
        </div>
    )
}

export default LoginContainer;
