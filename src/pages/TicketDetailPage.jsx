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

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSave = {
            orderId: parseInt(orderId),
            ticketId: parseInt(ticketId),
            userId: transferUserId.trim() || null,  // si está vacío, null
            price: transferPrice ? parseFloat(transferPrice) : null,
        };

        // Por ahora solo mostrar en consola
        console.log('Datos a guardar:', JSON.stringify(dataToSave, null, 2));

        // Aquí podrías agregar lógica para enviar a backend, localStorage, etc.
        alert('Datos guardados en consola. Revisa la consola del navegador.');

    };

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

            <form onSubmit={handleSubmit}>
                <label>
                    ID del usuario a transferir:
                    <input
                        type="text"
                        value={transferUserId}
                        onChange={(e) => setTransferUserId(e.target.value)}
                        placeholder="Ingrese ID o RUN (opcional)"
                    />
                </label>

                <br />

                <label>
                    Precio de transferencia:
                    <p>El precio no puede ser mayor al 90% del total</p>
                    <input
                        type="number"
                        value={transferPrice}
                        onChange={(e) => setTransferPrice(e.target.value)}
                        placeholder="Ingrese precio"
                        min="0"
                        step="any"
                        required
                    />
                </label>

                <br />
                <button type="submit">Enviar Transferencia</button>
            </form>

            <br />
            <button onClick={() => navigate(-1)}>Volver</button>
        </div>
    );
}

export default TicketDetailPage;
