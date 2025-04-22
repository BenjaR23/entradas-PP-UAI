import { Link } from 'react-router-dom';  // Import Link component for navigation between pages
import concerts from '../../public/data/concerts.js';  // Import concerts data from the concerts.js file

function HomePage() {
  return (
    <div className="home-container">
      {/* Display the title of the homepage */}
      <h1 className="home-title">Upcoming Concerts</h1>
      
      {/* Create a grid layout to display all concerts */}
      <div className="concert-grid">
        {/* Loop through the concerts and create a link for each one */}
        {concerts.map((concert) => (
          // Each concert is linked to a detailed page using the concert's id in the URL
          <Link to={`/concert/${concert.id}`} key={concert.id} className="concert-card">
            {/* Display concert name */}
            <h2>{concert.name}</h2>
            {/* Display concert date */}
            <p>{concert.date}</p>
            {/* Display concert location */}
            <p>{concert.location}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
