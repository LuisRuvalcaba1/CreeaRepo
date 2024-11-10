import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './VerifyCode.css';

const VerifyCode = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            // Enviar el código al backend para verificarlo
            const response = await fetch('/api/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, verificationCode: verificationCode.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Código verificado exitosamente.');
                setTimeout(() => {
                    navigate('/login');  
                }, 2000);
            } else {
                setError(data.message || 'El código de verificación es incorrecto.');
            }
        } catch (err) {
            setError('Hubo un problema al verificar el código. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="App">
            <Header />
            <div className="verify-code-container">
                <div className="verify-code-box">
                    <h2>Verificar Código</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>Código de Verificación</label>
                            <input
                                type="text"
                                name="verificationCode"
                                className="verify-code-input"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="error">{error}</div>}
                        {successMessage && <div className="success">{successMessage}</div>}
                        <button type="submit" className="verify-code-button">Verificar Código</button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VerifyCode;
