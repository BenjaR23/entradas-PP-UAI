import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useJWTBoilerplate from '../backend-node/client.ts';
import TicketCard from '../components/TicketCard.jsx';
import Loader from '../components/Loader.jsx';
function TicketTransferPage() {
    const navigate = useNavigate(); // Hook para navegación
    const [tickets, setTickets] = useState([]); // Estado para almacenar los tickets
    const [error, setError] = useState(null); // Estado para manejar errores
    const [transferMode] = useState(true); // Estado para el modo de transferencia para el TicketCard 
    const [selectedTicketData, setSelectedTicketData] = useState(null); // Estado para ticket seleccionado

    if (!localStorage.getItem('userToken')) { // Si no hay token, redirigir al login
        navigate('/login');
    }
    
    const user = useJWTBoilerplate(localStorage.getItem('userToken') || ''); // Si hay token, verificamos al usuario y obtenemos sus datos

    useEffect(() => {
        // Función para obtener los tickets del usuario
        const fetchUserTickets = async () => {
            if (!user) return; // Si no hay usuario (o este no se ha cargado), no hacer nada

            try {
                const response = await fetch(`http://localhost:8080/tickets/RUN/${user.userRUN}`); // Obtenemos los tickets del usuario
                
                if (!response.ok) { // Si la respuesta no es OK, lanzar un error
                    throw new Error('Tickets no encontrados para el usuario');
                }

                const data = await response.json(); // Procesamos la respuesta JSON
                setTickets(data); // Actualizamos el estado con los tickets obtenidos
            } catch (error) {
                setError(error.message); // Si hay un error, lo guardamos en el estado
            }
        };

        fetchUserTickets(); // Corremos la función para obtener los tickets
    }, [user]);

    const handleTransferClick = (orderId, ticketId) => { // Función para manejar el clic en el botón de transferencia
        navigate(`/transfer/${orderId}/${ticketId}`);
    };


    if (error) return <p>Error: {error}</p>; // Si hay un error, mostrarlo
    if (!tickets.length) return <Loader />; // Si no hay tickets o no se han cargado, mostrar el loader

    return (
        <div className="tickets-page">
            <h1>Transferir Tickets</h1>

            {/* Mostrar listado de tickets */}
            {tickets.map((order) => (
                <TicketCard
                    order={order}
                    key={order.id}
                    transferMode={transferMode}
                    onTransferClick={handleTransferClick}
                />
            ))}

            {/* Mostrar detalles del ticket seleccionado */}
            {selectedTicketData && (
                <div className="selected-ticket-details" style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
                    <h2>Detalles del Ticket Seleccionado</h2>
                    <p><strong>Evento:</strong> {selectedTicketData.ticket.event.title}</p>
                    <p><strong>Tipo:</strong> {selectedTicketData.ticket.type}</p>
                    <p><strong>Precio:</strong> ${selectedTicketData.ticket.price}</p>
                    <p><strong>Cantidad:</strong> {selectedTicketData.quantity}</p>
                    <p><strong>Total:</strong> ${selectedTicketData.ticket.price * selectedTicketData.quantity}</p>
                </div>
            )}
        </div>
    );
}

export default TicketTransferPage;
