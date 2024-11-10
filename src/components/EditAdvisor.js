// EditAdvisor.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './EditAdvisor.css';

const EditAdvisor = () => {
    const [advisorData, setAdvisorData] = useState({
        nombreCompleto: '',
        correoElectronico: '',
        telefono: '',
        claveAgente: ''
    });
    const [errors, setErrors] = useState({});
    const { advisorId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdvisorData = async () => {
            try {
                const response = await fetch(`/api/get-advisor/${advisorId}`);
                const data = await response.json();
                setAdvisorData(data);
            } catch (error) {
                console.error('Error fetching advisor data:', error);
            }
        };
        fetchAdvisorData();
    }, [advisorId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdvisorData({
            ...advisorData,
            [name]: value,
        });
    };

    const validate = () => {
        let tempErrors = {};

        if (!/^[A-Za-z\s]{1,255}$/.test(advisorData.nombreCompleto)) {
            tempErrors.nombreCompleto = 'Nombre debe contener solo letras y espacios (máx 255 caracteres)';
        }
        if (!/^[\w-.]+@gmail\.com$/.test(advisorData.correoElectronico)) {
            tempErrors.correoElectronico = 'Correo debe tener terminación @gmail.com';
        }
        if (!/^\d{10}$/.test(advisorData.telefono)) {
            tempErrors.telefono = 'Teléfono debe tener 10 dígitos';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const response = await fetch(`/api/update-advisor/${advisorId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(advisorData),
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
        <div className="edit-advisor-container">
            <Header />
            <div className="edit-advisor-content">
                <h2>Editar Asesor</h2>
                <form onSubmit={handleSubmit}>
                    <label>Nombre Completo</label>
                    <input type="text" name="nombreCompleto" value={advisorData.nombreCompleto} onChange={handleChange} />
                    {errors.nombreCompleto && <div className="error">{errors.nombreCompleto}</div>}

                    <label>Correo Electrónico</label>
                    <input type="email" name="correoElectronico" value={advisorData.correoElectronico} onChange={handleChange} />
                    {errors.correoElectronico && <div className="error">{errors.correoElectronico}</div>}

                    <label>Teléfono</label>
                    <input type="text" name="telefono" value={advisorData.telefono} onChange={handleChange} />
                    {errors.telefono && <div className="error">{errors.telefono}</div>}

                    <label>Clave de Agente</label>
                    <input type="text" name="claveAgente" value={advisorData.claveAgente} onChange={handleChange} />

                    <button type="submit">Guardar Cambios</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditAdvisor;
