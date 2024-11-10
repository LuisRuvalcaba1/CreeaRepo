import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

const Toolbar = ({ setTool, setColor, setSize, setAddText, setAddImage, setTextSize }) => {
  const [brushSize, setBrushSize] = useState(5); // Tamaño inicial del pincel
  const [textSize, setLocalTextSize] = useState(16); // Tamaño inicial del texto
  const [showColorPicker, setShowColorPicker] = useState(false); // Estado para mostrar u ocultar el selector de color
  const [selectedColor, setSelectedColor] = useState('#000000'); // Color inicial

  const handleBrushSizeChange = (e) => {
    const newSize = e.target.value;
    setBrushSize(newSize);
    setSize(newSize);
  };

  const handleTextSizeChange = (e) => {
    const newSize = e.target.value;
    setLocalTextSize(newSize);
    setTextSize(newSize);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    setColor(color.hex);
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  return (
    <div className="toolbar">
      <div className="tool-group">
        <select onChange={(e) => setTool(e.target.value)} className="tool-select">
          <option value="normal">Pincel</option>
          <option value="highlighter">Marcatextos</option>
          <option value="eraser">Borrador</option>
        </select>
      </div>

      <div className="color-picker-wrapper">
        <button onClick={toggleColorPicker}>
          {showColorPicker ? "Cerrar Selector de Color" : "Seleccionar Color"}
        </button>
        {showColorPicker && (
          <div className="color-picker">
            <ChromePicker color={selectedColor} onChange={handleColorChange} />
          </div>
        )}
      </div>

      {/* Selector de tamaño del pincel */}
      <div className="brush-size">
        <label htmlFor="brushSize" style={{ display: 'block', marginBottom: '5px' }}>Tamaño del Pincel</label>
        <input
          type="range"
          id="brushSize"
          min="1"
          max="50"
          value={brushSize}
          onChange={handleBrushSizeChange}
          title="Ajusta el tamaño del pincel"
        />
      </div>

      {/* Selector de tamaño del texto */}
      <div className="text-size">
        <label htmlFor="textSize" style={{ display: 'block', marginBottom: '5px' }}>Tamaño del Texto</label>
        <input
          type="range"
          id="textSize"
          min="10"
          max="100"
          value={textSize}
          onChange={handleTextSizeChange}
          title="Ajusta el tamaño del texto"
        />
      </div>

      <div className="add-text">
        <button onClick={() => setAddText(true)}>Agregar Cuadro de Texto</button>
      </div>

      <div className="add-image">
        <button onClick={() => document.getElementById('imageUpload').click()}>
          Agregar Imágenes
        </button>
        <input
          type="file"
          id="imageUpload"
          style={{ display: 'none' }}
          accept="image/*"
          multiple
          onChange={(e) => setAddImage([...e.target.files])}
        />
      </div>
    </div>
  );
};

export default Toolbar;
