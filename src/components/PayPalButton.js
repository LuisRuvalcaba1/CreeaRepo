import React, { useEffect, useRef } from 'react';

const PayPalButton = ({ amount, onPaymentSuccess }) => {
  const paypalRef = useRef(null);
  const buttonRendered = useRef(false); // Ref para evitar el renderizado duplicado

  useEffect(() => {
    if (paypalRef.current && window.paypal && !buttonRendered.current) {
      window.paypal.Buttons({
        createOrder: function (data, actions) {
          // Llamar al backend para crear la orden de pago
          return fetch('/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }), // Asegúrate de enviar solo el número
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Error al crear la orden de PayPal');
              }
              return response.json();
            })
            .then((order) => {
              if (!order.id) {
                throw new Error('No se recibió un orderID válido de PayPal');
              }
              return order.id; // Devolver el orderID al PayPal SDK
            })
            .catch((err) => {
              console.error('Error al crear la orden de PayPal:', err);
              throw new Error('No se pudo crear la orden de PayPal');
            });
        },
        onApprove: function (data, actions) {
          // Capturar el pago después de que el usuario aprueba la transacción
          return actions.order.capture().then(function (details) {
            alert('Pago completado con éxito por ' + details.payer.name.given_name);
            onPaymentSuccess(details); // Llamar a la función de éxito del pago
          });
        },
        onError: function (err) {
          console.error('Error al procesar el pago con PayPal:', err);
        },
      }).render(paypalRef.current);

      buttonRendered.current = true; // Evitar renderizado duplicado
    }
  }, [amount, onPaymentSuccess]);

  return <div ref={paypalRef}></div>;
};

export default PayPalButton;
