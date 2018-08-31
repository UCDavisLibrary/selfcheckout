const logRequest = ( request ) => {
  const raw = {
    remoteAddress: request.info.remoteAddress,
    method: request.method.toUpperCase(),
    path: request.url.path,
    status: request.response.statusCode,
    headers: request.headers,
    params: request.params,
    payload: request.payload,
    response: request.response.source
  };

  const spacePadding = Array( raw.remoteAddress.length + 1 ).join(' ');

  const log = [
    `${ raw.remoteAddress }: ${ raw.method } ${ raw.path } --> ${ raw.status }`,
    `${ spacePadding }  Headers:  ${ JSON.stringify( raw.headers ) }`,
    `${ spacePadding }  Params:   ${ JSON.stringify( raw.params ) }`,
    `${ spacePadding }  Payload:  ${ JSON.stringify( raw.payload ) }`,
    `${ spacePadding }  Response: ${ JSON.stringify( raw.response ) }`
  ].join('\n');

  console.log( log );
};

export default {
  logRequest
};
