import { useParams } from 'react-router-dom';  // Import useParams to retrieve dynamic route parameters
import { useState, useEffect } from 'react';  // Import useState and useEffect hooks

function ConcertPage() {
  const { id } = useParams();  // Use useParams to get the dynamic 'id' from the URL
  const [concert, setConcert] = useState(null);  // State to store concert data
  const [quantities, setQuantities] = useState({});  // State to store ticket quantities
  const [loading, setLoading] = useState(true);  // State to manage loading state
  const [error, setError] = useState(null);  // State to manage error state

  // Fetch concert and ticket data from the backend based on the 'id'
  useEffect(() => {
    const fetchConcertAndTickets = async () => {
      try {
        // Fetch event and ticket data (ensure this endpoint returns both Event and Tickets)
        const response = await fetch(`http://localhost:8080/events/id/${id}`);  // Ensure the URL is correct
        
        if (!response.ok) {
          throw new Error('Evento no encontrado');
        }
        
        const data = await response.json();  // Parse response to JSON
        setConcert(data);  // Store concert data (which includes tickets) in state
        setLoading(false);  // Set loading to false after data is fetched
      } catch (error) {
        setError(error.message);  // Set error message if something goes wrong
        setLoading(false);  // Set loading to false if there's an error
      }
    };

    fetchConcertAndTickets();  // Call the function to fetch concert and ticket data
  }, [id]);  // Re-run the effect when the 'id' changes

  // Handle changes in the ticket quantity selector
  const handleChange = (type, value) => {
    setQuantities(prev => ({
      ...prev,
      [type]: parseInt(value),  // Update the quantity for the selected ticket type
    }));
  };

  // Handle the purchase logic by calculating the total price of the selected tickets
  const handlePurchase = () => {
    const total = concert.tickets.reduce((acc, ticket) => {
      return acc + ticket.price * quantities[ticket.type];  // Calculate total by multiplying price with selected quantity
    }, 0);
    // Alert the total price formatted as currency
    alert(`Total: $${total.toLocaleString()}`);
  };

  // Loading state: show message while fetching data
  if (loading) {
    return <p>Loading event details...</p>;
  }

  // Error handling: show error message if fetch fails
  if (error) {
    return <p>Error: {error}</p>;
  }

  // Render the concert details and ticket selection
  return (
    <div className="concert-container">
      <div className="concert-box">
        {/* Display concert name and details */}
        <h1 className="concert-title">{concert.name}</h1>
        <p className="concert-subinfo">{concert.date} – {concert.location}</p>

        <h2 className="concert-subinfo">Select Your Tickets</h2>
        <div>
          {/* Loop through concert ticket types and display a select input for each */}
          {concert.tickets.map(ticket => (
            <div key={ticket.type} className="ticket-type">
              <div className="ticket-label">
                {/* Display ticket type and price */}
                {ticket.type} – <span className="ticket-price">${ticket.price.toLocaleString()}</span>
              </div>
              {/* Dropdown selector to choose the quantity of tickets */}
              <select
                className="ticket-select"
                value={quantities[ticket.type] || 0}  // Bind the select value to the quantities state
                onChange={(e) => handleChange(ticket.type, e.target.value)}  // Update state on change
              >
                {/* Provide options for selecting ticket quantity (0 to 5) */}
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Button to confirm the purchase and calculate total price */}
        <button className="purchase-button" onClick={handlePurchase}>
          Confirm Purchase
        </button>
      </div>
    </div>
  );
}

export default ConcertPage;
