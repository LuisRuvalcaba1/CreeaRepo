import React, { useRef, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { Rnd } from 'react-rnd';
import { FaTrash } from 'react-icons/fa';

const socket = io('http://localhost:5000');

const CanvasBoard = ({ tool, color, size, addText, addImage, textSize, canvasRef }) => {
  const contextRef = useRef(null);
  const textElements = useRef([]);
  const imageElements = useRef([]);
  const currentDrawings = useRef([]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [selectedElementType, setSelectedElementType] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const userType = sessionStorage.getItem('userType');
  const userId = sessionStorage.getItem('userId');

  // Draw lines and shapes received from server
  const drawFromServer = useCallback((data) => {
    const { x0, y0, x1, y1, color, size } = data;
    const context = contextRef.current;
    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
  }, []);

  useEffect(() => {
    if (userId) {
      socket.emit('registerUser', { userId });
      socket.emit('requestBoardSync');
    }

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8 * 2;
    canvas.height = window.innerHeight * 0.75 * 2;
    canvas.style.width = `${window.innerWidth * 0.8}px`;
    canvas.style.height = `${window.innerHeight * 0.75}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    contextRef.current = context;

    socket.on('drawing', (data) => drawFromServer(data));
    socket.on('addText', (newTextElement) => textElements.current.push(newTextElement));
    socket.on('addImage', (newImageElement) => imageElements.current.push(newImageElement));

    socket.on('receiveShareRequest', ({ from }) => {
      alert(`El usuario ${from} ha compartido su pizarrón contigo.`);
    });

    return () => {
      socket.off('drawing');
      socket.off('addText');
      socket.off('addImage');
      socket.off('receiveShareRequest');
    };
  }, [userId, drawFromServer, canvasRef]);

  const handleDragStop = (e, d, index) => {
    if (selectedElementType === 'text') {
      textElements.current[index] = { ...textElements.current[index], x: d.x, y: d.y };
    } else if (selectedElementType === 'image') {
      imageElements.current[index] = { ...imageElements.current[index], x: d.x, y: d.y };
    }
  };

  const getMousePos = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width * 2);
    const scaleY = canvas.height / (rect.height * 2);
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = ({ nativeEvent }) => {
    const { x, y } = getMousePos(nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.lineWidth = size;
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(nativeEvent);
    contextRef.current.strokeStyle = tool === 'eraser' ? 'white' : color || 'black';
    contextRef.current.lineWidth = size;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    socket.emit('drawing', {
      x0: x,
      y0: y,
      color: contextRef.current.strokeStyle,
      size,
    });

    currentDrawings.current.push({ x0: x, y0: y, x1: x, y1: y, color, size });
  };

  useEffect(() => {
    if (addText && selectedElementIndex === null) {
      const newTextElement = {
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        value: 'Texto aquí',
        fontSize: textSize,
      };
      textElements.current.push(newTextElement);
      socket.emit('addText', newTextElement);
    } else if (selectedElementIndex !== null) {
      textElements.current[selectedElementIndex].fontSize = textSize;
    }
  }, [addText, textSize, selectedElementIndex]);

  useEffect(() => {
    if (addImage && addImage.length > 0) {
      setLoadingImage(true);
      addImage.forEach((imageFile) => {
        const img = new Image();
        img.src = URL.createObjectURL(imageFile);
        img.onload = () => {
          const canvasWidth = canvasRef.current.width / 2;
          const imageWidth = canvasWidth * 0.25;
          const aspectRatio = img.width / img.height;
          const newImageElement = {
            x: 100,
            y: 100,
            width: imageWidth,
            height: imageWidth / aspectRatio,
            imgSrc: img.src,
          };
          imageElements.current.push(newImageElement);
          socket.emit('addImage', newImageElement);
          setLoadingImage(false);
        };
      });
    }
  }, [addImage, canvasRef]);

  const handleDeleteSelectedElement = () => {
    if (selectedElementType === 'text') {
      textElements.current.splice(selectedElementIndex, 1);
    } else if (selectedElementType === 'image') {
      imageElements.current.splice(selectedElementIndex, 1);
    }
    setSelectedElementIndex(null);
    setSelectedElementType(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          cursor: 'crosshair',
          marginTop: '20px',
          marginBottom: '20px',
          display: 'block',
          backgroundColor: '#ffffff',
          border: '2px solid #337BC2',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={finishDrawing}
      />

      {textElements.current.map((textElement, index) => (
        <Rnd
          key={index}
          default={{
            x: textElement.x,
            y: textElement.y,
            width: textElement.width,
            height: textElement.height,
          }}
          bounds="parent"
          onDragStop={(e, d) => handleDragStop(e, d, index)}
          onClick={() => {
            setSelectedElementIndex(index);
            setSelectedElementType('text');
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            textElements.current[index] = {
              ...textElements.current[index],
              width: ref.style.width,
              height: ref.style.height,
              ...position,
            };
          }}
        >
          <textarea
            style={{
              width: '100%',
              height: '100%',
              resize: 'none',
              fontSize: `${textElement.fontSize}px`,
              color: 'black',
              backgroundColor: 'transparent',
              border: selectedElementIndex === index ? '2px solid blue' : '1px dashed gray',
              padding: '10px',
              boxSizing: 'border-box',
            }}
            value={textElement.value}
            onChange={(e) => {
              textElements.current[index].value = e.target.value;
            }}
          />
        </Rnd>
      ))}

      {imageElements.current.map((imageElement, index) => (
        <Rnd
          key={index}
          default={{
            x: imageElement.x,
            y: imageElement.y,
            width: imageElement.width,
            height: imageElement.height,
          }}
          bounds="parent"
          onDragStop={(e, d) => handleDragStop(e, d, index)}
          onClick={() => {
            setSelectedElementIndex(index);
            setSelectedElementType('image');
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            imageElements.current[index] = {
              ...imageElements.current[index],
              width: ref.style.width,
              height: ref.style.height,
              ...position,
            };
          }}
        >
          <img
            src={imageElement.imgSrc}
            alt="canvas-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Rnd>
      ))}

      <button
        onClick={handleDeleteSelectedElement}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#ff6666',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
        }}
        title="Eliminar Elemento Seleccionado"
      >
        <FaTrash size={40} color="black" />
      </button>
    </div>
  );
};

export default CanvasBoard;
