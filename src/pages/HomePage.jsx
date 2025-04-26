// Import Link component for navigation between pages
import { useEffect, useState } from 'react'; // Add useEffect and useState hooks to manage loading and displaying data fetched from the backend
import Loader from '../components/Loader.jsx'; // Import Loader
import '../components/Loader.css';
import ConcertCard from '../components/ConcertCard.jsx';


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
        {concerts.map((concert) => ( // Loop through the fetched events and create ConcertCards for each event, passing the event data as concert and key as concert.id
          // Each concert is linked to a page ConcertPage.jsx page using the concert's id in the URL
          <ConcertCard concert={concert} key={concert.id} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
