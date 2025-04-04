import { useParams } from 'react-router-dom';
import { concerts } from '../data';
import { useState } from 'react';

function ConcertPage() {
  const { id } = useParams();
  const concert = concerts.find(c => c.id === id);

  const [quantities, setQuantities] = useState(
    concert.tickets.reduce((acc, ticket) => {
      acc[ticket.type] = 0;
      return acc;
    }, {})
  );

  const handleChange = (type, value) => {
    setQuantities(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  };

  const handlePurchase = () => {
    const total = concert.tickets.reduce((acc, ticket) => {
      return acc + ticket.price * quantities[ticket.type];
    }, 0);
    alert(`Total: $${total.toLocaleString()}`);
  };

  return (
    <div className="concert-container">
      <div className="concert-box">
        <h1 className="concert-title">{concert.name}</h1>
        <p className="concert-subinfo">{concert.date} – {concert.location}</p>
    
        <h2 className="concert-subinfo">Select Your Tickets</h2>
        <div>
          {concert.tickets.map(ticket => (
            <div key={ticket.type} className="ticket-type">
              <div className="ticket-label">
                {ticket.type} – <span className="ticket-price">${ticket.price.toLocaleString()}</span>
              </div>
              <select
                className="ticket-select"
                value={quantities[ticket.type]}
                onChange={(e) => handleChange(ticket.type, e.target.value)}
              >
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      
        <button className="purchase-button" onClick={handlePurchase}>
          Confirm Purchase
        </button>
      </div>
    </div>

  );
}

export default ConcertPage;
