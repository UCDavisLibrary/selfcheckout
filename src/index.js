require('dotenv').config();
//const Bcrypt = require('bcrypt');
import Hapi from 'hapi';
import Logger from './utils/logger';
import Routes from './routes/';

const server = Hapi.server({
  port: process.env.SERVER_PORT,
  host: process.env.SERVER_HOST
});

const server_auth = {
    username: process.env.APP_USER,
    password: process.env.APP_PASSWORD
}
const validate = async (request, username, password) => {

    //const isValid = await Bcrypt.compare(password, server_auth.password);
    const isValid = password === server_auth.password;
    const credentials = { id: server_auth.username, name:  server_auth.username};

    return { isValid, credentials };
};



const init = async () => {
  await server.register(require('inert'));

  await server.register(require('hapi-auth-basic'));
  server.auth.strategy('simple', 'basic', { validate });

  server.route( Routes );

  await server.start();
  console.log( `Server running at: ${ server.info.uri }` );
};

process.on( 'unhandledRejection', ( err ) => {
  console.error( err );
  process.exit( 1 );
});

server.events.on( 'response', Logger.logRequest );

init();
