import { Link } from 'react-router-dom';

function ConcertCard({ concert }) {
    if (!concert) return null;

    return (
        <Link to={`/concert/${concert.id}`} key={concert.id} className="concert-card">
        {/* Display concert name */}
        <h2>{concert.title}</h2>
        {/* Display concert date */}
        <p>{concert.eventDate}</p>
        {/* Display concert location */}
        <p>{concert.venueId}</p>
    </Link>
    );
}

export default ConcertCard;