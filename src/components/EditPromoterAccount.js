import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './EditAccount.css';

const EditPromoterAccount = () => {
    const [formData, setFormData] = useState({
        correo: '',
        nombreCompleto: '',
        nombrePromotoria: '',
        zona: '',
        numeroPromotoria: '',
        telefono: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId');

    useEffect(() => {
        const fetchPromoterData = async () => {
            try {
                const response = await fetch(`/api/promoter-data?userId=${userId}`);
                const data = await response.json();
                if (response.ok) {
                    setFormData({
                        correo: data.correo_electronico,
                        nombreCompleto: data.nombre_completo,
                        nombrePromotoria: data.nombre_promotoria,
                        zona: data.zona,
                        numeroPromotoria: data.numero_promotoria,
                        telefono: data.telefono || '',
                        password: ''
                    });
                } else {
                    console.error('Error al obtener los datos del promotor:', data.message);
                }
            } catch (error) {
                console.error('Error al obtener los datos del promotor:', error);
            }
        };
        fetchPromoterData();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validate = () => {
        let tempErrors = {};
        if (!/^[A-Za-z\s]{1,255}$/.test(formData.nombreCompleto)) {
            tempErrors.nombreCompleto = 'El nombre debe contener solo letras y espacios, y tener máximo 255 caracteres.';
        }
        if (!/^[\w-.]+@gmail\.com$/.test(formData.correo) || formData.correo.length > 100) {
            tempErrors.correo = 'El correo debe tener formato @gmail.com y máximo 100 caracteres.';
        }
        if (!/^[A-Za-z\s]{1,50}$/.test(formData.nombrePromotoria)) {
            tempErrors.nombrePromotoria = 'Nombre de la promotoría debe contener solo letras y espacios, máximo 50 caracteres.';
        }
        if (!/^\d{1,10}$/.test(formData.numeroPromotoria)) {
            tempErrors.numeroPromotoria = 'Número de Promotoría debe ser numérico con un máximo de 10 dígitos.';
        }
        if (!/^\d{10}$/.test(formData.telefono)) {
            tempErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos.';
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])(?=.{8,})/.test(formData.password)) {
            tempErrors.password = 'Contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const response = await fetch(`/api/update-promoter?userId=${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Perfil actualizado correctamente');
                    navigate('/promoter-home');
                } else {
                    alert(data.message || 'Error al actualizar el perfil');
                }
            } catch (error) {
                console.error('Error durante la actualización:', error);
                alert('Error de conexión con el servidor');
            }
        }
    };

    return (
        <div className="edit-account-container">
            <Header />
            <div className="edit-account-content">
                <h2>Editar Cuenta de Promotor</h2>
                <form onSubmit={handleSubmit} className="edit-account-form">
                    <label>Correo Electrónico</label>
                    <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                    />
                    {errors.correo && <div className="error">{errors.correo}</div>}

                    <label>Nombre Completo</label>
                    <input
                        type="text"
                        name="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={handleChange}
                        required
                    />
                    {errors.nombreCompleto && <div className="error">{errors.nombreCompleto}</div>}

                    <label>Nombre de la Promotoría</label>
                    <input
                        type="text"
                        name="nombrePromotoria"
                        value={formData.nombrePromotoria}
                        onChange={handleChange}
                        required
                    />
                    {errors.nombrePromotoria && <div className="error">{errors.nombrePromotoria}</div>}

                    <label>Zona</label>
                    <input
                        type="text"
                        name="zona"
                        value={formData.zona}
                        onChange={handleChange}
                        required
                    />

                    <label>Número de Promotoría</label>
                    <input
                        type="text"
                        name="numeroPromotoria"
                        value={formData.numeroPromotoria}
                        onChange={handleChange}
                        required
                    />
                    {errors.numeroPromotoria && <div className="error">{errors.numeroPromotoria}</div>}

                    <label>Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />
                    {errors.telefono && <div className="error">{errors.telefono}</div>}

                    <label>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {errors.password && <div className="error">{errors.password}</div>}

                    <button type="submit" className="edit-account-button">Guardar Cambios</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditPromoterAccount;
