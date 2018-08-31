/**
 * Handler methods associated with index route.
 */

const getRoot = (req, h) => {
  // Display HTML that loads main polymer app
  return h.file('./src/html/index.html');
  //return 'hello world';
};

const RootHandlers = {
  getRoot
};
export default RootHandlers;
