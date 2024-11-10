import React, { useState } from 'react';
import Header from './Header'; 
import Footer from './Footer'; 
import { Pie } from 'react-chartjs-2'; // Asegúrate de tener esta librería instalada
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'; // Registra los elementos
import './RiskCalculator.css';

Chart.register(ArcElement, Tooltip, Legend);

const RiskCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    profession: '',
    habits: {
      smoker: false,
      smokingFrequency: 'ocasional',
      drinker: false,
      drinkingFrequency: 'ocasional',
      sedentary: false,
      highRiskHobbies: false,
    },
  });

  const [initialRisk, setInitialRisk] = useState(null);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [comparisons, setComparisons] = useState([]); // Nueva lista de comparaciones
  const [activeSection, setActiveSection] = useState('interactive');
  const [summary, setSummary] = useState('');

  // Cambiar datos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Cambiar hábitos
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      habits: { ...formData.habits, [name]: checked },
    });
  };

  // Cálculo de riesgo
  const calculateRisk = () => {
    let deathRisk = 0;
    let disabilityRisk = 0;
    let diseaseRisk = 0; // Añadir cálculo de enfermedades

    // Cálculo basado en hábitos y profesión
    if (formData.habits.smoker) {
      if (formData.habits.smokingFrequency === 'diario') {
        deathRisk += 30;
      } else {
        deathRisk += 10;
      }
      diseaseRisk += 15; // Riesgo de enfermedades por fumar
    }
    if (formData.habits.drinker) {
      if (formData.habits.drinkingFrequency === 'diario') {
        deathRisk += 15;
      } else {
        deathRisk += 5;
      }
      diseaseRisk += 10; // Riesgo por consumo de alcohol
    }
    if (formData.habits.sedentary) {
      deathRisk += 15;
      diseaseRisk += 20; // Riesgo por vida sedentaria
    }
    if (formData.habits.highRiskHobbies) disabilityRisk += 10;

    switch (formData.profession) {
      case 'construction':
        disabilityRisk += 30;
        deathRisk += 10;
        break;
      case 'medical':
        disabilityRisk += 20;
        deathRisk += 5;
        break;
      case 'office':
        deathRisk += 5;
        break;
      case 'mining':
        disabilityRisk += 40;
        deathRisk += 20;
        break;
      case 'aviation':
        deathRisk += 25;
        disabilityRisk += 15;
        break;
      default:
        break;
    }

    const riskResult = {
      deathRisk,
      disabilityRisk,
      diseaseRisk, // Añadir al resultado final
    };

    if (!initialRisk) {
      setInitialRisk(riskResult); // Establecer el primer riesgo calculado como inicial
    } else {
      setComparisons([...comparisons, riskResult]); // Guardar nuevos riesgos en la lista de comparaciones
    }

    setCurrentRisk(riskResult);

    // Resumen de los datos ingresados
    setSummary(`Edad: ${formData.age}, Profesión: ${formData.profession}, Fumador: ${formData.habits.smoker ? `Sí, Frecuencia: ${formData.habits.smokingFrequency}` : 'No'}, Bebedor: ${formData.habits.drinker ? `Sí, Frecuencia: ${formData.habits.drinkingFrequency}` : 'No'}, Estilo de vida sedentario: ${formData.habits.sedentary ? 'Sí' : 'No'}, Pasatiempos de alto riesgo: ${formData.habits.highRiskHobbies ? 'Sí' : 'No'}`);
    
    setActiveSection('evaluation');
  };

  // Reiniciar el formulario para un nuevo cálculo
  const resetForm = () => {
    setFormData({
      age: '',
      profession: '',
      habits: {
        smoker: false,
        smokingFrequency: 'ocasional',
        drinker: false,
        drinkingFrequency: 'ocasional',
        sedentary: false,
        highRiskHobbies: false,
      },
    });
    setCurrentRisk(null);
    setActiveSection('interactive');
  };

  return (
    <div className="app-container">
      <Header />

      <div className="main-content">
        <div className="risk-calculator-container glassmorphism">
          <h2>Calculadora de Riesgo</h2>

          <div className="risk-nav">
            {initialRisk && (
              <>
                <button onClick={() => setActiveSection('evaluation')}>Evaluación Integral</button>
                <button onClick={() => setActiveSection('education')}>Educación sobre Riesgos</button>
                <button onClick={() => setActiveSection('reference')}>Información de Referencia</button>
                <button onClick={() => setActiveSection('comparison')}>Comparar Escenarios</button>
              </>
            )}
          </div>

          {/* Sección de Formato Interactivo */}
          {activeSection === 'interactive' && (
            <div>
              <h3>Formato Interactivo</h3>
              <p>Ingresa tus datos para obtener resultados personalizados sobre tu nivel de riesgo.</p>
              <form className="risk-form">
                <label>
                  Edad:
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Ingresa tu edad"
                  />
                </label>
                <label>
                  Profesión:
                  <select
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona tu profesión</option>
                    <option value="construction">Trabajador de la construcción</option>
                    <option value="medical">Personal médico</option>
                    <option value="office">Oficinista</option>
                    <option value="mining">Trabajador de minería</option>
                    <option value="aviation">Piloto de aviación</option>
                  </select>
                </label>
                <div className="habit-icons">
                  <label>
                    Fumador:
                    <input
                      type="checkbox"
                      name="smoker"
                      checked={formData.habits.smoker}
                      onChange={handleCheckboxChange}
                    />
                  </label>
                  <label>
                    Bebedor:
                    <input
                      type="checkbox"
                      name="drinker"
                      checked={formData.habits.drinker}
                      onChange={handleCheckboxChange}
                    />
                  </label>
                  <label>
                    Estilo de vida sedentario:
                    <input
                      type="checkbox"
                      name="sedentary"
                      checked={formData.habits.sedentary}
                      onChange={handleCheckboxChange}
                    />
                  </label>
                  <label>
                    Pasatiempos de alto riesgo:
                    <input
                      type="checkbox"
                      name="highRiskHobbies"
                      checked={formData.habits.highRiskHobbies}
                      onChange={handleCheckboxChange}
                    />
                  </label>
                </div>
                <button type="button" onClick={calculateRisk} className="calculate-button">
                  Calcular
                </button>
                {initialRisk && (
                  <button type="button" onClick={resetForm} className="reset-button">
                    Ingresar nuevos datos
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Sección de Evaluación Integral */}
          {activeSection === 'evaluation' && currentRisk && (
            <div>
              <h3>Evaluación Integral</h3>
              <Pie
                data={{
                  labels: ['Riesgo de muerte', 'Riesgo de invalidez', 'Riesgo de enfermedades'],
                  datasets: [
                    {
                      label: 'Nivel de riesgo',
                      data: [currentRisk.deathRisk, currentRisk.disabilityRisk, currentRisk.diseaseRisk],
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    },
                  ],
                }}
              />
              <p>Riesgo de muerte: {currentRisk.deathRisk}%</p>
              <p>Riesgo de invalidez total: {currentRisk.disabilityRisk}%</p>
              <p>Riesgo de enfermedades: {currentRisk.diseaseRisk}%</p>
              
              {initialRisk && (
                <button type="button" onClick={resetForm} className="reset-button">
                  Ingresar nuevos datos
                </button>
              )}
            </div>
          )}          


          {/* Comparación de Escenarios */}
          {activeSection === 'comparison' && comparisons.length > 0 && (
            <div className="comparison-container">
              <h3>Comparación de Escenarios</h3>
              <p>Resumen de los datos ingresados:</p>
              <pre>{summary}</pre>

              <h4>Riesgo Inicial</h4>
              <Pie
                data={{
                  labels: ['Riesgo de muerte', 'Riesgo de invalidez', 'Riesgo de enfermedades'],
                  datasets: [
                    {
                      label: 'Nivel de riesgo inicial',
                      data: [initialRisk.deathRisk, initialRisk.disabilityRisk, initialRisk.diseaseRisk],
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    },
                  ],
                }}
              />

              {comparisons.map((comparison, index) => (
                <div key={index}>
                  <h4>Escenario de Comparación {index + 1}</h4>
                  <Pie
                    data={{
                      labels: ['Riesgo de muerte', 'Riesgo de invalidez', 'Riesgo de enfermedades'],
                      datasets: [
                        {
                          label: `Nivel de riesgo en comparación ${index + 1}`,
                          data: [comparison.deathRisk, comparison.disabilityRisk, comparison.diseaseRisk],
                          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                        },
                      ],
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RiskCalculator;
