import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useJWTBoilerplate from '../backend-node/client.ts';

function Navbar() {
  const [events, setEvents] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('userToken');
  const user = useJWTBoilerplate(token ?? '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = events.trim();
    if (query) {
      navigate(`/search/${query}`);
      setEvents('');
      setMenuOpen(false);
    } else {
      alert("Please enter an event name to search for!");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">Compraventa Entradas UAI</div>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`navbar-container ${menuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>

        {user ? (
          <>
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

        <form className="event-seacher" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search for events..."
            className="eventSearch"
            value={events}
            onChange={(e) => setEvents(e.target.value)}
          />
          <button type="submit" className="eventSearchButton">🔍</button>
        </form>
      </div>
    </nav>
  );
}

export default Navbar;
