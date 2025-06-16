import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../login/LoginContainer.css'; // Reutiliza los estilos de login
import ButtonLoader from '../ButtonLoader';

function RegisterContainer() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [RUN, setRUN] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function registerUser(data) {
        const response = await fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        return result;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        const server_response = await registerUser({ name, email, password, RUN });

        setLoading(false);

        if (server_response.status === "success") {
            toast.success("Registered successfully!");

            // Si el backend envía un token y otros datos:
            if (server_response.userToken) {
                localStorage.setItem('userToken', server_response.userToken);
                localStorage.setItem('userId', server_response.userId);
                localStorage.setItem('userName', server_response.UserFullName);
            }

            navigate('/');
        } else {
            setError(server_response.message || "Registration failed");
            toast.error(server_response.message || "Registration failed");
        }
    };

    return (
        <div className="login-container">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="run">RUN</label>
                    <input
                        type="text"
                        id="run"
                        value={RUN}
                        onChange={(e) => setRUN(e.target.value)}
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
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {error && <p className="error">{error}</p>}

                {loading ? <ButtonLoader /> : <button type="submit">Register</button>}
            </form>
        </div>
    );
}

export default RegisterContainer;
