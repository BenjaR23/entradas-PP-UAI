import { useEffect, useState } from 'react'; // Importamos useEffect y useState de React para manejar estados
import Loader from '../components/Loader.jsx';
import '../components/Loader.css';
import ConcertCard from '../components/ConcertCard.jsx';
import { backendURL } from '../../config.js';

function HomePage() {
  const [concerts, setConcerts] = useState([]); // Creamos un estado para almacenar los conciertos
  const [error, setError] = useState(null); // Creamos un estado para manejar errores durante la carga de datos

  useEffect(() => { // Creamos un estado que nos consigue los eventos desde la base de datos.
    fetch(`${backendURL}/events`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch concerts"); // Si la respuesta no es exitosa, lanzamos un error
        // Si la respuesta es exitosa, convertimos la respuesta a JSON
        return res.json();
      })
      .then(concerts => setConcerts(concerts)) // Actualizamos el estado de conciertos con los datos obtenidos
      // Si ocurre un error durante la petición, lo capturamos y actualizamos el estado de error
      .catch(err => setError(err.message));
  }, []);
  if (error) return <p>Error: {error}</p>; // Mostramos un mensaje de error si ocurre algún problema durante la carga de datos
  if (!concerts.length) return <Loader />; // Mientras se cargan los datos, mostramos un loader
  
  return (
    <div className="home-container">
      {/* Mostramos el titulo del homepage (en este caso los conciertos) */}
      <h1 className="home-title">Upcoming Concerts</h1>
      {/* Creamos un grid para mostrar todos los conciertos */}
      <div className="concert-grid">
        {concerts.map((concert) => ( // Iteramos sobre el array de conciertos y mostramos un ConcertCard para cada uno
          // Cada ConcertCard recibe el objeto concert como prop para mostrar la información del concierto y ser clickeable para ir a la página del concierto en caso de que el usuario quiera comprar entradas.
          <ConcertCard concert={concert} key={concert.id} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
