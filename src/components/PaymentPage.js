// PaymentPage.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PaymentPage.css';
import PayPalButton from './PayPalButton';
import { jsPDF } from 'jspdf'; // Importar jsPDF

const PaymentPage = () => {
  const location = useLocation();
  const { amount, date } = location.state || {}; // Desestructurar los valores pasados desde la redirección
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const id_cliente = 1; // Asegúrate de que este ID es válido y existe en la base de datos

  // Función para generar el PDF en el frontend
  const generarComprobantePDF = (comprobante) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Comprobante de Pago', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Cliente: ${comprobante.nombre_completo}`, 20, 40);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Monto: ${comprobante.monto}`, 20, 60);
    doc.text(`Clave Comprobante: ${comprobante.clave_comprobante}`, 20, 70);
    doc.text(`Entidad Federativa: ${comprobante.entidad_federativa}`, 20, 80);
    doc.text(`Correo: ${comprobante.correo_electronico}`, 20, 90);
    doc.text('\nGracias por su pago.', 20, 100);

    // Descargar el PDF
    doc.save('comprobante_pago.pdf');
  };

  // Función para manejar el éxito del pago y generar el comprobante
  const handlePaymentSuccess = async (details) => {
    try {
      const response = await fetch('/generar-comprobante', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_cliente, // Asegúrate de que este ID sea correcto
          monto: amount, // Asegúrate de que el monto sea un número o un string numérico
        }),
      });

      if (response.ok) {
        const comprobante = await response.json(); // Obtener los detalles del comprobante desde el backend
        setPaymentSuccess(true);
        alert('Pago exitoso y comprobante generado');
        // Generar y descargar el PDF con los detalles del comprobante
        generarComprobantePDF(comprobante);
      } else {
        // Mostrar el error específico desde el servidor
        const errorData = await response.json();
        console.error('Error al generar el comprobante:', errorData.message);
        alert(`Error al generar el comprobante: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error en la solicitud: ' + error.message);
    }
  };

  return (
    <div className="payment-page">
      <h1>Realizar Pago</h1>
      <p>Fecha del pago: {date}</p>
      <p>Monto a pagar: {amount}</p>

      {/* Renderizar el botón de PayPal solo si el SDK está listo */}
      {window.paypal ? (
        <PayPalButton amount={amount} onPaymentSuccess={handlePaymentSuccess} />
      ) : (
        <p>Cargando botón de PayPal...</p>
      )}

      {paymentSuccess && <p>Gracias por su pago. Se ha enviado un comprobante a su correo.</p>}
    </div>
  );
};

export default PaymentPage;
