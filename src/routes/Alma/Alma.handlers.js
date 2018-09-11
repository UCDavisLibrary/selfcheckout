/**
 * Handler methods associated with Alma routes.
 */
const fetch = require("node-fetch");
const getAlma = async (req, h) => {
  // converts request to an Alma API request with API key from env

  // requesite info to make api call
  const almaPath = req.params.endpoint;
  const almaQuery = req.query;
  const almaMethod = req.method;
  const almaPayload = req.payload;
  almaQuery["apikey"] = process.env.ALMA_KEY;

  // Build uri.
  let almaURL = process.env.ALMA_API + almaPath;
  function URIEncode(obj) {
      return Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
  }
  almaURL += ("?" + URIEncode(almaQuery));

  // Verify referrer
  let ref = req.info.referrer.split(":");
  if (ref.length >= 2){
      ref = ref[0] + ref[1]
  }
  else {
      ref = ref[0];
  }
  if (ref != process.env.REFERRER){
      return h.response('UC Davis library use only').code(403);
  }

  // query api
  var fetchParams = {
      method: almaMethod.toUpperCase(),

  }
  if (fetchParams.method == 'POST'){
      fetchParams['headers'] = { 'Content-Type': "application/xml" };
      fetchParams['body'] = almaPayload['xmlstr']
      //return fetchParams.body;
  }

  let response = await fetch(almaURL, fetchParams);
  let r = await response.json();
  let status = await response.status
  if (r) {
      return h.response(r).code(status);
  }
  else {
      return h.response({}).code(404);
  }
};

const postAlma = (req, h) => {
  // Make alma api post request

  return {
    id: 2,
    firstName: req.payload.firstName,
    lastName: req.payload.lastName
  };
};

const AlmaHandlers = {
  getAlma
};
export default AlmaHandlers;
