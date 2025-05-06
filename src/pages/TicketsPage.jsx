import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir al usuario a la pagina de login si no está autenticado
import useJWTBoilerplate from '../backend-node/client.ts';
import TicketCard from '../components/TicketCard.jsx'; // Importar el componente TicketCard para mostrar los tickets
import Loader from '../components/Loader.jsx'; // Import Loader
import UserQRPrompt from '../components/adminOnly/UserQRPrompt.jsx'

function TicketsPage() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]); // Estado para almacenar los tickets
    const [error, setError] = useState(null); // Estado para manejar errores
    const [adminQRPrompted, setAdminQRPrompted] = useState(false); // Nos aseguramos que los admins vean el prompt una vez
    const [adminChosenID, setAdminChosenID] = useState(null); // Manejamos el ID del usuario que el admin ha elegido ver sus tickets, este cambia depende de si el admin ha escaneado un QR o ha elegido ver sus propios tickets

    if (!localStorage.getItem('userToken')) { // Revisar si el token de usuario existe
        navigate('/login'); // Redirigir al usuario a la página de inicio de sesión no existe
    }
    const user = useJWTBoilerplate(localStorage.getItem('userToken') || ''); // Obtener el token de usuario del localStorage y pasarlo a la función useJWTBoilerplate para verificar el token y obtener datos del usuario
    console.log(user); // Test
    
    useEffect(() => {
      if (!user) return;
      if (user.userRole === 'admin' && !adminQRPrompted && adminChosenID === null) {
        setAdminQRPrompted(true); // En caso de que el usuario sea admin y no haya sido promptado, lo promptamos
      } else if (user.userRole !== 'admin') {
        setAdminChosenID(user.userID); // Si el usuario no es admin, le asignamos su propio ID
      }
    }, [user, adminQRPrompted, adminChosenID]);

    useEffect(() => {
        const fetchUserTickets = async () => {
            if (!user || adminChosenID === null) return; // Si no hay usuario, no hacer nada, y si el admin no ha elegido un ID, no hacer nada (como los usuarios normales automaticamente se les asigna su propio ID, no hay problema)

          try {
            const response = await fetch(`http://localhost:8080/tickets/id/${adminChosenID}`); // Hacer un GET a la API para obtener los tickets del usuario por el ID elegido por el admin o el propio ID del usuario
            
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
      }, [adminChosenID]);
      
      if (error) return <p>Error: {error}</p>; // Lanzar un error si falla la solicitud
      if (!tickets.length) return <Loader />; // Monstrar una pantalla de carga mientras se obtienen los tickets

      if (user?.userRole === 'admin' && adminQRPrompted && adminChosenID === null) { // Si el usuario es admin y ha sido promptado, mostrar el prompt para que elija que hacer
        return (
          <UserQRPrompt
            onSelf={() => setAdminChosenID(user.userID)} // Si el admin elige ver sus propios tickets, le asignamos su propio ID
            onScan={() => {console.log("Function not implemented yet")}} // Si el admin elige escanear un QR, le asignamos el ID del usuario escaneado (falta implementar)
          /> // En total, lo que falta es buscar un buen package de QR scanner que funcione con Deno y que sea compatible con React. Luego, al escanear el QR, vamos a necesitar que hacer un parse del link del registro civil, que por suerte es bastante simple.
          // Cuando se haga el parse, se obtiene el RUN del usuario, y el admin puede ver los tickets de este...cuando cambiemos todo el uso de ID a RUN.
          // Eso cubriría lo que pide el VEC-31. El VEC-30 va tomado de la mano, ya que idealmente el admin, al ver los tickets de un usuario, debería tener un botón para marcarlos como escaneados, y esto debería cambiar el IsCheckedIn a true en la base de datos para ese OrderItem.
          // De ahí podemos hacer el aforo de varias maneras, pero la más simple es contar los tickets que tienen IsCheckedIn en true para ese evento con ticketId y compararlos con el aforo máximo del evento. 
          // Si el aforo máximo es menor o igual a la cantidad de tickets escaneados, entonces no se puede escanear más tickets. Si no, se pueden seguir escaneando más tickets. También considerar un counter en tiempo real, pero no es necesario por ahora.
        );
      }
    
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