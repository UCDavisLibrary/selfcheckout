require('dotenv').config();
import Hapi from 'hapi';

import Logger from './utils/logger';
import Routes from './routes';

const server = Hapi.server({
  port: process.env.SERVER_PORT,
  host: process.env.SERVER_HOST
});

server.route( Routes );

const init = async () => {
  await server.register(require('inert'));

  await server.start();
  console.log( `Server running at: ${ server.info.uri }` );
};

process.on( 'unhandledRejection', ( err ) => {
  console.error( err );
  process.exit( 1 );
});

server.events.on( 'response', Logger.logRequest );

init();
