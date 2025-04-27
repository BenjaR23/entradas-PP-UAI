import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';

function ConcertPage() {
  const { id } = useParams();
  const [concert, setConcert] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcertAndTickets = async () => {
      try {
        const response = await fetch(`http://localhost:8080/events/id/${id}`);
        
        if (!response.ok) {
          throw new Error('Evento no encontrado');
        }

        const data = await response.json();
        setConcert(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConcertAndTickets();
  }, [id]);

  const handleChange = (type, value) => {
    setQuantities(prev => ({
      ...prev,
      [type]: value ? parseInt(value, 10) : 0,
    }));
  };

  const handlePurchase = async () => {
    if (!concert) return;

    const selectedTickets = concert.tickets
      .filter(ticket => quantities[ticket.type] > 0)
      .map(ticket => ({
        ticketId: ticket.id, // 👈 corregido: usamos ticketId en vez de type
        quantity: quantities[ticket.type],
      }));

    if (selectedTickets.length === 0) {
      alert("Por favor selecciona al menos un ticket.");
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        alert("Debes iniciar sesión para comprar entradas.");
        return;
      }

      const response = await fetch('http://localhost:8080/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: concert.id,
          tickets: selectedTickets,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al realizar la compra.');
      }

      alert(data.message || "¡Compra exitosa!");
    } catch (error) {
      console.error("Error en la compra:", error);
      alert(error.message || "Error procesando la compra. Intenta nuevamente.");
    }
  };

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="concert-page">
      <h1>{concert.title}</h1>
      <p>{concert.description}</p>
      <p><strong>Venue:</strong> {concert.venue.name}</p>
      <p><strong>Fecha:</strong> {new Date(concert.eventDate).toLocaleDateString()}</p>

      <h2>Entradas:</h2>
      <div className="tickets">
        {concert.tickets.map(ticket => (
          <div key={ticket.id} className="ticket-option">
            <h3>{ticket.type}</h3>
            <p>Precio: ${ticket.price}</p>
            <p>Disponibles: {ticket.stock - ticket.sold}</p>
            <input
              type="number"
              min="0"
              value={quantities[ticket.type] || ''}
              onChange={(e) => handleChange(ticket.type, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button onClick={handlePurchase}>Comprar</button>
    </div>
  );
}

export default ConcertPage;
