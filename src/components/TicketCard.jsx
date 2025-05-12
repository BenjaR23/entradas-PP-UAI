import { useState } from 'react';

function TicketCard({ order }) { // Creamos un componente TicketCard que recibe una orden como prop, que estan estructuradas por Order, que adentro contiene un array donde un elemento son los OrderItems correspondientes a esta orden, y estos a su vez contienen un Ticket, que a su vez contienen el evento al que pertenecen,
    // por lo cual podemos acceder a todos los datos necesarios solo con la orden.
  const [isCheckedIn, setIsCheckedIn] = useState(order.isCheckedIn);

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`http://localhost:8080/order-items/${order.id}/check-in`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Error al hacer check-in');
      }

      const data = await response.json();
      setIsCheckedIn(true); // Actualiza el estado local si el check-in fue exitoso
    } catch (error) {
      console.error(error);
      alert('Error al hacer check-in del ticket');
    }
  };

  return (
    <div className="ticket-card">
        <h2>Order ID: {order.id}</h2> {/* Mostramos el ID de la orden */}
        <h2>Purchased at: {order.createdAt}</h2> {/* Mostramos cuando se realizó la orden */}
        <p>Total order price: ${order.total}</p> {/* Mostramos el precio total de la orden */}
        <p>Status: {order.status}</p> {/* Mostramos el estado de la orden (pagado, pendiente, etc) */}
        <p>Items:</p> {/* Mostramos los items de la orden */}
        <ul>
            {order.items.map((item) => (<li key={item.id} >  {/* Iteramos sobre los items de la orden, mostrando caracteristicas de cada uno */}
                <p>{item.quantity}x {item.ticket.type} tickets for {item.ticket.event.title}</p> {/* Mostramos la cantidad de tickets, el tipo, y el evento al que pertenecen */}
                <p>Price: ${item.ticket.price} each. Total: ${item.ticket.price * item.quantity}</p> {/* Mostramos el precio de cada ticket y el total por esos items */}
                {/* Mostrar la casilla de verificación solo si el ticket no ha sido marcado */}
                {!isCheckedIn && (
                  <div>
                    <input 
                      type="checkbox" 
                      onChange={handleCheckIn} 
                      checked={isCheckedIn}
                    /> Check-in
                  </div>
                )}
            </li>
          ))}
        </ul>
    </div>
  );
}

export default TicketCard;