import { Link } from 'react-router-dom';
import concerts from '../data/concerts';

function HomePage() {
  return (
    <div className="home-container">
        <h1 className="home-title">Upcoming Concerts</h1>
        <div className="concert-grid">
            {concerts.map((concert) => (
                <Link to={`/concert/${concert.id}`} key={concert.id} className="concert-card">
                    <h2>{concert.name}</h2>
                    <p>{concert.date}</p>
            <       p>{concert.location}</p>
                </Link>
            ))}
        </div>
    </div>

  );
}

export default HomePage;
