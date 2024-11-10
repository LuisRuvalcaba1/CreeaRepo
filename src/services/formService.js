// formService.js

import axios from 'axios';

export const saveTemporaryData = async (data) => {
  return await axios.post('/api/fill-request/save', data);
};

export const completeRequest = async (data) => {
  return await axios.post('/api/fill-request/complete', data);
};
