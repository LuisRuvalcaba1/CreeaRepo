// utils/formGraph.js

const graph = {
    0: { question: 'Fecha de Solicitud', next: 1 },
    1: { question: '¿El contratante es mayor de edad?', options: { yes: 10, no: 'end' } },
    // ... (continúa definiendo los nodos aquí)
  };
  
  exports.getNextNode = (currentNode, answer) => {
    return graph[currentNode].options[answer] || graph[currentNode].next;
  };
  