import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './SignUpPromoter.css';

const SignUpPromoter = () => {
    const [formData, setFormData] = useState({
        correo: '',
        nombreCompleto: '',
        nombrePromotoria: '',
        zona: '',
        numeroPromotoria: '',
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

        // Validar Correo Electrónico
        if (!/^[\w-.]+@gmail\.com$/.test(formData.correo) || formData.correo.length > 100) {
            tempErrors.correo = 'Correo electrónico debe tener una terminación @gmail.com válida y máximo 100 caracteres.';
        }

        // Validar Nombre Completo
        if (!/^[A-Za-z\s]{1,255}$/.test(formData.nombreCompleto)) {
            tempErrors.nombreCompleto = 'Nombre completo debe contener solo letras y espacios, y tener máximo 255 caracteres.';
        }

        // Validar Nombre de la Promotoría
        if (!formData.nombrePromotoria || formData.nombrePromotoria.length > 255) {
            tempErrors.nombrePromotoria = 'El nombre de la promotoría debe contener máximo 255 caracteres.';
        }

        // Validar Zona
        if (!formData.zona || formData.zona.length > 100) {
            tempErrors.zona = 'La zona debe contener máximo 100 caracteres.';
        }

        // Validar Número de Promotoría
        if (!/^\d{1,5}$/.test(formData.numeroPromotoria)) {
            tempErrors.numeroPromotoria = 'Número de Promotoría debe ser un número de máximo 5 dígitos.';
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
                const response = await fetch('/api/register-promoter', {
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
                    alert(data.message || 'Error al registrar el promotor');
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
            <div className="signup-promoter-container">
                <div className="signup-promoter-box">
                    <h2>Registro de Promotor</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="correo"
                            placeholder="Correo Electrónico"
                            className="signup-promoter-input"
                            value={formData.correo}
                            onChange={handleChange}
                        />
                        {errors.correo && <div className="error">{errors.correo}</div>}

                        <input
                            type="text"
                            name="nombreCompleto"
                            placeholder="Nombre Completo"
                            className="signup-promoter-input"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                        />
                        {errors.nombreCompleto && <div className="error">{errors.nombreCompleto}</div>}

                        <input
                            type="text"
                            name="nombrePromotoria"
                            placeholder="Nombre de la Promotoría"
                            className="signup-promoter-input"
                            value={formData.nombrePromotoria}
                            onChange={handleChange}
                        />
                        {errors.nombrePromotoria && <div className="error">{errors.nombrePromotoria}</div>}

                        <select
                            name="zona"
                            value={formData.zona}
                            onChange={handleChange}
                            className="signup-promoter-input"
                        >
                            <option value="">Selecciona una Zona</option>
                            <option value="Direccion Occidente Pacifico">Dirección Occidente Pacifico</option>
                            <option value="Direccion Norte">Direccion Norte</option>
                            <option value="Dirección Peninsula">Dirección Peninsula</option>
                            <option value="Dirección Centro">Dirección Centro</option>
                            <option value="Direccion Sur">Direccion Sur</option>
                        </select>
                        {errors.zona && <div className="error">{errors.zona}</div>}

                        <input
                            type="text"
                            name="numeroPromotoria"
                            placeholder="Número de Promotoría"
                            className="signup-promoter-input"
                            value={formData.numeroPromotoria}
                            onChange={handleChange}
                        />
                        {errors.numeroPromotoria && <div className="error">{errors.numeroPromotoria}</div>}

                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            className="signup-promoter-input"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <div className="error">{errors.password}</div>}

                        <button type="submit" className="signup-promoter-button">Registrarse</button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SignUpPromoter;
