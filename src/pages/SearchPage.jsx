import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ConcertCard from '../components/ConcertCard.jsx'; // Import the ConcertCard component to display concert details
import Loader from '../components/Loader.jsx'; // Import Loader

function SearchPage() {
    const { query } = useParams(); // Usamos useParams para obtener el query de la URL
    const [concerts, setConcerts] = useState([]); // Creamos un estado para almacenar los conciertos obtenidos de la búsqueda
    const [error, setError] = useState(null); // Creamos un estado para manejar errores durante la carga de datos
    useEffect(() => {
        // Usamos fetch para obtener los eventos desde el backend, filtrando por el query proporcionado en la URL
        fetch(`http://localhost:8080/events/${query}`).then(res => {
            // En caso de que la respuesta no sea exitosa, lanzamos un error y un recordatorio de que el backend debe estar corriendo
            if (!res.ok) throw new Error("Failed to fetch events! Make sure the backend is running!");
            // Si la respuesta es exitosa, convertimos la respuesta a JSON
            return res.json();
        })
        .then(concerts => setConcerts(concerts)) // Actualizamos el estado de conciertos con los datos obtenidos
        .catch(err => setError(err.message)); // Si ocurre un error durante la petición, lo capturamos y actualizamos el estado de error
    }, []);

    if (error) return <p>Error: {error}</p>; // Mostramos un mensaje de error si ocurre algún problema durante la carga de datos
    if (!concerts.length) return <Loader />; // Mientras se cargan los datos, mostramos un loader
    if (concerts.length === 0) return <p>No events found!</p> // Si no se encuentran eventos, mostramos un mensaje indicando que no se encontraron eventos

    // Creamos un contenedor para la página de búsqueda, que mostrará el título de la búsqueda y un grid con los conciertos encontrados
    // Para ver como se mapean los datos de los conciertos, revisa el componente ConcertCard.jsx o HomePage.jsx.
    return (
        <div className="search-container">
            <h1 className="search-title">Search Results for "{query}"</h1>
            <div className="concert-grid">
                {concerts.map((concert) => (
                    <ConcertCard concert={concert} key={concert.id} />
                ))}
            </div>
        </div>
    );
}

export default SearchPage;