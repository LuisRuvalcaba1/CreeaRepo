import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import CanvasBoard from '../components/CanvasBoard';
import Toolbar from '../components/Toolbar';
import './BoardPage.css';

const socket = io('http://localhost:5000');

const ClientSelectionModal = ({ clients, onSelect, onClose }) => (
  <div className="modal">
    <div className="modal-content">
      <h3>Selecciona un cliente</h3>
      <select onChange={(e) => onSelect(e.target.value)}>
        <option value="">Selecciona un cliente</option>
        {clients.map((client) => (
          <option key={client.id_cliente} value={client.id_cliente}>
            {client.nombre_completo}
          </option>
        ))}
      </select>
      <button onClick={onClose}>Cerrar</button>
    </div>
  </div>
);

const BoardPage = () => {
  const [tool, setTool] = useState('normal');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [textSize, setTextSize] = useState(16);
  const [addText, setAddText] = useState(false);
  const [addImage, setAddImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  const userType = sessionStorage.getItem('userType');
  const userId = sessionStorage.getItem('userId');

  const canvasRef = useRef(null);
  const textElements = useRef([]);
  const imageElements = useRef([]);
  const currentDrawings = useRef([]);

  useEffect(() => {
    if (!userType || !userId) {
      sessionStorage.setItem('userType', 'cliente');
      sessionStorage.setItem('userId', '1');
      sessionStorage.setItem('advisorId', '2');
    }

    if (userType === 'asesor') {
      fetch(`http://localhost:5000/api/get-clients?advisorId=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          setClients(Array.isArray(data) ? data : []);
        })
        .catch((error) => console.error('Error al obtener clientes:', error));
    }
  }, [userType, userId]);

  const handleShareBoard = () => {
    if (userType === 'asesor') {
      setShowModal(true);
    } else {
      const advisorId = sessionStorage.getItem('advisorId');
      if (advisorId) {
        socket.emit('shareBoard', { from: userId, to: advisorId });
        alert('Pizarrón compartido con tu asesor.');
      } else {
        alert('No tienes un asesor asignado.');
      }
    }
  };

  const saveCanvasAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("El canvas no está disponible");
      return;
    }

    setLoading(true);
    const context = canvas.getContext('2d');

    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    currentDrawings.current.forEach(({ x0, y0, x1, y1, color, size }) => {
      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
      context.closePath();
    });

    textElements.current.forEach((textElement) => {
      context.font = `${textElement.fontSize}px Arial`;
      context.fillStyle = 'black';
      context.fillText(textElement.value, textElement.x, textElement.y);
    });

    const loadImages = imageElements.current.map((imageElement) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageElement.imgSrc;
        img.onload = () => {
          context.drawImage(
            img,
            imageElement.x,
            imageElement.y,
            imageElement.width,
            imageElement.height
          );
          resolve();
        };
      });
    });

    Promise.all(loadImages).then(() => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.download = 'pizarra.jpg';
      link.click();
      context.globalCompositeOperation = 'source-over';
      setLoading(false);
    });
  };

  return (
    <div className="board-page">
      <Toolbar
        setTool={setTool}
        setColor={setColor}
        setSize={setSize}
        setAddText={setAddText}
        setAddImage={setAddImage}
        setTextSize={setTextSize}
        color={color}
      />
      <CanvasBoard
        tool={tool}
        color={color}
        size={size}
        addText={addText}
        addImage={addImage}
        textSize={textSize}
        canvasRef={canvasRef}
        textElements={textElements}
        imageElements={imageElements}
        currentDrawings={currentDrawings}
      />

      {(loading || loadingImage) && (
        <div className="loading-overlay">
          <p>{loading ? 'Guardando imagen... Por favor, espera.' : 'Cargando imagen... Por favor, espera.'}</p>
        </div>
      )}

      {showModal && (
        <ClientSelectionModal
          clients={clients}
          onSelect={(clientId) => {
            if (clientId) {
              setShowModal(false);
              socket.emit('shareBoard', { from: userId, to: clientId });
              alert('Pizarrón compartido con el cliente seleccionado.');
            } else {
              alert('Por favor, selecciona un cliente.');
            }
          }}
          onClose={() => setShowModal(false)}
        />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={handleShareBoard}
          style={{
            padding: '10px 20px',
            backgroundColor: '#337BC2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Compartir en Tiempo Real
        </button>

        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#29CFC5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onClick={saveCanvasAsImage}
        >
          Guardar como JPG
        </button>
      </div>
    </div>
  );
};

export default BoardPage;
