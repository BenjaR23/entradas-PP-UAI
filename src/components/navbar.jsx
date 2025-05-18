import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Import Link component for navigation between pages

function Navbar() {
    const [events, setEvents] = useState('');
    const navigate = useNavigate();
    // Find a less scuffed way to implement handleSearchSubmit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = events.trim();
        if (query) {
            navigate(`/search/${query}`); // Navigate to the search page with the query parameter
        } else {
            alert("Please enter an event name to search for!"); // Alert if no query is entered
        }
    };

    return (
        <nav className="navbar">
        <div className="navbar-container">
            <p className="navbar-title">Compraventa Entradas UAI</p>
            <Link to = "/">Home</Link>
            <a href="/about">About</a>
            <Link to = "/login" className="navbar-login">Login</Link>
            <Link to = "/auth">Test authorization page</Link>
            <Link to = "/heldtickets">Tickets</Link>
            <Link to = "/transfer">Ticket Transfer</Link>
        </div>
        <form className="event-seacher" onSubmit= {handleSearchSubmit}>
            <input type="text" placeholder="Search for events..." className="eventSearch" value={events} onChange={(e) => setEvents(e.target.value)}></input>
            <button type="submit" value="Search for events!" className="eventSearchButton"></button>
            </form>
        </nav>
    ); // Find a more refined way to implement the search bar and search buttons, also change the hrefs to Link components when we have those pages ready
}
export default Navbar;