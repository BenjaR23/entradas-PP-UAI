import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './LoginContainer.css';
import ButtonLoader from '../ButtonLoader'; // Asegúrate que este sea tu loader

function LoginContainer() {
    const [usermail, setusermail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function checkLogin(usermail, password) {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usermail, password }),
        });
        const data = await response.json();
        return data;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const server_response = await checkLogin(usermail, password);
        setLoading(false);

        if (server_response.message === 'Login successful') {
            setIsLoggedIn(true);
            setError(null);
            localStorage.setItem('userToken', server_response.userToken);
            localStorage.setItem('userName', server_response.UserFullName);
            localStorage.setItem('userId', server_response.userId);
            toast.success("Login successful!");
            navigate('/');
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
