/**
 * Routes concerning a specific domain (ex: Alma)
 */

import AlmaHandlers from './Alma.handlers';

const getAlma = {
  method: ['GET', 'POST'],
  path: '/alma/{endpoint*}',
  handler: AlmaHandlers.getAlma
};


const postAlma = {
  method: 'POST',
  path: '/alma/{endpoint*}',
  handler: AlmaHandlers.postAlma,
};

const AlmaRoutes = [
  getAlma
];
export default AlmaRoutes;
