import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useJWTBoilerplate from '../backend-node/client.ts';
import TicketCard from '../components/TicketCard.jsx';
import Loader from '../components/Loader.jsx';

function TicketTransferPage() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState(null);
    const [transferMode] = useState(true);
    const [selectedTicketData, setSelectedTicketData] = useState(null); // Estado para ticket seleccionado

    if (!localStorage.getItem('userToken')) {
        navigate('/login');
    }
    
    const user = useJWTBoilerplate(localStorage.getItem('userToken') || '');

    useEffect(() => {
        const fetchUserTickets = async () => {
            if (!user) return;

            try {
                const response = await fetch(`http://localhost:8080/tickets/RUN/${user.userRUN}`);
                
                if (!response.ok) {
                    throw new Error('Tickets no encontrados para el usuario');
                }

                const data = await response.json();
                setTickets(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUserTickets();
    }, [user]);

    const handleTransferClick = (orderId, ticketId) => {
        navigate(`/transfer/${orderId}/${ticketId}`);
    };


    if (error) return <p>Error: {error}</p>;
    if (!tickets.length) return <Loader />;

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
