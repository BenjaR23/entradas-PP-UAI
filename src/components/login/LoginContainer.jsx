import { useState } from 'react';
import './LoginContainer.css'; // Import the CSS file for styling

function LoginContainer() {
    const [usermail, setusermail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track if the user is logged in

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
        if (server_response.message === "Login successful") {
            setIsLoggedIn(true); // Set logged in state to true
            setError(null); // Clear any previous error messages
            console.log(server_response.userToken)
            localStorage.setItem('userToken', server_response.userToken) // Store the token in local storage
        } else {
            setError("Invalid credentials. Please try again."); // Set error message if login fails
            setIsLoggedIn(false); // Set logged in state to false
        }
    };

    return(
        <div className="login-container">
            <h1>Login </h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="usermail">Mail </label>
                    <input
                        type="text"
                        id="usermail"
                        value={usermail}
                        onChange={(e) => setusermail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password </label>
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
            {isLoggedIn && <p className="success">Login successful!</p>} {/* Display success message if logged in */}
        </div>
    )
}

export default LoginContainer;