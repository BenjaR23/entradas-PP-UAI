import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useJWTBoilerplate from '../backend-node/client.ts';
import Loader from '../components/Loader.jsx';

function TicketDetailPage() {
    const { orderId, ticketId } = useParams();
    const navigate = useNavigate();
    const userToken = localStorage.getItem('userToken');
    const user = useJWTBoilerplate(userToken || '');
    const [ticketData, setTicketData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTicketDetail = async () => {
            if (!user) return;

            try {
                const response = await fetch(`http://localhost:8080/tickets/RUN/${user.userRUN}`);
                if (!response.ok) throw new Error('Error al obtener tickets');

                const orders = await response.json();

                const order = orders.find(o => o.id === parseInt(orderId));
                if (!order) throw new Error('Orden no encontrada');

                const item = order.items.find(i => i.ticket.id === parseInt(ticketId));
                if (!item) throw new Error('Ticket no encontrado');

                setTicketData(item);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTicketDetail();
    }, [user, orderId, ticketId]);

    if (error) return <p>Error: {error}</p>;
    if (!ticketData) return <Loader />;

    return (
        <div className="ticket-detail-page">
            <h1>Detalle del Ticket</h1>
            <p><strong>Evento:</strong> {ticketData.ticket.event.title}</p>
            <p><strong>Tipo:</strong> {ticketData.ticket.type}</p>
            <p><strong>Precio:</strong> ${ticketData.ticket.price}</p>
            <p><strong>Cantidad:</strong> {ticketData.quantity}</p>
            <p><strong>Total:</strong> ${ticketData.ticket.price * ticketData.quantity}</p>
            <button onClick={() => navigate(-1)}>Volver</button>
        </div>
    );
}

export default TicketDetailPage;
