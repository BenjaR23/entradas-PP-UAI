import { useState } from 'react';

function TicketCard({ order }) {
  // Create a state to track checked-in status for each ticket
  const [checkedItems, setCheckedItems] = useState(
    order.items.reduce((acc, item) => {
      acc[`${order.id}-${item.ticket.id}`] = item.ticket.isCheckedIn;
      return acc;
    }, {})
  );

  const handleCheckIn = async (orderId, ticketId) => {
    try {
      console.log('Order ID:', orderId);
      console.log('Ticket ID:', ticketId);

      if (!orderId || !ticketId) {
        throw new Error("Order ID or Ticket ID is missing");
      }

      const response = await fetch(`http://localhost:8080/order-items/${orderId}/${ticketId}/check-in`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Error al hacer check-in');
      }

      await response.text();

      // Mark only this item as checked
      setCheckedItems(prev => ({
        ...prev,
        [`${orderId}-${ticketId}`]: true,
      }));
    } catch (error) {
      console.error(error);
      alert('Error al hacer check-in del ticket');
    }
  };

  return (
    <div className="ticket-card">
      <h2>Order ID: {order.id}</h2>
      <h2>Purchased at: {order.createdAt}</h2>
      <p>Total order price: ${order.total}</p>
      <p>Status: {order.status}</p>
      <p>Items:</p>
      <ul>
        {order.items.map((item) => {
          const isChecked = checkedItems[`${order.id}-${item.ticket.id}`];
          return (
            <li key={item.id}>
              <p>{item.quantity}x {item.ticket.type} tickets for {item.ticket.event.title}</p>
              <p>Price: ${item.ticket.price} each. Total: ${item.ticket.price * item.quantity}</p>
              {/* Show checkbox only if this ticket is not checked in */}
              {!isChecked && (
                <div>
                  <input 
                    type="checkbox" 
                    onChange={() => handleCheckIn(order.id, item.ticket.id)} 
                    checked={isChecked}
                  /> Check-in
                </div>
              )}
              {/* Optionally show a message if checked in */}
              {isChecked && <p>✓ Already checked in</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TicketCard;