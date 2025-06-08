import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader.jsx';
import { toast } from 'react-toastify';
import QrCode from '../components/adminOnly/QrCode.jsx';
import useJWTBoilerplate from '../backend-node/client.ts'

function ConcertPage() {
  const { id } = useParams(); // Obtenemos el ID del evento desde los parámetros de la URL
  const navigate = useNavigate(); // Usamos useNavigate para redirigir al usuario después de la compra
  const [concert, setConcert] = useState(null); // Estado para almacenar los datos del concierto
  const [quantities, setQuantities] = useState({}); // Estado para almacenar las cantidades de entradas seleccionadas por tipo
  const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos
  const [error, setError] = useState(null); // Estado para manejar errores durante la carga de datos
  const [purchaseData, setPurchaseData] = useState(null);  // Estado para almacenar los datos de la compra

  // Verifica el token JWT del usuario para obtener su rol y otros datos
  // Esto es importante para determinar si el usuario es un administrador o un usuario normal, y para asignar la compra a su cuenta
  const user = useJWTBoilerplate(localStorage.getItem('userToken') || '');
  useEffect(() => {
    // Función para obtener los datos del concierto y las entradas disponibles
    // Utiliza el ID del evento obtenido de los parámetros de la URL
    const fetchConcertAndTickets = async () => {
      try {
        const response = await fetch(`http://localhost:8080/events/id/${id}`);
        if (!response.ok) throw new Error('Evento no encontrado');
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
  // Función para manejar la compra de entradas
  const handlePurchase = async () => {
    if (!concert) return; // Asegurarse de que el concierto esté cargado

    const selectedTickets = concert.tickets // Filtramos las entradas seleccionadas según las cantidades ingresadas
      .filter(ticket => quantities[ticket.type] > 0)
      .map(ticket => ({
        ticketId: ticket.id,
        quantity: quantities[ticket.type],
      }));

    if (selectedTickets.length === 0) { // Verificamos que al menos una entrada haya sido seleccionada
      toast.error("Por favor seleccionar al menos un ticket.");
      return;
    }

    try {
      const token = localStorage.getItem('userToken'); // Obtenemos el token del usuario desde el localStorage
      if (!token) {
        toast.error("Debes iniciar sesión para comprar entradas."); // Si el usuario no tiene un token, mostramos un mensaje de error
        return;
      }
      // Realizamos la petición POST al backend para procesar la compra
      // Enviamos el ID del evento y las entradas seleccionadas en el cuerpo de la petición
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
      // Esperamos la respuesta del backend y la convertimos a JSON
      const data = await response.json();
      // Si la respuesta no es exitosa, lanzamos un error con el mensaje del backend
      if (!response.ok) {
        throw new Error(data.error || 'Error al realizar la compra.');
      }
      // Si la compra fue exitosa, mostramos un mensaje de éxito
      toast.success(data.message || "¡Compra exitosa!");

      // Decodifica el token para extraer el RUN del usuario
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userRUN = decoded.userRUN;

      // Guardamos datos de la compra para mostrar el QR
      setPurchaseData({
        orderId: data.order.id,
        RUN: userRUN,
      });

      // Redirigimos al usuario a la página de inicio después de 100 segundos
      // Esto es útil para que el usuario pueda ver el QR y confirmar la compra antes de ser redirigido
      toast.info("Redirigiendo a la página de inicio en 100 segundos...");
      setTimeout(() => {
        navigate('/');
      }, 100000);

    } catch (error) {
      // Si ocurre un error durante la compra, lo mostramos en la consola y mostramos un mensaje de error al usuario
      console.error("Error en la compra:", error);
      toast.error(error.message || "Error procesando la compra. Intenta nuevamente.");
    }
  };

  if (loading) return <Loader />; // Mostramos un loader mientras se cargan los datos del concierto
  if (error) return <div>Error: {error}</div>; // Mostramos un mensaje de error si ocurre algún problema al cargar los datos

  // Si el usuario es un administrador, mostramos la página con información sobre el aforo actual del evento como la cantidad total de entradas, la cantidad de gente que ha hecho check-in y la capacidad restante
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
  // Si el usuario es un usuario normal, mostramos la página con información sobre el concierto y las entradas disponibles sin mostrar info del aforo actual del evento
  // Esto es para que los usuarios normales no puedan ver información sensible sobre el evento como la cantidad de entradas vendidas y la capacidad restante
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

      {/* Mostrar el código QR si la compra fue exitosa */}
      {purchaseData && <QrCode orderId={purchaseData.orderId} RUN={purchaseData.RUN} />}
    </div>
  );
}

export default ConcertPage;
