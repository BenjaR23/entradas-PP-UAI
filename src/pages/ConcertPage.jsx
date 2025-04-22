import { useParams } from 'react-router-dom';  // Import useParams to retrieve dynamic route parameters
import concerts from '../../public/data/concerts.js';  // Import concert data from the concerts.js file
import { useState } from 'react';  // Import useState hook to manage component state

function ConcertPage() {
  // Use useParams to get the dynamic 'id' from the URL
  const { id } = useParams();
  
  // Find the concert object that matches the 'id' from the concerts array
  const concert = concerts.find(c => c.id === parseInt(id));

  // Initialize quantities state based on concert ticket types, with all initial quantities set to 0
  const [quantities, setQuantities] = useState(
    concert.tickets.reduce((acc, ticket) => {
      acc[ticket.type] = 0;  // Set each ticket type's initial quantity to 0
      return acc;
    }, {})
  );

  // Handle changes in the ticket quantity selector
  const handleChange = (type, value) => {
    setQuantities(prev => ({
      ...prev,
      [type]: parseInt(value)  // Update the quantity for the selected ticket type
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
                value={quantities[ticket.type]}  // Bind the select value to the quantities state
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
