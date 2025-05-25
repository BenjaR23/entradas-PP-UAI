import React, { useEffect, useState } from 'react';

const TicketReselling = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/orders/reselling")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch reselling orders");
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando órdenes en reventa...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Órdenes en Reventa</h1>
      {orders.length === 0 && <p>No hay órdenes en reventa disponibles.</p>}
      {orders.map(order => (
        <div key={order.orderId} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}>
          <h2>Vendedor: {order.user.name} (RUN: {order.user.RUN})</h2>
          <p>Email: {order.user.email}</p>
          <h3>Items:</h3>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                <strong>Ticket:</strong> {item.ticket.type} — <strong>Evento:</strong> {item.ticket.event.title} ({new Date(item.ticket.event.eventDate).toLocaleDateString()})<br/>
                <strong>Cantidad:</strong> {item.quantity} — <strong>Precio por unidad:</strong> ${item.priceEach}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TicketReselling;
