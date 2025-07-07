import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useJWTBoilerplate from '../backend-node/client.ts';
import Loader from '../components/Loader.jsx';
import { backendURL } from '../../config.js';

function TicketDetailPage() {
    const { orderId, ticketId } = useParams(); // Obtenemos el orderId y ticketId de los parámetros de la URL
    const navigate = useNavigate(); // Usamos useNavigate para redirigir al usuario después de la transferencia
    const userToken = localStorage.getItem('userToken'); // Obtenemos el token del usuario desde el localStorage
    const user = useJWTBoilerplate(userToken || ''); // Verificamos el token JWT del usuario para obtener su rol y otros datos
    const [ticketData, setTicketData] = useState(null); // Creamos un estado para almacenar los datos del ticket
    const [error, setError] = useState(null); // Creamos otro estado para manejar errores durante la carga de datos

    const [transferUserId, setTransferUserId] = useState(''); // Creamos un estado para almacenar el ID del usuario al que se transferirá el ticket
    const [transferPrice, setTransferPrice] = useState(''); // Creamos un estado para almacenar el precio del ticket en reventa

    useEffect(() => {
        // Obtenemos los detalles de los tickets del usuario desde el backend con su RUN
        const fetchTicketDetail = async () => {
            if (!user) return;

            try {
                const response = await fetch(`${backendURL}/tickets/RUN/${user.userRUN}`);
                if (!response.ok) throw new Error('Error al obtener tickets'); // Si la respuesta no es exitosa, lanzamos un error

                const orders = await response.json(); // Obtenemos los tickets del usuario en formato JSON

                const order = orders.find(o => o.id === parseInt(orderId)); // Buscamos la orden que coincida con el orderId proporcionado
                if (!order) throw new Error('Orden no encontrada'); // Si no se encuentra la orden, lanzamos un error

                const item = order.items.find(i => i.ticket.id === parseInt(ticketId)); // Buscamos el ticket dentro de la orden que coincida con el ticketId proporcionado
                if (!item) throw new Error('Ticket no encontrado'); // Si no se encuentra el ticket, lanzamos un error

                setTicketData(item); // Actualizamos el estado con los datos del ticket encontrado
            } catch (err) {
                setError(err.message); // Si ocurre un error durante la petición, actualizamos el estado de error
            }
        };

        fetchTicketDetail(); // Llamamos la función para obtener los detalles del ticket
    }, [user, orderId, ticketId]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario (que recargue la página)
        
        // Creamos un objeto con los datos necesarios para la transferencia del ticket
        const dataToSend = {
            orderId: parseInt(orderId),
            ticketId: parseInt(ticketId),
            userId: transferUserId.trim() || null,  // si está vacío, null
            price: transferPrice ? parseFloat(transferPrice) : null,
        };
        
        // Enviamos los datos al backend para realizar la transferencia del ticket usando PATCH para actualizar los datos de este en la base de datos.
        try {
            const response = await fetch(`${backendURL}/transfer-ticket`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ${userToken}'
                },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json().catch(() => null); // Esperamos la respuesta del backend y la convertimos a JSON
             
            // Si la respuesta no es exitosa, lanzamos un error con el mensaje de error del backend
            if (!response.ok) {
                const errorMsg = (result && result.error) ? result.error : 'Error en la transferencia';
                throw new Error(errorMsg);
            }
            // Si la transferencia fue exitosa, mostramos un mensaje de éxito y redirigimos al usuario
            alert(`Transferencia exitosa: ${result.message}`);
            console.log('Respuesta del backend:', result);
            navigate('/mis-tickets'); // o redirecciona donde quieras
       
            navigate('/transfer');
        } catch (err) {
            // En caso de que ocurra un error durante la transferencia, mostramos este al usuario y lo registramos en la consola
            console.error('Error completo:', err);
            alert(`Error al transferir el ticket: ${err.message}`);
        }


    };
    // Si hay un error al obtener los datos del ticket, mostramos un mensaje de error
    if (error) return <p>Error: {error}</p>;
    if (!ticketData) return <Loader />; // Mientras se cargan los datos del ticket, mostramos un loader
    // Mostramos los detalles del ticket y un formulario para transferirlo
    return (
        <div className="ticket-detail-page">
            <h1>Detalle del Ticket</h1> {/* Mostramos el título de la página */}
            <p><strong>Evento:</strong> {ticketData.ticket.event.title}</p> {/* Mostramos el título del evento al que pertenece el ticket */}
            <p><strong>Tipo:</strong> {ticketData.ticket.type}</p> {/* Mostramos el tipo de ticket (ej. General, VIP, etc.) */}
            <p><strong>Precio:</strong> ${ticketData.ticket.price}</p> {/* Mostramos el precio individual al que fue comprado el ticket */}
            <p><strong>Cantidad:</strong> {ticketData.quantity}</p> {/* Mostramos la cantidad de tickets comprados en esta orden */}
            <p><strong>Total:</strong> ${ticketData.ticket.price * ticketData.quantity}</p> {/* Mostramos el total de la orden multiplicando el precio del ticket por la cantidad comprada */}

            <hr />
            <h2>Datos para transferencia (sin acción aún)</h2>
            {/* Creamos un formulario para que el usuario pueda ingresar los datos necesarios para transferir el ticket */}
            <form onSubmit={handleSubmit}>
                <label>
                    ID del usuario a transferir: {/* Si el usuario quiere transferir el ticket a otro usuario, puede ingresar su ID o RUN aquí */}
                    <input
                        type="text"
                        value={transferUserId}
                        onChange={(e) => setTransferUserId(e.target.value)}
                        placeholder="Ingrese ID o RUN (opcional)"
                    />
                </label>

                <br />

                <label>
                    Precio de transferencia:  {/* En el caso de que el usuario quiera revender el ticket, puede ingresar un precio aquí */}
                    <p>El precio no puede ser mayor al 90% del total</p> {/* Para prevenir scalping, mostramos un mensaje indicando que el precio no puede ser mayor al 90% del total del ticket, así siempre habrá una perdida asociada a revender los ticketas. */}
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
                <button type="submit">Enviar Transferencia</button> {/* Mostramos un botón para enviar el formulario y realizar la transferencia del ticket */}
            </form>

            <br />
            <button onClick={() => navigate(-1)}>Volver</button> {/* Mostramos un botón para que el usuario pueda volver a la página anterior */}
        </div>
    );
}

export default TicketDetailPage;
