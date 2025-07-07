import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import {toast} from 'react-toastify';
import { backendURL } from '../../config.js';

const TicketReselling = () => {
  const [orders, setOrders] = useState([]); // Estado para almacenar las órdenes en reventa
  const [loading, setLoading] = useState(true); // Estado para manejar el estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores

  const userId = localStorage.getItem('userId'); // Obtenemos el ID del usuario desde el localStorage



  useEffect(() => { // Hacemos un fetch al backend para obtener las órdenes en reventa
    fetch(`${backendURL}/orders/reselling`)
      .then(res => {
        if (!res.ok) throw new Error("No hay tickets en reventa."); // Si la respuesta no es exitosa, lanzamos un error
        return res.json();
      })
      .then(data => {
        setOrders(data); // Actualizamos el estado con las órdenes obtenidas
        setLoading(false); // Cambiamos el estado de carga a false cuando los datos se han cargado correctamente
      })
      .catch(err => {
        setError(err.message); // Si ocurre un error durante la petición, actualizamos el estado de error
        setLoading(false); // Cambiamos el estado de carga a false si hay un error
      });
  }, []);

  if (loading) return <Loader />; // Mostramos un loader mientras se cargan los datos
  if (error) return <p>Error: {error}</p>; // Mostramos un mensaje de error si ocurre algún problema al cargar los datos

const handleResellPurchase = async (orderId, total) => {
  try {
    const userId = localStorage.getItem('userId'); // Obtenemos el ID del usuario desde el localStorage
    if (!userId) {
      alert("Usuario no identificado."); // Verificamos si el usuario está identificado, si no, mostramos un mensaje de alerta
      return;
    }
    // Hacemos otro fetch al backend para comprar la orden en reventa, incluyendo el ID de la orden, el del usuario y el total de la compra en el cuerpo de la petición
    const response = await fetch(`${backendURL}/orders/resell-purchase`, {
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

    if (!response.ok) throw new Error("Error al comprar la orden en reventa"); // Si la respuesta no es exitosa, lanzamos un error

    const result = await response.json(); // Esperamos la respuesta del backend y la convertimos a JSON
    toast.info("¡Compra de entrada revendida realizada con éxito!"); // Si funciona, mostramos un mensaje de éxito
    setTimeout(() => {
    location.reload(); // Recargamos la página para actualizar las órdenes en reventa
}, 3000);
  } catch (error) {
    alert(`Error: ${error.message}`); // Si ocurre un error, mostramos un mensaje de alerta con el error
  }
};


// Mostramos las órdenes en reventa disponibles, cada una con sus detalles y un botón para comprar la reventa
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
