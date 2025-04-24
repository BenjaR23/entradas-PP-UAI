import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function SearchPage() {
    const { query } = useParams(); // Use useParams to get the query parameter (event name) from the URL
    const [concerts, setConcerts] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch(`http://localhost:8080/events/${query}`).then(res => {
            if (!res.ok) throw new Error("Failed to fetch events! Make sure the backend is running!");
            return res.json();
        })
        .then(concerts => setConcerts(concerts))
        .catch(err => setError(err.message));
    }, []);

    if (error) return <p>Error: {error}</p>;
    if (!concerts.length) return <p>Loading...</p>;
    if (concerts.length === 0) return <p>No events found!</p>

    return (
        <div className="search-container">
            <h1 className="search-title">Search Results for "{query}"</h1>
            <div className="concert-grid">
                {concerts.map((concert) => (
                    <Link to={`/concert/${concert.id}`} key={concert.id} className="concert-card">
                        <h2>{concert.title}</h2>
                        <p>{concert.eventDate}</p>
                        <p>{concert.venueId}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default SearchPage;