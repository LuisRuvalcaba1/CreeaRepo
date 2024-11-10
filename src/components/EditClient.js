// EditClient.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './EditClient.css';

const EditClient = () => {
    const [clientData, setClientData] = useState({
        nombreCompleto: '',
        correoElectronico: '',
        telefono: '',
        direccion: ''
    });
    const [errors, setErrors] = useState({});
    const { clientId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const response = await fetch(`/api/get-client/${clientId}`);
                const data = await response.json();
                setClientData(data);
            } catch (error) {
                console.error('Error fetching client data:', error);
            }
        };
        fetchClientData();
    }, [clientId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClientData({
            ...clientData,
            [name]: value,
        });
    };

    const validate = () => {
        let tempErrors = {};

        if (!/^[A-Za-z\s]{1,255}$/.test(clientData.nombreCompleto)) {
            tempErrors.nombreCompleto = 'Nombre debe contener solo letras y espacios (máx 255 caracteres)';
        }
        if (!/^[\w-.]+@gmail\.com$/.test(clientData.correoElectronico)) {
            tempErrors.correoElectronico = 'Correo debe tener terminación @gmail.com';
        }
        if (!/^\d{10}$/.test(clientData.telefono)) {
            tempErrors.telefono = 'Teléfono debe tener 10 dígitos';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const response = await fetch(`/api/update-client/${clientId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientData),
                });

                if (response.ok) {
                    alert('Datos actualizados correctamente');
                    navigate('/manage-users');
                } else {
                    alert('Error al actualizar');
                }
            } catch (error) {
                console.error('Error al actualizar datos:', error);
            }
        }
    };

    return (
        <div className="edit-client-container">
            <Header />
            <div className="edit-client-content">
                <h2>Editar Cliente</h2>
                <form onSubmit={handleSubmit}>
                    <label>Nombre Completo</label>
                    <input type="text" name="nombreCompleto" value={clientData.nombreCompleto} onChange={handleChange} />
                    {errors.nombreCompleto && <div className="error">{errors.nombreCompleto}</div>}

                    <label>Correo Electrónico</label>
                    <input type="email" name="correoElectronico" value={clientData.correoElectronico} onChange={handleChange} />
                    {errors.correoElectronico && <div className="error">{errors.correoElectronico}</div>}

                    <label>Teléfono</label>
                    <input type="text" name="telefono" value={clientData.telefono} onChange={handleChange} />
                    {errors.telefono && <div className="error">{errors.telefono}</div>}

                    <label>Dirección</label>
                    <input type="text" name="direccion" value={clientData.direccion} onChange={handleChange} />

                    <button type="submit">Guardar Cambios</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditClient;
