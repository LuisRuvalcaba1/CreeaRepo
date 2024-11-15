// utils/formGraph.js

const graph = {
  0: { question: "Fecha de Solicitud", type: "date", next: 1 },
  1: {
    question: "Tipo de Trámite",
    options: ["Inicial", "Rehabilitación"],
    next: (answer) => (answer === "Rehabilitación" ? "1A" : 2),
  },
  "1A": { question: "¿Es una póliza anterior?", options: ["Sí", "No"], next: "1B" },
  "1B": {
    question: "Incremento de Suma Asegurada",
    options: ["Sí", "No"],
    next: 2,
  },
  2: {
    question: "Nombre del Plan solicitado",
    options: ["Imagina Ser", "Star Dotal", "Orvi", "Vida Mujer", "SeguBeca"],
    next: 3,
  },
  3: { question: "Suma Asegurada/Renta", type: "number", next: 4 },
  4: {
    question: "¿Es deducible?",
    options: ["Sí", "No"],
    next: (answer) => (answer === "Sí" ? 38 : 5),
  },
  5: { question: "Moneda del Plan", options: ["DLS", "UDIS"], next: 6 },
  6: { question: "¿Es preferente?", options: ["Sí", "No"], next: 7 },
  7: { question: "Nombre(s) o Razón Social", type: "text", next: 8 },
  8: { question: "Apellido Paterno", type: "text", next: 9 },
  9: { question: "Apellido Materno", type: "text", next: 10 },
  10: { question: "Fecha de Nacimiento", type: "date", next: 11 },
  11: { question: "Nacionalidad", type: "text", next: 167 },
  12: { question: "Ocupación", type: "text", next: 13 },
  13: { question: "País de Nacimiento", type: "text", next: 14 },
  14: { question: "Sexo", options: ["Mujer", "Hombre"], next: 15 },
  15: { question: "Estado Civil", options: ["Soltero", "Casado"], next: 16 },
  16: { question: "Domicilio", type: "text", next: 17 },
  17: { question: "Código Postal", type: "text", next: 18 },
  18: { question: "Colonia o Fraccionamiento", type: "text", next: 19 },
  19: { question: "Alcaldía o Municipio", type: "text", next: 20 },
  20: { question: "Ciudad", type: "text", next: 21 },
  21: { question: "Estado", type: "text", next: 168 },
  22: { question: "Correo Electrónico", type: "email", next: 23 },
  23: { question: "Teléfono Particular", type: "text", next: 24 },
  24: { question: "Teléfono Oficina", type: "text", next: 25 },
  25: { question: "Teléfono Celular", type: "text", next: 26 },
  26: { question: "Giro, actividad u objeto social", type: "text", next: 27 },
  27: {
    question: "Especifique brevemente el tipo de actividad que realiza",
    type: "text",
    next: 28,
  },
  28: { question: "Entidad federativa de nacimiento", type: "text", next: 29 },
  29: { question: "Ingresos Anuales", type: "number", next: 30 },
  30: { question: "Origen del patrimonio", type: "text", next: 31 },
  31: { question: "RFC", type: "text", next: 32 },
  32: { question: "CURP", type: "text", next: 33 },
  33: {
    question:
      "Número de serie del certificado digital de la Firma Electrónica avanzada (solo si cuenta con ella)",
    type: "text",
    next: 34,
  },
  34: { question: "Folio Mercantil", type: "text", next: 35 },
  35: {
    question: "Nombre del representante legal (si aplica)",
    type: "text",
    next: 36,
  },
  36: { question: "Nacionalidad del representante legal", type: "text", next: 37 },
  37: { question: "Fecha de nacimiento del representante legal", type: "date", next: 38 },
  38: {
    question: "Domicilio en el extranjero (en caso de contar con él)",
    type: "text",
    next: 39,
  },
  39: {
    question:
      "Datos fiscales (obligatorio al solicitar producto deducible o requerir factura): Régimen fiscal",
    type: "text",
    next: 166,
  },
  40: { question: "Código Postal del domicilio fiscal", type: "text", next: 41 },
  41: {
    question: "Información de Cobranza: Conducto de pago",
    options: ["Cargo Automático", "Modo Directo", "Agente"],
    next: 42,
  },
  42: {
    question: "Forma de pago",
    options: ["Mensual", "Trimestral", "Semestral", "Anual"],
    next: 43,
  },
  43: {
    question: "Token de Tarjeta o CLABE",
    type: "text",
    next: 44,
  },
  44: {
    question: "Banco",
    type: "text",
    next: 45,
  },
  45: {
    question: "Tipo de tarjeta",
    options: ["Crédito", "Débito"],
    next: 46,
  },
  46: {
    question: "Campaña",
    type: "text",
    next: 47,
  },
  47: {
    question: "¿Nombre(s) o razón social del titular de la cuenta?",
    type: "text",
    next: 48,
  },
  48: {
    question: "Fin del apartado de datos del solicitante.",
    type: "end",
    next: 49,
  },

  49: {
    question: "Nombre del Titular de la Cuenta",
    type: "text",
    next: 50,
  },
  50: {
    question: "Firma del Titular",
    type: "signature",
    next: 51,
  },
  51: {
    question: "Número de Serie del Certificado Digital",
    type: "text",
    next: 52,
  },
  52: {
    question: "Folio Mercantil",
    type: "text",
    next: 53,
  },
  53: {
    question: "Nombre del Proveedor de Recursos",
    type: "text",
    next: 54,
  },
  54: {
    question: "Razón Social del Proveedor",
    type: "text",
    next: 55,
  },
  55: {
    question: "RFC del Proveedor",
    type: "text",
    next: 56,
  },
  56: {
    question: "Dirección del Proveedor",
    type: "text",
    next: 57,
  },
  57: {
    question: "Teléfono del Proveedor",
    type: "number",
    next: 58,
  },
  58: {
    question: "Correo Electrónico del Proveedor",
    type: "email",
    next: 59,
  },
  59: {
    question: "Número de Identificación del Proveedor",
    type: "text",
    next: 60,
  },
  60: {
    question: "Tipo de Identificación del Proveedor",
    options: ["Pasaporte", "INE", "Licencia de Conducir"],
    next: 61,
  },
  61: {
    question: "Ingresos Anuales del Proveedor",
    type: "number",
    next: 62,
  },
  62: {
    question: "Información Adicional del Proveedor",
    type: "text",
    next: 63,
  },
  63: {
    question: "Datos Bancarios del Proveedor",
    type: "text",
    next: 64,
  },
  64: {
    question: "Número de Cuenta del Proveedor",
    type: "text",
    next: 65,
  },
  65: {
    question: "Clave Bancaria Estandarizada (CLABE) del Proveedor",
    type: "text",
    next: 66,
  },
  66: {
    question: "Banco del Proveedor",
    type: "text",
    next: 67,
  },
  67: {
    question: "Final del apartado de Proveedor de Recursos",
    type: "end",
    next: 68,
  },

  68: {
    question: "¿Actúa en nombre de un tercero?",
    options: ["Sí", "No"],
    next: (answer) => (answer === "Sí" ? 69 : 70),
  },
  69: {
    question: "Nombre completo del tercero",
    type: "text",
    next: 70,
  },
  70: {
    question: "Final del apartado de Personas Políticamente Expuestas",
    type: "end",
    next: 71,
  },

  71: {
    question: "¿Desea agregar coberturas adicionales?",
    options: ["Sí", "No"],
    next: (answer) => (answer === "Sí" ? 72 : 135),
  },
  72: {
    question: "Cobertura BIT",
    options: ["60", "65", "No Aplica"],
    next: 73,
  },
  73: {
    question: "Cobertura BAIT",
    options: ["60", "65", "No Aplica"],
    next: 74,
  },
  74: {
    question: "Cobertura PU",
    options: ["Sí", "No"],
    next: 75,
  },
  75: {
    question: "Cobertura BITAE",
    options: ["Sí", "No"],
    next: 76,
  },
  76: {
    question: "Cobertura BMA",
    options: ["Sí", "No"],
    next: 77,
  },
  77: {
    question: "Cobertura DI",
    options: ["Sí", "No"],
    next: 78,
  },
  78: {
    question: "Final del apartado de Coberturas",
    type: "end",
    next: 135,
  },

  135: {
    question: "Nombre de la Persona por Asegurar",
    type: "text",
    next: 136,
  },
  136: {
    question: "Fecha de Nacimiento de la Persona por Asegurar",
    type: "date",
    next: 137,
  },
  137: {
    question: "Sexo de la Persona por Asegurar",
    options: ["Mujer", "Hombre"],
    next: 138,
  },
  138: {
    question: "Estado Civil de la Persona por Asegurar",
    options: ["Soltero", "Casado"],
    next: 139,
  },
  139: {
    question: "Nacionalidad de la Persona por Asegurar",
    type: "text",
    next: 140,
  },
  140: {
    question: "Ocupación de la Persona por Asegurar",
    type: "text",
    next: 141,
  },
  141: {
    question: "¿Desea la cobertura PU?",
    options: ["Sí", "No"],
    next: (answer) => (answer === "Sí" ? 142 : 143),
  },
  142: {
    question: "Cobertura PU seleccionada. Continuar con el siguiente nodo.",
    type: "info",
    next: 143,
  },
  143: {
    question: "¿Desea la cobertura BITAE?",
    options: ["Sí", "No"],
    next: (answer) => (answer === "Sí" ? 144 : 145),
  },
  144: {
    question: "Cobertura BITAE seleccionada. Continuar con el siguiente nodo.",
    type: "info",
    next: 145,
  },
  145: {
    question: "¿Desea la cobertura BMA?",
    options: ["Sí", "No"],
    next: (answer) => (answer === "Sí" ? 146 : 147),
  },
  146: {
    question: "Cobertura BMA seleccionada. Continuar con el siguiente nodo.",
    type: "info",
    next: 147,
  }, 
      147: {
        question: "¿Desea la cobertura DI?",
        options: ["Sí", "No"],
        next: (answer) => (answer === "Sí" ? 148 : 149),
      },
      148: {
        question: "Cobertura DI seleccionada. Continuar con el siguiente nodo.",
        type: "info",
        next: 149,
      },
      149: {
        question: "Final de la sección de Coberturas. Continuar con el siguiente apartado.",
        type: "info",
        next: 157,
      },
    
      // Apartado para Propietarios Reales y PPE
    
      157: {
        question: "¿Actúa en nombre de un tercero distinto al contratante?",
        options: ["Sí", "No"],
        next: 158,
      },
    
      // Sección de Coberturas Alternativas
    
      158: {
        question: "¿Desea la cobertura BIT?",
        options: ["Sí", "No"],
        next: (answer) => (answer === "Sí" ? 159 : 160),
      },
      159: {
        question: "Seleccione el monto para BIT",
        options: ["60", "65"],
        next: 160,
      },
      160: {
        question: "¿Desea la cobertura BAIT?",
        options: ["Sí", "No"],
        next: (answer) => (answer === "Sí" ? 161 : 162),
      },
      161: {
        question: "Seleccione el monto para BAIT",
        options: ["60", "65"],
        next: 162,
      },
      162: {
        question: "¿Desea la cobertura PU?",
        options: ["Sí", "No"],
        next: 163,
      },
      163: {
        question: "¿Desea la cobertura BITAE?",
        options: ["Sí", "No"],
        next: 164,
      },
      164: {
        question: "¿Desea la cobertura BMA?",
        options: ["Sí", "No"],
        next: 165,
      },
      165: {
        question: "¿Desea la cobertura DI?",
        options: ["Sí", "No"],
        next: (answer) => (answer === "Sí" ? 399 : 170),
      },
    
      166: {
        question: "Constancia de Situación Fiscal en PDF",
        type: "file",
        documentUpload: "constancia de situación fiscal",
        validation: "validateFile",
        next: 40,
      },
      167: {
        question: "Documento de Identificación en PDF",
        type: "file",
        documentUpload: "documento de identificación",
        validation: "validateFile",
        next: 12,
      },
      168: {
        question: "Comprobante de Domicilio",
        type: "file",
        documentUpload: "comprobante de domicilio",
        validation: "validateFile",
        next: 22,
      },
    
      // Cuestionario Médico desde el Nodo 399 en adelante
    
      399: {
        question: "¿Padece alguna enfermedad del corazón y la circulación?",
        options: ["Sí", "No"],
        next: 400,
      },
      400: {
        question: "¿Padece alguna enfermedad del aparato respiratorio?",
        options: ["Sí", "No"],
        next: 401,
      },
      401: {
        question: "¿Padece alguna enfermedad del aparato digestivo?",
        options: ["Sí", "No"],
        next: 402,
      },
      402: {
        question: "¿Padece alguna enfermedad del aparato genitourinario?",
        options: ["Sí", "No"],
        next: 403,
      },
      403: {
        question: "¿Padece alguna enfermedad del sistema endocrino?",
        options: ["Sí", "No"],
        next: 404,
      },
      404: {
        question: "¿Padece alguna enfermedad del sistema nervioso?",
        options: ["Sí", "No"],
        next: 405,
      },
      405: {
        question: "¿Padece alguna enfermedad del aparato músculo esquelético?",
        options: ["Sí", "No"],
        next: 406,
      },
      406: {
        question: "¿Ha tenido cáncer o tumores?",
        options: ["Sí", "No"],
        next: 407,
      },
      407: {
        question: "¿Ha tenido alguna enfermedad que haya durado más de 8 días?",
        options: ["Sí", "No"],
        next: 408,
      },
      408: {
        question: "¿Padece enfermedades congénitas?",
        options: ["Sí", "No"],
        next: 409,
      },
      409: {
        question: "¿Tiene algún defecto visual o auditivo?",
        options: ["Sí", "No"],
        next: 410,
      },
      410: {
        question: "¿Ha estado hospitalizado alguna vez?",
        options: ["Sí", "No"],
        next: 411,
      },
      411: {
        question: "¿Está actualmente en tratamiento?",
        options: ["Sí", "No"],
        next: 412,
      },
      412: {
        question: "¿Le han diagnosticado SIDA/VIH?",
        options: ["Sí", "No"],
        next: 413,
      },
      413: {
        question: "¿Le han practicado alguna intervención quirúrgica?",
        options: ["Sí", "No"],
        next: 414,
      },
      414: {
        question: "¿Tiene alguna intervención quirúrgica pendiente?",
        options: ["Sí", "No"],
        next: 415,
      },
      415: {
        question: "¿Le falta algún miembro o tiene alguna deformidad?",
        options: ["Sí", "No"],
        next: 416,
      },
      416: {
        question: "¿Ha realizado alguna vez electrocardiogramas?",
        options: ["Sí", "No"],
        next: 417,
      },
      417: {
        question: "¿Consume alcohol?",
        options: ["Sí", "No"],
        next: 418,
      },
      418: {
        question: "¿Consume drogas?",
        options: ["Sí", "No"],
        next: 419,
      },
      419: {
        question: "Si abandonó algún hábito, indique la fecha y detalles",
        type: "text",
        next: 420,
      },
      420: {
        question: "¿Padece enfermedades hereditarias?",
        options: ["Sí", "No"],
        next: "end",
      },   
      end: { question: "Formulario completo.", type: "end" },
    };

  const getNextNode = (currentNodeId, answer) => {
    const node = graph[currentNodeId];
    if (!node) return "end";
    return typeof node.next === "function" ? node.next(answer) : node.next;
  };
  
  export { graph, getNextNode };