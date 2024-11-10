import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './LogIn.css';

const LogIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('cliente'); 
    const [errorMessage, setErrorMessage] = useState(''); 
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (username && password) {
            try {
                const response = await fetch('/api/login', {  
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password, userType }),
                });
    
                const data = await response.json();
    
                if (data.success) {
                    // Guardar userId y userType en sessionStorage
                    sessionStorage.setItem('userId', data.userId); 
                    sessionStorage.setItem('userType', userType); // Guardar el tipo de usuario

                    // Redirigir según el tipo de usuario
                    if (userType === 'cliente') {
                        navigate('/client-home');
                    } else if (userType === 'asesor') {
                        navigate('/advisor-home');
                    } else if (userType === 'promotor/administrador') {
                        navigate('/promoter-home');
                    }
                } else {
                    // Mostrar mensaje de error si el usuario no se encuentra
                    setErrorMessage(data.message || 'Usuario no encontrado. ¿Deseas registrarte?');
                }
            } catch (error) {
                console.error('Error en la autenticación:', error);
                setErrorMessage('Error de conexión con el servidor.');
            }
        } else {
            alert('Por favor, ingrese su usuario y contraseña.');
        }
    };

    const handleRegisterClick = () => {
        navigate('/user-type-selection');
    };

    return (
        <div className="App">
            <Header />
            <div className="login-container">
                <div className="login-box">
                    <h2>Log In</h2>
                    <input
                        type="text"
                        placeholder="Usuario"
                        className="login-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <select
                        className="login-select"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                    >
                        <option value="cliente">Cliente</option>
                        <option value="asesor">Asesor</option>
                        <option value="promotor/administrador">Promotor</option>
                    </select>
                    <button className="login-button" onClick={handleLogin}>
                        Ingresar
                    </button>
                    {errorMessage && (
                        <div className="error-message">
                            {errorMessage}
                            <span
                                className="register-option"
                                onClick={handleRegisterClick}
                                style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}
                            >
                                Regístrate aquí
                            </span>
                        </div>
                    )}
                    <a href="/forgot-password" className="forgot-password">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>
                <span
                    className="user-type-selection"
                    onClick={handleRegisterClick}
                    style={{ color: 'white', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    ¿No tienes cuenta? Regístrate
                </span>
            </div>
            <Footer />
        </div>
    );
};

export default LogIn;
