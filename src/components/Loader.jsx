import React from 'react';
import './Loader.css'; // Este archivo lo crearemos también para los estilos

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Cargando...</p> { /* Usamos la clase loader-container para mostrar una pagina de carga. Este componente se agrega aa cualquier pagina que necesite cargar algo. */}
    </div>
  );
};

export default Loader;
