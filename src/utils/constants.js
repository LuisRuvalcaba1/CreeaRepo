// constants.js

const NODES = {
    0: {
      question: "Fecha de Solicitud",
      type: "date",
      nextNode: 1,
    },
    1: {
      question: "Tipo de Trámite",
      options: ["Inicial", "Rehabilitación"],
      nextNode: (answer) => (answer === "Rehabilitación" ? "1A" : 2),
    },
    "1A": {
      question: "¿Es una póliza anterior?",
      options: ["Sí", "No"],
      nextNode: "1B",
    },
    "1B": {
      question: "Incremento de Suma Asegurada",
      options: ["Sí", "No"],
      nextNode: 2,
    },
    2: {
      question: "Nombre del Plan solicitado",
      options: ["Imagina Ser", "Star Dotal", "Orvi", "Vida Mujer", "SeguBeca"],
      nextNode: 3,
    },
    3: {
      question: "Suma Asegurada/Renta",
      type: "number",
      nextNode: 4,
    },
    4: {
      question: "¿Es deducible?",
      options: ["Sí", "No"],
      nextNode: (answer) => (answer === "Sí" ? 38 : 5),
    },
    5: {
      question: "Moneda del Plan",
      options: ["DLS", "UDIS"],
      nextNode: 6,
    },
    6: {
      question: "¿Es preferente?",
      options: ["Sí", "No"],
      nextNode: 7,
    },
    7: {
      question: "Nombre(s) o Razón Social",
      type: "text",
      nextNode: 8,
    },
    8: {
      question: "Apellido Paterno",
      type: "text",
      nextNode: 9,
    },
    9: {
      question: "Apellido Materno",
      type: "text",
      nextNode: 10,
    },
    10: {
      question: "Fecha de Nacimiento",
      type: "date",
      nextNode: 11,
    },
    11: {
      question: "Nacionalidad",
      type: "text",
      nextNode: 167,
    },
    12: {
      question: "Ocupación",
      type: "text",
      nextNode: 13,
    },
    13: {
      question: "País de Nacimiento",
      type: "text",
      nextNode: 14,
    },
    14: {
      question: "Sexo",
      options: ["Mujer", "Hombre"],
      nextNode: 15,
    },
    15: {
      question: "Estado Civil",
      options: ["Soltero", "Casado"],
      nextNode: 16,
    },
    16: {
      question: "Domicilio",
      type: "text",
      nextNode: 17,
    },
    17: {
      question: "Código Postal",
      type: "text",
      nextNode: 18,
    },
    18: {
      question: "Colonia o Fraccionamiento",
      type: "text",
      nextNode: 19,
    },
    19: {
      question: "Alcaldía o Municipio",
      type: "text",
      nextNode: 20,
    },
    20: {
      question: "Ciudad",
      type: "text",
      nextNode: 21,
    },
    21: {
      question: "Estado",
      type: "text",
      nextNode: 168,
    },
    22: {
      question: "Correo Electrónico",
      type: "email",
      nextNode: 23,
    },
    23: {
      question: "Teléfono Particular",
      type: "text",
      nextNode: 24,
    },
    24: {
      question: "Teléfono Oficina",
      type: "text",
      nextNode: 25,
    },
    25: {
      question: "Teléfono Celular",
      type: "text",
      nextNode: 26,
    },
    26: {
      question: "Giro, actividad u objeto social",
      type: "text",
      nextNode: 27,
    },
    27: {
      question: "Especifique brevemente el tipo de actividad que realiza",
      type: "text",
      nextNode: 28,
    },
    28: {
      question: "Entidad federativa de nacimiento",
      type: "text",
      nextNode: 29,
    },
    29: {
      question: "Ingresos Anuales",
      type: "number",
      nextNode: 30,
    },
    30: {
      question: "Origen del patrimonio",
      type: "text",
      nextNode: 31,
    },
    31: {
      question: "RFC",
      type: "text",
      nextNode: 32,
    },
    32: {
      question: "CURP",
      type: "text",
      nextNode: 33,
    },
    33: {
      question: "Número de serie del certificado digital de la Firma Electrónica avanzada (solo si cuenta con ella)",
      type: "text",
      nextNode: 34,
    },
    34: {
      question: "Folio Mercantil",
      type: "text",
      nextNode: 35,
    },
    35: {
      question: "Nombre del representante legal (si aplica)",
      type: "text",
      nextNode: 36,
    },
    36: {
      question: "Nacionalidad del representante legal",
      type: "text",
      nextNode: 37,
    },
    37: {
      question: "Fecha de nacimiento del representante legal",
      type: "date",
      nextNode: 38,
    },
    38: {
      question: "Domicilio en el extranjero (en caso de contar con él)",
      type: "text",
      nextNode: 39,
    },
    39: {
      question: "Datos fiscales (obligatorio al solicitar producto deducible o requerir factura): Régimen fiscal",
      type: "text",
      nextNode: 166,
    },
    40: {
      question: "Código Postal del domicilio fiscal",
      type: "text",
      nextNode: 41,
    },
    41: {
      question: "Información de Cobranza: Conducto de pago",
      options: ["Cargo Automático", "Modo Directo", "Agente"],
      nextNode: 42,
    },
    42: {
      question: "Forma de pago",
      options: ["Mensual", "Trimestral", "Semestral", "Anual"],
      nextNode: 43,
    },
    43: {
      question: "Token de Tarjeta o CLABE",
      type: "text",
      nextNode: 44,
    },
    44: {
      question: "Banco",
      type: "text",
      nextNode: 45,
    },
    45: {
      question: "Tipo de tarjeta",
      options: ["Crédito", "Débito"],
      nextNode: 46,
    },
    46: {
      question: "Campaña",
      type: "text",
      nextNode: 47,
    },
    47: {
      question: "¿Nombre(s) o razón social del titular de la cuenta?",
      type: "text",
      nextNode: 48,
    },
    48: {
      question: "Fin del apartado de datos del solicitante.",
      type: "end",
      nextNode: 49,
    },
  
    49: {
      question: "Nombre del Titular de la Cuenta",
      type: "text",
      nextNode: 50,
    },
    50: {
      question: "Firma del Titular",
      type: "signature",
      nextNode: 51,
    },
    51: {
      question: "Número de Serie del Certificado Digital",
      type: "text",
      nextNode: 52,
    },
    52: {
      question: "Folio Mercantil",
      type: "text",
      nextNode: 53,
    },
    53: {
      question: "Nombre del Proveedor de Recursos",
      type: "text",
      nextNode: 54,
    },
    54: {
      question: "Razón Social del Proveedor",
      type: "text",
      nextNode: 55,
    },
    55: {
      question: "RFC del Proveedor",
      type: "text",
      nextNode: 56,
    },
    56: {
      question: "Dirección del Proveedor",
      type: "text",
      nextNode: 57,
    },
    57: {
      question: "Teléfono del Proveedor",
      type: "number",
      nextNode: 58,
    },
    58: {
      question: "Correo Electrónico del Proveedor",
      type: "email",
      nextNode: 59,
    },
    59: {
      question: "Número de Identificación del Proveedor",
      type: "text",
      nextNode: 60,
    },
    60: {
        question: "Tipo de Identificación del Proveedor",
        options: ["Pasaporte", "INE", "Licencia de Conducir"],
        nextNode: 61,
      },
      61: {
        question: "Ingresos Anuales del Proveedor",
        type: "number",
        nextNode: 62,
      },
      62: {
        question: "Información Adicional del Proveedor",
        type: "text",
        nextNode: 63,
      },
      63: {
        question: "Datos Bancarios del Proveedor",
        type: "text",
        nextNode: 64,
      },
      64: {
        question: "Número de Cuenta del Proveedor",
        type: "text",
        nextNode: 65,
      },
      65: {
        question: "Clave Bancaria Estandarizada (CLABE) del Proveedor",
        type: "text",
        nextNode: 66,
      },
      66: {
        question: "Banco del Proveedor",
        type: "text",
        nextNode: 67,
      },
      67: {
        question: "Final del apartado de Proveedor de Recursos",
        type: "end",
        nextNode: 68,
      },
    
      68: {
        question: "¿Actúa en nombre de un tercero?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 69 : 70),
      },
      69: {
        question: "Nombre completo del tercero",
        type: "text",
        nextNode: 70,
      },
      70: {
        question: "Final del apartado de Personas Políticamente Expuestas",
        type: "end",
        nextNode: 71,
      },
   
      71: {
        question: "¿Desea agregar coberturas adicionales?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 72 : 135),
      },
      72: {
        question: "Cobertura BIT",
        options: ["60", "65", "No Aplica"],
        nextNode: 73,
      },
      73: {
        question: "Cobertura BAIT",
        options: ["60", "65", "No Aplica"],
        nextNode: 74,
      },
      74: {
        question: "Cobertura PU",
        options: ["Sí", "No"],
        nextNode: 75,
      },
      75: {
        question: "Cobertura BITAE",
        options: ["Sí", "No"],
        nextNode: 76,
      },
      76: {
        question: "Cobertura BMA",
        options: ["Sí", "No"],
        nextNode: 77,
      },
      77: {
        question: "Cobertura DI",
        options: ["Sí", "No"],
        nextNode: 78,
      },
      78: {
        question: "Final del apartado de Coberturas",
        type: "end",
        nextNode: 135,
      },
    
      // Datos adicionales (finales del formulario)
      135: {
        question: "Nombre de la Persona por Asegurar",
        type: "text",
        nextNode: 136,
      },
      136: {
        question: "Fecha de Nacimiento de la Persona por Asegurar",
        type: "date",
        nextNode: 137,
      },
      137: {
        question: "Sexo de la Persona por Asegurar",
        options: ["Mujer", "Hombre"],
        nextNode: 138,
      },
      138: {
        question: "Estado Civil de la Persona por Asegurar",
        options: ["Soltero", "Casado"],
        nextNode: 139,
      },
      139: {
        question: "Nacionalidad de la Persona por Asegurar",
        type: "text",
        nextNode: 140,
      },
      140: {
        question: "Ocupación de la Persona por Asegurar",
        type: "text",
        nextNode: 141,
      },
      141: {
        question: "¿Desea la cobertura PU?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 142 : 143),
      },
      142: {
        question: "Cobertura PU seleccionada. Continuar con el siguiente nodo.",
        type: "info",
        nextNode: 143,
      },
      143: {
        question: "¿Desea la cobertura BITAE?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 144 : 145),
      },
      144: {
        question: "Cobertura BITAE seleccionada. Continuar con el siguiente nodo.",
        type: "info",
        nextNode: 145,
      },
      145: {
        question: "¿Desea la cobertura BMA?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 146 : 147),
      },
      146: {
        question: "Cobertura BMA seleccionada. Continuar con el siguiente nodo.",
        type: "info",
        nextNode: 147,
      },
      147: {
        question: "¿Desea la cobertura DI?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 148 : 149),
      },
      148: {
        question: "Cobertura DI seleccionada. Continuar con el siguiente nodo.",
        type: "info",
        nextNode: 149,
      },
      149: {
        question: "Final de la sección de Coberturas. Continuar con el siguiente apartado.",
        type: "info",
        nextNode: 157,
      },
    
      // Apartado para Propietarios Reales y PPE
    
      157: {
        question: "¿Actúa en nombre de un tercero distinto al contratante?",
        options: ["Sí", "No"],
        nextNode: 158,
      },
    
      // Sección de Coberturas Alternativas
    
      158: {
        question: "¿Desea la cobertura BIT?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 159 : 160),
      },
      159: {
        question: "Seleccione el monto para BIT",
        options: ["60", "65"],
        nextNode: 160,
      },
      160: {
        question: "¿Desea la cobertura BAIT?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 161 : 162),
      },
      161: {
        question: "Seleccione el monto para BAIT",
        options: ["60", "65"],
        nextNode: 162,
      },
      162: {
        question: "¿Desea la cobertura PU?",
        options: ["Sí", "No"],
        nextNode: 163,
      },
      163: {
        question: "¿Desea la cobertura BITAE?",
        options: ["Sí", "No"],
        nextNode: 164,
      },
      164: {
        question: "¿Desea la cobertura BMA?",
        options: ["Sí", "No"],
        nextNode: 165,
      },
      165: {
        question: "¿Desea la cobertura DI?",
        options: ["Sí", "No"],
        nextNode: (answer) => (answer === "Sí" ? 399 : 170),
      },

      166: {
        question: "Constancia de Situación Fiscal en PDF",
        type: "file",
        documentUpload: "constancia de situación fiscal",
        validation: "validateFile",
        nextNode: 40,
      },
      167: {
        question: "Documento de Identificación en PDF",
        type: "file",
        documentUpload: "documento de identificación",
        validation: "validateFile",
        nextNode: 12,
      },
      168: {
        question: "Comprobante de Domicilio",
        type: "file",
        documentUpload: "comprobante de domicilio",
        validation: "validateFile",
        nextNode: 22,
      },
    
      // Cuestionario Médico desde el Nodo 399 en adelante
    
      399: {
        question: "¿Padece alguna enfermedad del corazón y la circulación?",
        options: ["Sí", "No"],
        nextNode: 400,
      },
      400: {
        question: "¿Padece alguna enfermedad del aparato respiratorio?",
        options: ["Sí", "No"],
        nextNode: 401,
      },
      401: {
        question: "¿Padece alguna enfermedad del aparato digestivo?",
        options: ["Sí", "No"],
        nextNode: 402,
      },
      402: {
        question: "¿Padece alguna enfermedad del aparato genitourinario?",
        options: ["Sí", "No"],
        nextNode: 403,
      },
      403: {
        question: "¿Padece alguna enfermedad del sistema endocrino?",
        options: ["Sí", "No"],
        nextNode: 404,
      },
      404: {
        question: "¿Padece alguna enfermedad del sistema nervioso?",
        options: ["Sí", "No"],
        nextNode: 405,
      },
      405: {
        question: "¿Padece alguna enfermedad del aparato músculo esquelético?",
        options: ["Sí", "No"],
        nextNode: 406,
      },
      406: {
        question: "¿Ha tenido cáncer o tumores?",
        options: ["Sí", "No"],
        nextNode: 407,
      },
      407: {
        question: "¿Ha tenido alguna enfermedad que haya durado más de 8 días?",
        options: ["Sí", "No"],
        nextNode: 408,
      },
      408: {
        question: "¿Padece enfermedades congénitas?",
        options: ["Sí", "No"],
        nextNode: 409,
      },
      409: {
        question: "¿Tiene algún defecto visual o auditivo?",
        options: ["Sí", "No"],
        nextNode: 410,
      },
      410: {
        question: "¿Ha estado hospitalizado alguna vez?",
        options: ["Sí", "No"],
        nextNode: 411,
      },
      411: {
        question: "¿Está actualmente en tratamiento?",
        options: ["Sí", "No"],
        nextNode: 412,
      },
      412: {
        question: "¿Le han diagnosticado SIDA/VIH?",
        options: ["Sí", "No"],
        nextNode: 413,
      },
      413: {
        question: "¿Le han practicado alguna intervención quirúrgica?",
        options: ["Sí", "No"],
        nextNode: 414,
      },
      414: {
        question: "¿Tiene alguna intervención quirúrgica pendiente?",
        options: ["Sí", "No"],
        nextNode: 415,
      },
      415: {
        question: "¿Le falta algún miembro o tiene alguna deformidad?",
        options: ["Sí", "No"],
        nextNode: 416,
      },
      416: {
        question: "¿Ha realizado alguna vez electrocardiogramas?",
        options: ["Sí", "No"],
        nextNode: 417,
      },
      417: {
        question: "¿Consume alcohol?",
        options: ["Sí", "No"],
        nextNode: 418,
      },
      418: {
        question: "¿Consume drogas?",
        options: ["Sí", "No"],
        nextNode: 419,
      },
      419: {
        question: "Si abandonó algún hábito, indique la fecha y detalles",
        type: "text",
        nextNode: 420,
      },
      420: {
        question: "¿Padece enfermedades hereditarias?",
        options: ["Sí", "No"],
        nextNode: "end",
      },
    
      // Agrega el nodo "end" para finalizar el flujo
      end: {
        question: "Formulario completo.",
        type: "end",
      },
    };
    
    const getNextNode = (currentNodeId, answer) => {
      const node = NODES[currentNodeId];
      return typeof node.nextNode === "function" ? node.nextNode(answer) : node.nextNode;
    };
    
    export {NODES, getNextNode };
  