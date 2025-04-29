import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './navbar.css'; // Importar el CSS

function Navbar() {
  const [events, setEvents] = useState('');
  const navigate = useNavigate();

  // Manejar el envío del formulario de búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = events.trim();
    if (query) {
      navigate(`/search/${query}`); // Navegar a la página de búsqueda
    } else {
      alert("¡Por favor ingresa un evento para buscar!"); // Alertar si no se ingresa un evento
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <p className="navbar-title">Compraventa Entradas UAI</p>
        <div className="navbar-links">
          <Link to="/">Inicio</Link>
          <Link to="/about">Sobre Nosotros</Link>
          <Link to="/login" className="navbar-login">Login</Link>
          <Link to="/auth">Página de Autorización</Link>
        </div>
      </div>
      <form className="event-searcher" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Buscar eventos..."
          className="event-search"
          value={events}
          onChange={(e) => setEvents(e.target.value)}
        />
        <button type="submit" className="event-search-button">Buscar</button>
      </form>
    </nav>
  );
}

export default Navbar;
