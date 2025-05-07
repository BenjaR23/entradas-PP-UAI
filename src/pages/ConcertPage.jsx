import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader.jsx';
import { toast } from 'react-toastify';
import useJWTBoilerplate from '../backend-node/client.ts'

function ConcertPage() {
  const { id } = useParams(); // Obtenemos el ID del evento desde el URL
  const navigate = useNavigate(); // Hook para navegar
  const [concert, setConcert] = useState(null); // Usamos un useState para almacenar el evento
  const [quantities, setQuantities] = useState({}); // Usamos un useState para almacenar las cantidades de entradas seleccionadas
  const [loading, setLoading] = useState(true); // Usamos un useState para manejar el estado de carga
  const [error, setError] = useState(null); // Usamos un useState para manejar errores

  const user = useJWTBoilerplate(localStorage.getItem('userToken') || '');
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
        ticketId: ticket.id,
        quantity: quantities[ticket.type],
      }));

    if (selectedTickets.length === 0) {
      toast.error("Por favor selecciona al menos un ticket.");
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error("Debes iniciar sesión para comprar entradas.");
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

      toast.success(data.message || "¡Compra exitosa!");

      // 👇 Después de 2 segundos, volver al Home
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error("Error en la compra:", error);
      toast.error(error.message || "Error procesando la compra. Intenta nuevamente.");
    }
  };

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  if (user?.userRole === 'admin') {
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
        <div className="capacity"> 
          <h2>Aforo actual del evento</h2>
          <p><strong>Capacidad total:</strong> {concert.stats.totalCapacity}</p>
          <p><strong>Ingresados:</strong> {concert.stats.totalCheckedIn}</p>
          <p><strong>Capacidad restante:</strong> {concert.stats.remainingCapacity}</p>
        </div>
        </div>
  
        <button onClick={handlePurchase}>Comprar</button>
      </div>
    );
  }
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
