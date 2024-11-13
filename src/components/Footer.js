// src/components/Footer.js
import React from 'react';
import './Footer.css';
import { FaInstagram, FaFacebook, FaPhone } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-icons">
                <a href="https://www.instagram.com/creea.proteccion" target="_blank" rel="noopener noreferrer">
                    <FaInstagram size={24} />
                </a>
                <a href="https://www.facebook.com/CREEAProtección" target="_blank" rel="noopener noreferrer">
                    <FaFacebook size={24} />
                </a>
                <a href="tel:+523334648999">
                    <FaPhone size={24} />
                </a>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 CreeaApp. Todos los derechos reservados.</p>
            </div>
            <p>
                    <a href="/terms">Términos y Condiciones</a> | <a href="/privacy">Política de Privacidad</a>
                </p>
        </footer>
    );
};

export default Footer;
