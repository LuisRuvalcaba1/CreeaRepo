const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();

router.post('/generate-projection', (req, res) => {
    const {
        nombreProducto, sumaAsegurada, primaBasica, recuperacionFinal,
        rentaMensual, pagoFinalOpcion, moneda, tipoCambioActual,
        devaluacionProyectada, tasaInteresFondo, plazoPagoSeguro,
        plazoAsegurado, nombreAsesor, nombreCliente, edadCliente,
        edadRetiro, periodoGarantia
    } = req.body;

    // Cálculos
    const aportacionAnualPrimerAnio = primaBasica * tipoCambioActual;
    const tipoCambioProyectado = (anio) => tipoCambioActual + (devaluacionProyectada * anio);
    const aportacionTotalMoneda = primaBasica * plazoPagoSeguro;
    const aportacionTotalPesos = Array.from({ length: plazoPagoSeguro }, (_, i) => primaBasica * tipoCambioProyectado(i)).reduce((acc, curr) => acc + curr, 0);
    const utilidadPlan = recuperacionFinal - aportacionTotalPesos;
    const ingresoAnualPrimeros5 = rentaMensual * 13;
    const ingresoAnualSiguientes = rentaMensual * 12;

    // Crear y configurar el PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename=proyeccion_rendimientos.pdf');
    
    doc.fontSize(20).text('Proyección de Rendimientos Financieros', { align: 'center' });
    doc.fontSize(12).text(`Asesor: ${nombreAsesor}`);
    doc.text(`Cliente: ${nombreCliente}`);
    doc.text(`Producto: ${nombreProducto}`);
    doc.text(`Suma Asegurada: ${sumaAsegurada}`);
    doc.text(`Prima Básica Anual: ${primaBasica}`);
    doc.text(`Recuperación al Final: ${recuperacionFinal}`);
    doc.text(`Renta Mensual: ${rentaMensual}`);
    doc.text(`Opción de Pago: ${pagoFinalOpcion}`);
    doc.text(`Moneda: ${moneda}`);
    doc.text(`Tipo de Cambio Actual: ${tipoCambioActual}`);
    doc.text(`Devaluación Proyectada: ${devaluacionProyectada}%`);
    doc.text(`Tasa de Interés del Fondo: ${tasaInteresFondo}%`);
    doc.text(`Plazo Pago Seguro: ${plazoPagoSeguro} años`);
    doc.text(`Plazo Asegurado: ${plazoAsegurado} años`);
    doc.text(`Edad del Cliente: ${edadCliente}`);
    doc.text(`Edad de Retiro: ${edadRetiro}`);
    doc.text(`Periodo de Garantía: ${periodoGarantia}`);

    doc.moveDown();
    doc.fontSize(14).text('Resultados Financieros:', { underline: true });
    doc.fontSize(12).text(`Aportación Anual en Pesos (Primer Año): ${aportacionAnualPrimerAnio.toFixed(2)}`);
    doc.text(`Aportación Total en Moneda Seleccionada: ${aportacionTotalMoneda.toFixed(2)}`);
    doc.text(`Aportación Total en Pesos: ${aportacionTotalPesos.toFixed(2)}`);
    doc.text(`Utilidad del Plan: ${utilidadPlan.toFixed(2)}`);
    doc.text(`Ingreso Anual Vitalicio (Primeros 5 Años): ${ingresoAnualPrimeros5.toFixed(2)}`);
    doc.text(`Ingreso Anual Vitalicio (Años Siguientes): ${ingresoAnualSiguientes.toFixed(2)}`);

    doc.end();
    doc.pipe(res);
});

module.exports = router;
