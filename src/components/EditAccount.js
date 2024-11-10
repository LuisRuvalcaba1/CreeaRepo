import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './EditAccount.css';

const EditAccount = () => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        fechaNacimiento: '',
        nacionalidad: '',
        ocupacion: '',
        sexo: '',
        estadoCivil: '',
        domicilio: '',
        correoElectronico: '',
        giro: '',
        tipoActividad: '',
        entidadFederativa: '',
        ingresosAnuales: '',
        origenPatrimonio: '',
        habitosToxicos: '',
        descripcionHabitos: '',
        password: '',
    });

    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId'); // Obtiene el userId del sessionStorage

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                console.error("userId no encontrado en sessionStorage");
                return;
            }

            try {
                const response = await fetch(`/api/client-data?userId=${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setFormData({
                        nombreCompleto: data.nombre_completo,
                        fechaNacimiento: new Date(data.fecha_nacimiento).toISOString().split('T')[0],
                        nacionalidad: data.nacionalidad,
                        ocupacion: data.ocupacion_profesion,
                        sexo: data.sexo,
                        estadoCivil: data.estado_civil,
                        domicilio: data.domicilio_completo,
                        correoElectronico: data.correo_electronico,
                        giro: data.giro_actividad,
                        tipoActividad: data.tipo_actividad,
                        entidadFederativa: data.entidad_federativa_nacimiento,
                        ingresosAnuales: data.ingresos_anuales,
                        origenPatrimonio: data.origen_patrimonio,
                        habitosToxicos: data.habitos_toxicologicos,
                        descripcionHabitos: data.descripcion_habitos || '',
                        password: data.password,
                    });
                } else {
                    console.error('Error al obtener los datos del usuario:', data.message);
                }
            } catch (error) {
                console.error('Error al obtener los datos del usuario:', error);
            }
        };

        fetchUserData();
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
            const response = await fetch(`/api/update-client?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Perfil actualizado correctamente');
                navigate('/client-home');
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
                <h2>Editar Cuenta</h2>
                <form onSubmit={handleSubmit} className="edit-account-form">
                    <label>Nombre Completo</label>
                    <input
                        type="text"
                        name="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={handleChange}
                        required
                    />

                    <label>Fecha de Nacimiento</label>
                    <input
                        type="date"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        required
                    />

                    <label>Nacionalidad</label>
                    <input
                        type="text"
                        name="nacionalidad"
                        value={formData.nacionalidad}
                        onChange={handleChange}
                        required
                    />

                    <label>Ocupación o Profesión</label>
                    <input
                        type="text"
                        name="ocupacion"
                        value={formData.ocupacion}
                        onChange={handleChange}
                        required
                    />

                    <label>Sexo</label>
                    <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        required
                    >
                        <option value="Mujer">Mujer</option>
                        <option value="Hombre">Hombre</option>
                    </select>

                    <label>Estado Civil</label>
                    <select
                        name="estadoCivil"
                        value={formData.estadoCivil}
                        onChange={handleChange}
                        required
                    >
                        <option value="Soltero">Soltero</option>
                        <option value="Casado">Casado</option>
                    </select>

                    <label>Domicilio Completo</label>
                    <input
                        type="text"
                        name="domicilio"
                        value={formData.domicilio}
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

                    <label>Giro</label>
                    <input
                        type="text"
                        name="giro"
                        value={formData.giro}
                        onChange={handleChange}
                        required
                    />

                    <label>Especifique brevemente el tipo de actividad</label>
                    <input
                        type="text"
                        name="tipoActividad"
                        value={formData.tipoActividad}
                        onChange={handleChange}
                        required
                    />

                    <label>Entidad Federativa de Nacimiento</label>
                    <input
                        type="text"
                        name="entidadFederativa"
                        value={formData.entidadFederativa}
                        onChange={handleChange}
                        required
                    />

                    <label>Ingresos Anuales</label>
                    <input
                        type="number"
                        name="ingresosAnuales"
                        value={formData.ingresosAnuales}
                        onChange={handleChange}
                        required
                    />

                    <label>Origen del Patrimonio</label>
                    <input
                        type="text"
                        name="origenPatrimonio"
                        value={formData.origenPatrimonio}
                        onChange={handleChange}
                        required
                    />

                    <label>Hábitos Toxicológicos</label>
                    <select
                        name="habitosToxicos"
                        value={formData.habitosToxicos}
                        onChange={handleChange}
                        required
                    >
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                    </select>

                    <label>Descripción de los Hábitos Toxicológicos</label>
                    <textarea
                        name="descripcionHabitos"
                        value={formData.descripcionHabitos}
                        onChange={handleChange}
                    ></textarea>

                    <label>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">Guardar Cambios</button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditAccount;
