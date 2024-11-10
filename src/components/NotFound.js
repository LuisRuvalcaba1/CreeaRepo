// NotFound.js

import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-message">Página no encontrada</p>
      <Link to="/" className="notfound-home-link">
        Volver a la página de inicio
      </Link>
    </div>
  );
};

export default NotFound;
