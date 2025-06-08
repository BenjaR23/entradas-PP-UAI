import { Link } from 'react-router-dom';

function ConcertCard({ concert }) {
    if (!concert) return null;

    return (
        <Link to={`/concert/${concert.id}`} key={concert.id} className="concert-card">
        {/* Mostrar nombre del concierto */}
        <h2>{concert.title}</h2>
        {/* Mostrar fecha */}
        <p>{concert.eventDate}</p>
        {/* Mostrar recinto */}
        <p>{concert.venueId}</p>
    </Link>
    );
}

export default ConcertCard;