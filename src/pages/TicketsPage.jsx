import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir al usuario a la pagina de login si no está autenticado
import useJWTBoilerplate from '../backend-node/client.ts';
import TicketCard from '../components/TicketCard.jsx'; // Importar el componente TicketCard para mostrar los tickets
import Loader from '../components/Loader.jsx'; // Import Loader

function TicketsPage() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]); // Estado para almacenar los tickets
    const [error, setError] = useState(null); // Estado para manejar errores

    if (!localStorage.getItem('userToken')) { // Revisar si el token de usuario existe
        navigate('/login'); // Redirigir al usuario a la página de inicio de sesión no existe
    }
    const user = useJWTBoilerplate(localStorage.getItem('userToken') || ''); // Obtener el token de usuario del localStorage y pasarlo a la función useJWTBoilerplate para verificar el token y obtener datos del usuario
    console.log(user); // Test

    useEffect(() => {
        const fetchUserTickets = async () => {
            if (!user) return; // Si no hay usuario, no hacer nada
          try {
            const response = await fetch(`http://localhost:8080/tickets/id/${user.userID}`); // Hacer un GET a la API para obtener los tickets del usuario por ID
            
            if (!response.ok) {
              throw new Error('Tickets no encontrados para el usuario'); // Si la respuesta no es ok, decir que no se encontraron tickets
            }
    
            const data = await response.json(); // Convertir la respuesta a JSON
            setTickets(data); // Guardar los tickets en el estado
          } catch (error) {
            setError(error.message);
          }
        };
    
        fetchUserTickets(); // Llamar a la función para obtener los tickets del usuario
      }, [user]);
      
      if (error) return <p>Error: {error}</p>; // Lanzar un error si falla la solicitud
      if (!tickets.length) return <Loader />; // Monstrar una pantalla de carga mientras se obtienen los tickets
      return (
        <div className="tickets-page">
            <h1>My Tickets</h1> {/* Titulo de la pagina */}
            {tickets.map((order) => (
                <TicketCard order={order} key={order.id} /> // Iterar sobre los tickets obtenidos y crear un TicketCard para cada uno
            ))}
        </div>
    )
}

export default TicketsPage;