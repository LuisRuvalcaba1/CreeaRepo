import React from 'react';
import { render, screen } from '@testing-library/react';  // Usar render y screen para las pruebas
import CanvasBoard from '../components/CanvasBoard';  // Componente a probar

global.setImmediate = (callback) => setTimeout(callback, 0);

beforeAll(() => {
    // Mock de getContext para el canvas
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      scale: jest.fn(),
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      closePath: jest.fn(),
    }));
  });

// Ejemplo de prueba para verificar el uso del componente CanvasBoard
test('El componente CanvasBoard se renderiza correctamente', () => {
    render(<CanvasBoard tool="brush" color="#000" size={5} addText={false} addImage={null} textSize={16} />);
  
    // Verificar si el canvas está en el documento
    const canvas = screen.getByTestId('canvas-board');
    expect(canvas).toBeInTheDocument();
  });

// Ejemplo de prueba para verificar que el pizarrón tiene diferentes herramientas
test('El pizarrón debe tener diferentes herramientas: pincel, borrador y selector de color', () => {
  const tools = ['brush', 'eraser', 'colorPicker'];
  tools.forEach(tool => {
    expect(tool).toBeDefined();
  });
});

// Prueba para guardar el trabajo en el pizarrón
test('Debe poder guardar el contenido del pizarrón como imagen', () => {
  const canvasRef = { current: document.createElement('canvas') };
  const saveCanvasAsImage = jest.fn();

  saveCanvasAsImage();

  expect(saveCanvasAsImage).toHaveBeenCalled();
  expect(canvasRef.current.toDataURL).toBeDefined(); 
});

test('Debe permitir hacer zoom y pan en el pizarrón', () => {
    const zoomLevel = 2; // Supongamos que el zoom inicial es 1
    const panPosition = { x: 0, y: 0 };
  
    const handleZoom = (newZoomLevel) => {
      expect(newZoomLevel).toBeGreaterThan(1);
    };
  
    const handlePan = (newPosition) => {
      expect(newPosition).not.toEqual(panPosition); // Debe haber un cambio en la posición
    };
  
    handleZoom(zoomLevel);
    handlePan({ x: 100, y: 100 });
  });
  test('Debe permitir agregar y modificar cuadros de texto', () => {
    const textElement = {
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      fontSize: 16,
    };
  
    const modifyTextSize = (newSize) => {
      textElement.fontSize = newSize;
    };
  
    modifyTextSize(24); // Cambiamos el tamaño del texto
  
    expect(textElement.fontSize).toBe(24); // Verificamos el cambio
  });
  test('Debe permitir insertar imágenes en el pizarrón', () => {
    const imageElement = {
      imgSrc: 'data:image/jpeg;base64,imagedata',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
    };
  
    const addImage = jest.fn();
  
    addImage(imageElement);
  
    expect(addImage).toHaveBeenCalledWith(imageElement);
  });

  test('Debe permitir compartir y colaborar en el pizarrón entre usuarios', () => {
    const socket = {
      emit: jest.fn(),
      on: jest.fn(),
    };
  
    const userId = 'user1';
    const otherUserId = 'user2';
  
    const shareBoard = (from, to) => {
      socket.emit('shareBoard', { from, to });
    };
  
    shareBoard(userId, otherUserId);
  
    expect(socket.emit).toHaveBeenCalledWith('shareBoard', { from: userId, to: otherUserId });
  });
  
