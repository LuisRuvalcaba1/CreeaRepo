import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from './Header';
import Footer from './Footer';
import './SignUpClient.css';

const SignUpClient = () => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        fechaNacimiento: '',
        nacionalidad: '',
        ocupacion: '',
        sexo: '',
        estadoCivil: '',
        domicilio: '',
        correo: '',
        giro: '',
        tipoActividad: '',
        entidadFederativa: '',
        ingresosAnuales: '',
        origenPatrimonio: '',
        habitosToxicos: '',
        especificarHabitos: '',
        password: '',
        idAsesorSeleccionado: '' 
    });

    const [errors, setErrors] = useState({});
    const [asesores, setAsesores] = useState([]); 
    const [showTooltip, setShowTooltip] = useState(false);

    const navigate = useNavigate();

    const handleTooltipToggle = () => {
        setShowTooltip(!showTooltip); 
    };

    useEffect(() => {
        const fetchAsesores = async () => {
            try {
                const response = await fetch('/api/obtener-asesores'); 
                const data = await response.json();
                setAsesores(data); 
            } catch (error) {
                console.error('Error al obtener asesores:', error);
            }
        };
    
        fetchAsesores();
    }, []);
    ;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateDate = (dateStr) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateStr);
    };

    const validate = () => {
        let tempErrors = {};

        // Validar Nombre Completo
        if (!/^[A-Za-z\s]{1,255}$/.test(formData.nombreCompleto)) {
            tempErrors.nombreCompleto = 'Nombre completo debe contener solo letras y espacios, sin caracteres especiales ni números, y tener máximo 255 caracteres.';
        }

        // Validar Fecha de Nacimiento en formato YYYY-MM-DD
        if (!validateDate(formData.fechaNacimiento)) {
            tempErrors.fechaNacimiento = 'La fecha de nacimiento debe estar en formato YYYY-MM-DD (Ejemplo: 2005-07-02).';
        }

        // Validar Nacionalidad
        if (!/^[A-Za-z\s]{1,55}$/.test(formData.nacionalidad)) {
            tempErrors.nacionalidad = 'Nacionalidad debe contener solo letras y espacios, y tener máximo 55 caracteres.';
        }

        // Validar Ocupación o Profesión
        if (!/^[A-Za-z0-9\s]{1,55}$/.test(formData.ocupacion)) {
            tempErrors.ocupacion = 'Ocupación o Profesión debe contener solo letras, números y espacios, y tener máximo 55 caracteres.';
        }

        // Validar Sexo
        if (!['Mujer', 'Hombre'].includes(formData.sexo)) {
            tempErrors.sexo = 'Debe seleccionar "Mujer" o "Hombre" en el campo Sexo.';
        }

        // Validar Estado Civil
        if (!['Soltero', 'Casado'].includes(formData.estadoCivil)) {
            tempErrors.estadoCivil = 'Debe seleccionar "Soltero" o "Casado" en el campo Estado Civil.';
        }

        // Validar Domicilio Completo
        if (!formData.domicilio || formData.domicilio.length > 255) {
            tempErrors.domicilio = 'Domicilio completo debe contener máximo 255 caracteres.';
        }

        // Validar Correo Electrónico
        if (!/^[\w-.]+@gmail\.com$/.test(formData.correo) || formData.correo.length > 100) {
            tempErrors.correo = 'Correo electrónico debe tener una terminación @gmail.com válida y máximo 100 caracteres.';
        }

        // Validar Giro, Actividad u Objeto Social
        if (!formData.giro || formData.giro.length > 255) {
            tempErrors.giro = 'Giro, actividad u objeto social debe contener máximo 255 caracteres.';
        }

        // Validar Especificar brevemente el tipo de actividad
        if (!formData.tipoActividad || formData.tipoActividad.length > 255) {
            tempErrors.tipoActividad = 'El tipo de actividad debe contener máximo 255 caracteres.';
        }

        // Validar Entidad Federativa de nacimiento
        if (!formData.entidadFederativa) {
            tempErrors.entidadFederativa = 'Debe seleccionar una entidad federativa válida.';
        }

        // Validar Ingresos Anuales
        if (!/^\d{1,10}$/.test(formData.ingresosAnuales)) {
            tempErrors.ingresosAnuales = 'Ingresos anuales debe ser un número de máximo 10 dígitos.';
        }

        // Validar Hábitos Toxicológicos
        if (!['Sí', 'No'].includes(formData.habitosToxicos)) {
            tempErrors.habitosToxicos = 'Debe seleccionar "Sí" o "No" en el campo Hábitos Toxicológicos.';
        } else if (formData.habitosToxicos === 'Sí' && (!formData.especificarHabitos || formData.especificarHabitos.length > 255)) {
            tempErrors.especificarHabitos = 'Debe especificar el hábito y contener máximo 255 caracteres.';
        }

        // Validar Contraseña
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])(?=.{8,})/.test(formData.password)) {
            tempErrors.password = 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un carácter especial.';
        }

        setErrors(tempErrors);
        console.log('Errores:', tempErrors);
        console.log('Datos del formulario:', formData);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Formulario válido. Enviando datos...');
    
            try {
                const response = await fetch('/api/register-client', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    navigate('/verify-code', { state: { email: formData.correo } });
                } else {
                    alert(data.message || 'Error al registrar el cliente');
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
            <div className="signup-container">
                <div className="signup-box">
                    <h2>Registro de Cliente</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="nombreCompleto"
                            placeholder="Nombre Completo"
                            className="signup-input"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                        />
                        {errors.nombreCompleto && <div className="error">{errors.nombreCompleto}</div>}

                        <input
                            type="text"
                            name="fechaNacimiento"
                            placeholder="Fecha de nacimiento (YYYY-MM-DD)"
                            className="signup-input"
                            value={formData.fechaNacimiento}
                            onChange={handleChange}
                        />
                        {errors.fechaNacimiento && <div className="error">{errors.fechaNacimiento}</div>}

                        <input
                            type="text"
                            name="nacionalidad"
                            placeholder="Nacionalidad"
                            className="signup-input"
                            value={formData.nacionalidad}
                            onChange={handleChange}
                        />
                        {errors.nacionalidad && <div className="error">{errors.nacionalidad}</div>}

                        <input
                            type="text"
                            name="ocupacion"
                            placeholder="Ocupación o Profesión"
                            className="signup-input"
                            value={formData.ocupacion}
                            onChange={handleChange}
                        />
                        {errors.ocupacion && <div className="error">{errors.ocupacion}</div>}

                        <select
                            name="sexo"
                            className="signup-input"
                            value={formData.sexo}
                            onChange={handleChange}
                        >
                            <option value="">Sexo</option>
                            <option value="Mujer">Femenino</option>
                            <option value="Hombre">Masculino</option>
                        </select>
                        {errors.sexo && <div className="error">{errors.sexo}</div>}

                        <select
                            name="estadoCivil"
                            className="signup-input"
                            value={formData.estadoCivil}
                            onChange={handleChange}
                        >
                            <option value="">Estado Civil</option>
                            <option value="Soltero">Soltero</option>
                            <option value="Casado">Casado</option>
                        </select>
                        {errors.estadoCivil && <div className="error">{errors.estadoCivil}</div>}

                        <input
                            type="text"
                            name="domicilio"
                            placeholder="Domicilio Completo"
                            className="signup-input"
                            value={formData.domicilio}
                            onChange={handleChange}
                        />
                        {errors.domicilio && <div className="error">{errors.domicilio}</div>}

                        <input
                            type="email"
                            name="correo"
                            placeholder="Correo electrónico (terminación @gmail.com)"
                            className="signup-input"
                            value={formData.correo}
                            onChange={handleChange}
                        />
                        {errors.correo && <div className="error">{errors.correo}</div>}

                        <input
                            type="text"
                            name="giro"
                            placeholder="Giro, actividad u objeto social"
                            className="signup-input"
                            value={formData.giro}
                            onChange={handleChange}
                        />
                        {errors.giro && <div className="error">{errors.giro}</div>}

                        <input
                            type="text"
                            name="tipoActividad"
                            placeholder="Especifique brevemente el tipo de actividad"
                            className="signup-input"
                            value={formData.tipoActividad}
                            onChange={handleChange}
                        />
                        {errors.tipoActividad && <div className="error">{errors.tipoActividad}</div>}

                        <select
                            name="entidadFederativa"
                            className="signup-input"
                            value={formData.entidadFederativa}
                            onChange={handleChange}
                        >
                            <option value="">Entidad Federativa de nacimiento</option>
                            {/* Lista de opciones de entidades federativas */}
                            <option value="Aguascalientes">Aguascalientes</option>
                            <option value="Baja California">Baja California</option>
                            <option value="Baja California Sur">Baja California Sur</option>
                            <option value="Campeche">Campeche</option>
                            <option value="Chiapas">Chiapas</option>
                            <option value="Chihuahua">Chihuahua</option>
                            <option value="Ciudad de México">Ciudad de México</option>
                            <option value="Coahuila">Coahuila</option>
                            <option value="Colima">Colima</option>
                            <option value="Durango">Durango</option>
                            <option value="Estado de México">Estado de México</option>
                            <option value="Guanajuato">Guanajuato</option>
                            <option value="Guerrero">Guerrero</option>
                            <option value="Hidalgo">Hidalgo</option>
                            <option value="Jalisco">Jalisco</option>
                            <option value="Michoacán">Michoacán</option>
                            <option value="Morelos">Morelos</option>
                            <option value="Nayarit">Nayarit</option>
                            <option value="Nuevo León">Nuevo León</option>
                            <option value="Oaxaca">Oaxaca</option>
                            <option value="Puebla">Puebla</option>
                            <option value="Querétaro">Querétaro</option>
                            <option value="Quintana Roo">Quintana Roo</option>
                            <option value="San Luis Potosí">San Luis Potosí</option>
                            <option value="Sinaloa">Sinaloa</option>
                            <option value="Sonora">Sonora</option>
                            <option value="Tabasco">Tabasco</option>
                            <option value="Tamaulipas">Tamaulipas</option>
                            <option value="Tlaxcala">Tlaxcala</option>
                            <option value="Veracruz">Veracruz</option>
                            <option value="Yucatán">Yucatán</option>
                            <option value="Zacatecas">Zacatecas</option>
                        </select>
                        {errors.entidadFederativa && <div className="error">{errors.entidadFederativa}</div>}

                        <input
                            type="text"
                            name="ingresosAnuales"
                            placeholder="Ingresos Anuales"
                            className="signup-input"
                            value={formData.ingresosAnuales}
                            onChange={handleChange}
                        />
                        {errors.ingresosAnuales && <div className="error">{errors.ingresosAnuales}</div>}

                        <input
                            type="text"
                            name="origenPatrimonio"
                            placeholder="Origen del patrimonio"
                            className="signup-input"
                            value={formData.origenPatrimonio}
                            onChange={handleChange}
                        />
                        {errors.origenPatrimonio && <div className="error">{errors.origenPatrimonio}</div>}

                        <select
                            name="habitosToxicos"
                            className="signup-input"
                            value={formData.habitosToxicos}
                            onChange={handleChange}
                        >
                            <option value="">Hábitos Toxicológicos</option>
                            <option value="No">No</option>
                            <option value="Sí">Sí</option>
                        </select>
                        <span
                            className="tooltip-icon"
                            onMouseEnter={handleTooltipToggle}
                            onMouseLeave={handleTooltipToggle}
                        > ℹ
                        </span>
                        {showTooltip && (
                            <div className="tooltip-content">
                                <p>Indique cualquier hábito relacionado con el consumo de sustancias que pueda afectar su salud. Esto incluye:</p>
                                <ul>
                                    <li><strong>Tabaco:</strong> Ej., Cigarrillos - 10 al día</li>
                                    <li><strong>Alcohol:</strong> Ej., Vino - 2-3 copas/semana</li>
                                    <li><strong>Sustancias Recreativas:</strong> Ej., Cannabis - Ocasional</li>
                                    <li><strong>Medicamentos Controlados:</strong> Ej., Benzodiacepinas (si no han sido prescritas)</li>
                                </ul>
                                <p>Proporcione detalles como el tipo, frecuencia y cantidad aproximada.</p>
                            </div>
                        )}
                        {errors.habitosToxicos && <div className="error">{errors.habitosToxicos}</div>}

                        {formData.habitosToxicos === 'Sí' && (
                            <>
                                <input
                                    type="text"
                                    name="especificarHabitos"
                                    placeholder="Especifique el tipo de hábito"
                                    className="signup-input"
                                    value={formData.especificarHabitos}
                                    onChange={handleChange}
                                />
                                {errors.especificarHabitos && <div className="error">{errors.especificarHabitos}</div>}
                            </>
                        )}

                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            className="signup-input"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <div className="error">{errors.password}</div>}

                        {/* Campo de selección de asesor */}
                        <select
                            name="idAsesorSeleccionado"
                            className="signup-input"
                            value={formData.idAsesorSeleccionado}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione un asesor o deje vacío para asignación automática</option>
                            {asesores.map((asesor) => (
                                <option key={asesor.id_asesor} value={asesor.id_asesor}>
                                    {asesor.nombre_completo} - {asesor.clave_agente}
                                </option>
                            ))}
                        </select>

                        <button type="submit" className="signup-button">Registrarse</button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SignUpClient;
