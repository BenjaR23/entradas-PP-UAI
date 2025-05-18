import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir al usuario a la pagina de login si no está autenticado
import useJWTBoilerplate from '../backend-node/client.ts'; // Importar el hook useJWTBoilerplate para verificar el token de usuario
import TicketCard from '../components/TicketCard.jsx'; // Importar el componente TicketCard para mostrar los tickets
import Loader from '../components/Loader.jsx'; // Import Loader
import UserQRPrompt from '../components/adminOnly/UserQRPrompt.jsx' // Importar el componente UserQRPrompt para que el admin elija que hacer

function TicketsPage() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]); // Estado para almacenar los tickets
    const [error, setError] = useState(null); // Estado para manejar errores
    const [adminQRPrompted, setAdminQRPrompted] = useState(false); // Nos aseguramos que los admins vean el prompt una vez
    const [adminChosenRUN, setadminChosenRUN] = useState(null); // Manejamos el RUN del usuario que el admin ha elegido ver sus tickets, este cambia depende de si el admin ha escaneado un QR o ha elegido ver sus propios tickets

    if (!localStorage.getItem('userToken')) { // Revisar si el token de usuario existe
        navigate('/login'); // Redirigir al usuario a la página de inicio de sesión no existe
    }
    const user = useJWTBoilerplate(localStorage.getItem('userToken') || ''); // Obtener el token de usuario del localStorage y pasarlo a la función useJWTBoilerplate para verificar el token y obtener datos del usuario
    
    useEffect(() => {
      if (!user) return;
      if (user.userRole === 'admin' && !adminQRPrompted && adminChosenRUN === null) {
        setAdminQRPrompted(true); // En caso de que el usuario sea admin y no haya sido promptado, lo promptamos
      } else if (user.userRole !== 'admin') {
        setadminChosenRUN(user.userRUN); // Si el usuario no es admin, le asignamos su propio RUN
      }
    }, [user, adminQRPrompted, adminChosenRUN]);

    useEffect(() => {
        const fetchUserTickets = async () => {
            if (!user || adminChosenRUN === null) return; // Si no hay usuario, no hacer nada, y si el admin no ha elegido un RUN, no hacer nada (como los usuarios normales automaticamente se les asigna su propio ID, no hay problema)

          try {
            const response = await fetch(`http://localhost:8080/tickets/RUN/${adminChosenRUN}`); // Hacer un GET a la API para obtener los tickets del usuario por el ID elegido por el admin o el propio ID del usuario
            
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
      }, [adminChosenRUN]);
      
      if (error) return <p>Error: {error}</p>; // Lanzar un error si falla la solicitud
      // Posiblemente agregar un toast para mostrar el RUN del usuario que se está ocupando para ver los tickets en un futuro

      if (user?.userRole === 'admin' && adminQRPrompted && adminChosenRUN === null) { // Si el usuario es admin y ha sido promptado, mostrar el prompt para que elija que hacer
        return (
          <UserQRPrompt
            onSelf={() => setadminChosenRUN(user.userRUN)} // Si el admin elige ver sus propios tickets, le asignamos su propio RUN
            onScan={(run) => {setadminChosenRUN(run)}} // Si el admin escanea un QR, le asignamos el RUN del usuario escaneado y lo des-promptamos
          /> );
      }
      if (!tickets.length) return <Loader />; // Mientras se cargan los tickets, mostrar un loader


      return (
        <div className="tickets-page">
            <h1>My Tickets</h1> {/* Titulo de la pagina */}
            {tickets.map((order) => (
                <TicketCard
                  order={order}
                  key={order.id}
                  isAdmin={user?.userRole === 'admin'}
                  onCheckIn={(orderId, itemId) => {
                    // Marca el item como checked-in en el estado local sin recargar
                    setTickets((prev) =>
                      prev.map((ord) => ord.id === orderId
                        ? {
                          ...ord,
                            items: ord.items.map((it) =>
                              it.id === itemId ? { ...it, isCheckedIn: true } : it
                            ),
                          }
                        : ord
                      )
                    );
                  }}
                />
 // Iterar sobre los tickets obtenidos y crear un TicketCard para cada uno
            ))}
        </div>
    )
}

export default TicketsPage;