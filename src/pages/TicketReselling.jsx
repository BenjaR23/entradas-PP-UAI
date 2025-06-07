import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import {toast} from 'react-toastify';

const TicketReselling = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');



  useEffect(() => {
    fetch("http://localhost:8080/orders/reselling")
      .then(res => {
        if (!res.ok) throw new Error("No hay tickets en reventa.");
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

  if (loading) return <Loader />;
  if (error) return <p>Error: {error}</p>;

const handleResellPurchase = async (orderId, total) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Usuario no identificado.");
      return;
    }

    const response = await fetch("http://localhost:8080/orders/resell-purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        userId,
        total,
      }),
    });

    if (!response.ok) throw new Error("Error al comprar la orden en reventa");

    const result = await response.json();
    toast.info("¡Compra de entrada revendida realizada con éxito!");
    setTimeout(() => {
    location.reload();
}, 3000);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};



  return (
    <div className="reselling-container">
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
                <div>
                  <strong>Ticket:</strong> {item.ticket.type} — <strong>Evento:</strong> {item.ticket.event.title} ({new Date(item.ticket.event.eventDate).toLocaleDateString()})<br/>
                  <strong>Cantidad:</strong> {item.quantity} — <strong>Precio por unidad:</strong> ${item.priceEach}<br/>
                  <strong>Total:</strong>  ${item.priceEach * item.quantity}
                </div>
                <button
                  onClick={() => handleResellPurchase(order.orderId, item.priceEach * item.quantity)}
                  style={{ marginTop: '0.5rem'}}
                >
                  Comprar Reventa
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TicketReselling;
