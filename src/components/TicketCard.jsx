import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { backendURL } from '../../config.js';

function TicketCard({ order, isAdmin, transferMode = false, onTransferClick }) {
  const [checkedItems, setCheckedItems] = useState({}); // Creamos un estado para los itemes marcados para check-in

  useEffect(() => {
    if (!order || !order.items) return; // Verificamos que order y order.items existan

    const initialChecked = order.items.reduce((acc, item) => {
      acc[`${order.id}-${item.ticket.id}`] = item.IsCheckedIn;  // Si el item ya está marcado como checked-in, cambiamos el estado de IsCheckedIn a True
      return acc;
    }, {});
    setCheckedItems(initialChecked);
  }, [order]);

  const handleCheckIn = async (orderId, ticketId) => {
    try {
      if (!orderId || !ticketId) {
        throw new Error("Order ID or Ticket ID is missing"); // Verificamos que los IDs de las ordenes y tickets existan
      }
      // Hacemos una petición PATCH al endpoint de check-in
      // Usamos el orderId y ticketId para identificar el item específico
      // que se está marcando como checked-in, y lo actualizamos en la base de datos
      // Si la petición es exitosa, actualizamos el estado checkedItems
      const response = await fetch(`${backendURL}/order-items/${orderId}/${ticketId}/check-in`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      // Verificamos si la respuesta es exitosa, si no lanzamos un error
      if (!response.ok) {
        throw new Error('Error al hacer check-in');
      }
      // Si la respuesta es exitosa, leemos el cuerpo de la respuesta
      await response.text();
      // Actualizamos el estado checkedItems para reflejar que el item ha sido marcado como checked-in
      setCheckedItems(prev => ({
        ...prev,
        [`${orderId}-${ticketId}`]: true,
      }));
      // Mostramos un mensaje de éxito al usuario
      toast.success('Check-in realizado con éxito');
    } catch (error) {
      // O si ocurre un error, lo mostramos en la consola y alertamos al usuario
      console.error(error);
      alert('Error al hacer check-in del ticket');
    }
  };

  return (
    <div className="ticket-card">
      {/* Mostramos la información de la orden y los tickets asociados a esta */}
      <h2>Order ID: {order.id}</h2>
      <h2>Purchased at: {order.createdAt}</h2>
      <p>Total order price: ${order.total}</p>
      <p>Status: {order.status}</p>
      <p>Items:</p>
      <ul>
        {/* Iteramos sobre los items de la orden y mostramos la información de cada ticket */}
        {order.items.map((item) => {
          const isChecked = checkedItems[`${order.id}-${item.ticket.id}`];
          return (
            <li key={item.id}>
              <p>{item.quantity}x {item.ticket.type} tickets for {item.ticket.event.title}</p>
              <p>Price: ${item.ticket.price} each. Total: ${item.ticket.price * item.quantity}</p>
              {/* Si el usuario es admin y el item no está marcado como checked-in, mostramos un checkbox para hacer check-in */}
              {/* Si estamos en modo transferencia (para la pagina de transferencia de tickets), mostramos un botón para transferir el ticket y no el checkbox */}
              {!transferMode && isAdmin && !isChecked && (
                <div>
                  <input
                    type="checkbox"
                    onChange={() => handleCheckIn(order.id, item.ticket.id)}
                    checked={isChecked}
                  /> Check-in
                </div>
              )}
              {transferMode && (
                <button
                  onClick={() => onTransferClick(order.id, item.ticket.id)}
                  disabled={isChecked}
                >
                  Transferir Ticket
                </button>
              )}
              {/* Si el item ya está marcado como checked-in, mostramos un mensaje indicando que ya se ha hecho check-in */}
              {isChecked && <p>✓ Already checked in</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TicketCard;
