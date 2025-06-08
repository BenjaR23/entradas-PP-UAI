import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useJWTBoilerplate from '../backend-node/client.ts';

function Navbar() {
  const [events, setEvents] = useState(''); // Creamos un estado para almacenar la búsqueda de eventos
  const [menuOpen, setMenuOpen] = useState(false); // Creamos otro estado para mostrar y ocultar la navbar
  const navigate = useNavigate();

  const token = localStorage.getItem('userToken'); // Obtenemos del token de localStorage
  const user = useJWTBoilerplate(token ?? ''); // Llamamos a useJWTBoilerplate para verificar el usuario

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = events.trim(); // Obtenemos el valor del input y eliminamos espacios en blanco al inicio y al final
    if (query) {
      navigate(`/search/${query}`); // Vamos a la página de búsqueda con el query
      setEvents(''); // Limpiamos el input de búsqueda
      setMenuOpen(false); // Cerramos el menú si está abierto
    } else {
      alert("Please enter an event name to search for!"); // Si el input está vacío, mostramos un mensaje de alerta
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Compraventa Entradas UAI</div> {/* Logo del navbar */}

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`navbar-container ${menuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link> {/* Link a la página de inicio */}
        <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>

        {user ? (
          <> {/* Si el usuario está autenticado, mostramos los siguientes enlaces */}
            <Link to="/auth" onClick={() => setMenuOpen(false)}>Authorization</Link>
            <Link to="/heldtickets" onClick={() => setMenuOpen(false)}>Tickets</Link>
            <Link to="/transfer" onClick={() => setMenuOpen(false)}>Transfer</Link>
            <Link to="/reselling" onClick={() => setMenuOpen(false)}>Reselling</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-login" onClick={() => setMenuOpen(false)}>Login</Link>
          </>
        )}

        <form className="event-seacher" onSubmit={handleSearchSubmit}> {/* Barra de búsqueda de eventos */}
          <input
            type="text"
            placeholder="Search for events..."
            className="eventSearch"
            value={events}
            onChange={(e) => setEvents(e.target.value)} // Actualizamos el estado de eventos con el valor del input
          />
          <button type="submit" className="eventSearchButton">🔍</button> {/* Creamos un botón de búsqueda que busca el evento escrito */}
        </form>
      </div>
    </nav>
  );
}

export default Navbar;
