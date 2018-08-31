/*
    Serves everything under src/assets to /assets
*/
const AssetHandler = (req, h) => {
  let p = './src/assets/' + encodeURIComponent(req.params.assetpath);
  return h.file(p);
};
const WCHandler = (req, h) => {
  let p = './src/assets/bundles/' + encodeURIComponent(req.params.assetpath);
  return h.file(p);
};

const getAssets = {
  method: 'GET',
  path: '/assets/{assetpath*}',
  handler: AssetHandler
};
const getWC = {
  method: 'GET',
  path: '/assets/bundles/{assetpath*}',
  handler: WCHandler
};

const AssetsRoutes = [
  getAssets, getWC
];
export default AssetsRoutes;
