import React from 'react';
import Concert from './Concert';

const concertsData = [
  { id: 1, name: 'Rock Concert', date: '2025-05-10', price: 50 },
  { id: 2, name: 'Jazz Concert', date: '2025-06-20', price: 30 },
  { id: 3, name: 'Electronic Concert', date: '2025-07-15', price: 40 },
  { id: 4, name: 'Classical Concert', date: '2025-08-25', price: 60 }
];

const Concerts = () => {
  return (
    <div>
      {concertsData.map((concert) => (
        <Concert key={concert.id} concert={concert} />
      ))}
    </div>
  );
};

export default Concerts;
