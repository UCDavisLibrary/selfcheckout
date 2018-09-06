/**
 * Routes concerning a specific domain (ex: Person)
 */

import RootHandlers from './Root.handlers';
//import RootValidators from './Root.validators';

// GET example
const getRoot = {
  method: 'GET',
  path: '/',
  options: {
      auth: 'simple'
  },
  handler: RootHandlers.getRoot
};

const RootRoutes = [
  getRoot
];
export default RootRoutes;
