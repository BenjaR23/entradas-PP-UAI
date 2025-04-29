import { Link } from 'react-router-dom';

// Componente que representa una tarjeta de concierto
function ConcertCard({ concert }) {
  if (!concert) return null;

  return (
    <Link to={`/concert/${concert.id}`} key={concert.id} className="concert-card">
      <div className="concert-card-content">
        {/* Mostrar título del concierto */}
        <h2>{concert.title}</h2>

        {/* Mostrar fecha del evento */}
        <p>{new Date(concert.eventDate).toLocaleDateString()}</p>

        {/* Mostrar ID del lugar donde se realizará */}
        <p>ID del Lugar: {concert.venueId}</p>
      </div>
    </Link>
  );
}

export default ConcertCard;
