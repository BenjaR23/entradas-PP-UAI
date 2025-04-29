import { useState } from 'react';
import { toast } from 'react-toastify'; // Importar toast para notificaciones
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redireccionar
import './LoginContainer.css'; // Importar el archivo CSS de estilos

function LoginContainer() {
  const [usermail, setUsermail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Función para validar el inicio de sesión
  async function checkLogin(usermail, password) {
    const response = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: usermail,
        password: password,
      }),
    });

    const data = await response.json();
    return data;
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const server_response = await checkLogin(usermail, password);

    if (server_response.message === 'Login successful') {
      setIsLoggedIn(true);
      setError(null);
      localStorage.setItem('userToken', server_response.userToken);
      localStorage.setItem('userName', server_response.UserFullName);
      localStorage.setItem('userId', server_response.userId);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/'); // Redirigir al inicio
    } else {
      setError('Credenciales inválidas. Intenta nuevamente.');
      setIsLoggedIn(false);
      toast.error('Credenciales inválidas. Intenta nuevamente.');
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="usermail">Correo electrónico</label>
          <input
            type="text"
            id="usermail"
            value={usermail}
            onChange={(e) => setUsermail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Iniciar sesión</button>
      </form>
      {isLoggedIn && <p className="success">¡Sesión iniciada con éxito!</p>}
    </div>
  );
}

export default LoginContainer;