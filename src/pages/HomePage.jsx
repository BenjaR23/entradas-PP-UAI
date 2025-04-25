import { Link } from 'react-router-dom';  // Import Link component for navigation between pages
import { useEffect, useState } from 'react'; // Add useEffect and useState hooks to manage loading and displaying data fetched from the backend
import Loader from '../components/Loader'; // Import Loader
import '../components/Loader.css';

function HomePage() {
  const [concerts, setConcerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => { // Fetch event data from the backend API that gets you the events from the Prisma database.
    fetch("http://localhost:8080/events")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch concerts"); // Add error handling for the fetch request
        return res.json();
      })
      .then(concerts => setConcerts(concerts)) // Set the fetched events to the state to be displayed
      .catch(err => setError(err.message));
  }, []);
  if (error) return <p>Error: {error}</p>; // More error handling that displays the error message if the fetch fails
  if (!concerts.length) return <Loader />; // Display a loading message while the data is being fetched
  
  return (
    <div className="home-container">
      {/* Display the title of the homepage */}
      <h1 className="home-title">Upcoming Concerts</h1>
      
      {/* Create a grid layout to display all concerts */}
      <div className="concert-grid">
        {concerts.map((concert) => ( // Loop through the fetched events and create links for each one using the map method
          // Each concert is linked to a detailed page using the concert's id in the URL
          <Link to={`/concert/${concert.id}`} key={concert.id} className="concert-card">
            {/* Display concert name */}
            <h2>{concert.title}</h2>
            {/* Display concert date */}
            <p>{concert.eventDate}</p>
            {/* Display concert location */}
            <p>{concert.venueId}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
