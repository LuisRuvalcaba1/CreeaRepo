import React, { useState } from 'react';
import './FinancialProjectionForm.css';

const FinancialProjectionForm = () => {
    const [formData, setFormData] = useState({
        nombreProducto: '',
        sumaAsegurada: '',
        primaBasica: '',
        recuperacionFinal: '',
        rentaMensual: '',
        pagoFinalOpcion: '',
        moneda: '',
        tipoCambioActual: '',
        devaluacionProyectada: '',
        tasaInteresFondo: '',
        plazoPagoSeguro: '',
        plazoAsegurado: '',
        nombreAsesor: '',
        nombreCliente: '',
        edadCliente: '',
        edadRetiro: '',
        periodoGarantia: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombreProducto) newErrors.nombreProducto = "Seleccione un producto.";
        if (!formData.sumaAsegurada || isNaN(formData.sumaAsegurada)) newErrors.sumaAsegurada = "Ingrese una suma asegurada válida.";
        if (!formData.primaBasica || isNaN(formData.primaBasica)) newErrors.primaBasica = "Ingrese una prima básica válida.";
        if (!formData.recuperacionFinal || isNaN(formData.recuperacionFinal)) newErrors.recuperacionFinal = "Ingrese un valor de recuperación final válido.";
        if (!formData.rentaMensual || isNaN(formData.rentaMensual)) newErrors.rentaMensual = "Ingrese una renta mensual válida.";
        if (!formData.tipoCambioActual || isNaN(formData.tipoCambioActual)) newErrors.tipoCambioActual = "Ingrese un tipo de cambio válido.";
        if (!formData.devaluacionProyectada || isNaN(formData.devaluacionProyectada)) newErrors.devaluacionProyectada = "Ingrese una devaluación proyectada válida.";
        if (!formData.tasaInteresFondo || isNaN(formData.tasaInteresFondo)) newErrors.tasaInteresFondo = "Ingrese una tasa de interés válida.";
        if (!formData.plazoPagoSeguro || isNaN(formData.plazoPagoSeguro)) newErrors.plazoPagoSeguro = "Ingrese un plazo de pago válido.";
        if (!formData.plazoAsegurado || isNaN(formData.plazoAsegurado)) newErrors.plazoAsegurado = "Ingrese un plazo de aseguramiento válido.";
        if (!formData.nombreAsesor || /\d/.test(formData.nombreAsesor)) newErrors.nombreAsesor = "Ingrese un nombre de asesor válido sin números.";
        if (!formData.nombreCliente || /\d/.test(formData.nombreCliente)) newErrors.nombreCliente = "Ingrese un nombre de cliente válido sin números.";
        if (!formData.edadCliente || isNaN(formData.edadCliente)) newErrors.edadCliente = "Ingrese una edad válida.";
        if (!formData.edadRetiro || isNaN(formData.edadRetiro)) newErrors.edadRetiro = "Ingrese una edad de retiro válida.";
        if (!formData.periodoGarantia || isNaN(formData.periodoGarantia)) newErrors.periodoGarantia = "Ingrese un período de garantía válido.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        
        if (validateForm()) {
            try {
                const response = await fetch('/api/generate-projection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Proyeccion_Rendimientos_${formData.nombreCliente}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setSuccessMessage('Proyección generada y descargada exitosamente.');
                } else {
                    setErrors({ submit: 'Error al generar la proyección. Inténtelo de nuevo.' });
                }
            } catch (error) {
                setErrors({ submit: 'Error de conexión con el servidor.' });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Nombre del Producto</label>
            <select name="nombreProducto" value={formData.nombreProducto} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="Imagina Ser">Imagina Ser</option>
                <option value="Star Dotal">Star Dotal</option>
                <option value="Orvi">Orvi</option>
                <option value="Vida Mujer">Vida Mujer</option>
                <option value="SeguBeca">SeguBeca</option>
            </select>
            {errors.nombreProducto && <span>{errors.nombreProducto}</span>}

            <label>Suma Asegurada</label>
            <input type="text" name="sumaAsegurada" value={formData.sumaAsegurada} onChange={handleChange} />
            {errors.sumaAsegurada && <span>{errors.sumaAsegurada}</span>}

            {/* Continúa añadiendo todos los demás campos de manera similar con sus respectivas validaciones */}
            <button type="submit">Generar Proyección</button>
            {errors.submit && <span>{errors.submit}</span>}
            {successMessage && <span>{successMessage}</span>}
        </form>
    );
};

export default FinancialProjectionForm;
