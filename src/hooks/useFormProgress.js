// useFormProgress.js

import { useState } from 'react';
import { navigateForm } from '../components/FillRequest/FormNavigator';

const useFormProgress = (startNode) => {
  const [currentNode, setCurrentNode] = useState(startNode);

  const proceed = (answer) => {
    const nextNode = navigateForm(currentNode, answer);
    setCurrentNode(nextNode);
  };

  return { currentNode, proceed };
};

export default useFormProgress;
