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

    // Estados para inputs nuevos
    const [transferUserId, setTransferUserId] = useState('');
    const [transferPrice, setTransferPrice] = useState('');

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

            <hr />
            <h2>Datos para transferencia (sin acción aún)</h2>

            <label>
                ID del usuario a transferir:
                <input
                    type="text"
                    value={transferUserId}
                    onChange={(e) => setTransferUserId(e.target.value)}
                    placeholder="Ingrese ID o RUN"
                />
            </label>

            <br />

            <label>
                Precio de transferencia:
                <input
                    type="number"
                    value={transferPrice}
                    onChange={(e) => setTransferPrice(e.target.value)}
                    placeholder="Ingrese precio"
                    min="0"
                    step="any"
                />
            </label>

            <br />
            <button onClick={() => navigate(-1)}>Volver</button>
        </div>
    );
}

export default TicketDetailPage;
