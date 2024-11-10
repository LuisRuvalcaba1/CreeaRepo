
import React, { useState } from 'react';
import { getNextNode, NODES } from '../../utils/constants';
import FormQuestion from './FormQuestion';
import './FormNavigator.css';

const FormNavigator = ({ startNode, onComplete }) => {
  const [currentNodeId, setCurrentNodeId] = useState(startNode);
  const [currentNode, setCurrentNode] = useState(NODES[startNode]);

  const handleAnswer = (answer) => {
    const nextNodeId = getNextNode(currentNodeId, answer);
    if (nextNodeId === 'end') {
      onComplete();
    } else {
      setCurrentNodeId(nextNodeId);
      setCurrentNode(NODES[nextNodeId]);
    }
  };

  return (
    <div>
      <FormQuestion
        question={currentNode.question}
        options={currentNode.options}
        type={currentNode.type}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default FormNavigator;
