// src/components/SignUpAdvisor.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './SignUpAdvisor.css';

const SignUpAdvisor = () => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        correo: '',
        numeroIdentificacion: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validate = () => {
        let tempErrors = {};

        // Validar Nombre Completo
        if (!/^[A-Za-z\s]{1,255}$/.test(formData.nombreCompleto)) {
            tempErrors.nombreCompleto = 'Nombre completo debe contener solo letras y espacios, y tener máximo 255 caracteres.';
        }

        // Validar Correo Electrónico
        if (!/^[\w-.]+@gmail\.com$/.test(formData.correo) || formData.correo.length > 100) {
            tempErrors.correo = 'Correo electrónico debe tener una terminación @gmail.com válida y máximo 100 caracteres.';
        }

        // Validar Número de Identificación
        if (!/^\d{1,5}$/.test(formData.numeroIdentificacion)) {
            tempErrors.numeroIdentificacion = 'Número de Identificación Personal debe ser un número de máximo 5 dígitos.';
        }

        // Validar Contraseña
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])(?=.{8,})/.test(formData.password)) {
            tempErrors.password = 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un carácter especial.';
        }

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Formulario válido. Enviando datos...');

            try {
                const response = await fetch('/api/register-advisor', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.ok) {
                    // Redirigir a la página de verificación de código
                    navigate('/verify-code', { state: { email: formData.correo } });
                } else {
                    alert(data.message || 'Error al registrar el asesor');
                }
            } catch (error) {
                console.error('Error durante el registro:', error);
                alert('Error de conexión con el servidor');
            }
        } else {
            console.log('Formulario inválido. Corrige los errores y vuelve a intentar.');
        }
    };

    return (
        <div className="App">
            <Header />
            <div className="signupadvisor-container">
                <div className="signupadvisor-box">
                    <h2>Registro de Asesor</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="nombreCompleto"
                            placeholder="Nombre Completo"
                            className="signupadvisor-input"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                        />
                        {errors.nombreCompleto && <div className="error">{errors.nombreCompleto}</div>}

                        <input
                            type="email"
                            name="correo"
                            placeholder="Correo electrónico (terminación @gmail.com)"
                            className="signupadvisor-input"
                            value={formData.correo}
                            onChange={handleChange}
                        />
                        {errors.correo && <div className="error">{errors.correo}</div>}

                        <input
                            type="text"
                            name="numeroIdentificacion"
                            placeholder="Número de Identificación Personal"
                            className="signupadvisor-input"
                            value={formData.numeroIdentificacion}
                            onChange={handleChange}
                        />
                        {errors.numeroIdentificacion && <div className="error">{errors.numeroIdentificacion}</div>}

                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            className="signupadvisor-input"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <div className="error">{errors.password}</div>}

                        <button type="submit" className="signupadvisor-button">Registrar</button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SignUpAdvisor;
