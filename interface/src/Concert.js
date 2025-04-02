import React, { useState } from 'react';

const Concert = ({ concert }) => {
  const [tickets, setTickets] = useState(0);

  const handleTicketsChange = (event) => {
    setTickets(event.target.value);
  };

  const calculateTotal = () => {
    return tickets * concert.price;
  };

  return (
    <div className="concert">
      <h2>{concert.name}</h2>
      <p>Fecha: {concert.date}</p>
      <p>Precio por entrada: ${concert.price}</p>
      <label>
        Número de entradas:
        <input
          type="number"
          value={tickets}
          onChange={handleTicketsChange}
          min="0"
        />
      </label>
      <div>
        <strong>Total a pagar: ${calculateTotal()}</strong>
      </div>
      <button disabled={tickets <= 0}>Comprar Entradas</button>
    </div>
  );
};

export default Concert;
