import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logo.png';

const Header = () => {
    const navigate = useNavigate();

    const handleAccountClick = () => {
        const userId = sessionStorage.getItem('userId');
        const userType = sessionStorage.getItem('userType');

        if (userId) {
            if (userType === 'cliente') {
                navigate('/edit-account-client');
            } else if (userType === 'asesor') {
                navigate('/edit-account-advisor');
            } else if (userType === 'promotor/administrador') {
                navigate('/edit-account-promoter');
            } else {
                console.error("Tipo de usuario no reconocido.");
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        // Eliminar la información de la sesión
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userType');
        
        // Redirigir al usuario a la página de inicio de sesión
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="logo">
                <img src={logo} alt="CreeaApp Logo" className="logo-img" />
                <h1>CreeaApp</h1>
            </div>
            <nav>
                <ul className="nav-links">
                    <li><a href="/">Inicio</a></li>
                    <li>
                        <button 
                            onClick={handleAccountClick} 
                            className="link-button"
                        >
                            Mi cuenta
                        </button>
                    </li>
                    <li><a href="/contact">Contacto</a></li>
                    <li>
                        <button 
                            onClick={handleLogout} 
                            className="link-button"
                        >
                            Cerrar sesión
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
