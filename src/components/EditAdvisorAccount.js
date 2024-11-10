import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './EditAccount.css';

const EditAdvisorAccount = () => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        claveAgente: '',
        correoElectronico: '',
        password: '',
    });

    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId'); // Obtiene el userId del sessionStorage

    useEffect(() => {
        const fetchAdvisorData = async () => {
            if (!userId) {
                console.error("userId no encontrado en sessionStorage");
                return;
            }

            try {
                const response = await fetch(`/api/advisor-data?userId=${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setFormData({
                        nombreCompleto: data.nombre_completo,
                        claveAgente: data.clave_agente,
                        correoElectronico: data.correo_electronico,
                        password: '', // La contraseña no se obtiene por seguridad
                    });
                } else {
                    console.error('Error al obtener los datos del asesor:', data.message);
                }
            } catch (error) {
                console.error('Error al obtener los datos del asesor:', error);
            }
        };

        fetchAdvisorData();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert('No se pudo actualizar el perfil. ID de usuario no encontrado.');
            return;
        }

        try {
            const response = await fetch(`/api/update-advisor?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Perfil actualizado correctamente');
                navigate('/advisor-home');
            } else {
                alert(data.message || 'Error al actualizar el perfil');
            }
        } catch (error) {
            console.error('Error durante la actualización:', error);
            alert('Error de conexión con el servidor');
        }
    };

    return (
        <div className="edit-account-container">
            <Header />
            <div className="edit-account-content">
                <h2>Editar Cuenta de Asesor</h2>
                <form onSubmit={handleSubmit} className="edit-account-form">
                    <label>Nombre Completo</label>
                    <input
                        type="text"
                        name="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={handleChange}
                        required
                    />

                    <label>Clave de Agente</label>
                    <input
                        type="text"
                        name="claveAgente"
                        value={formData.claveAgente}
                        onChange={handleChange}
                        required
                    />

                    <label>Correo Electrónico</label>
                    <input
                        type="email"
                        name="correoElectronico"
                        value={formData.correoElectronico}
                        onChange={handleChange}
                        required
                    />

                    <label>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="edit-account-button">Guardar cambios</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditAdvisorAccount;
