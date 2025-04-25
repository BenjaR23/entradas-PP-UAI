import React from 'react';
import './Loader.css'; // Este archivo lo crearemos también para los estilos

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Cargando...</p>
    </div>
  );
};

export default Loader;
