import Promise from 'bluebird';

export default function(app) {
  var Site = app.get('models').site;
  var siteMap = { host: {}, id: {} };

  return function(req, res, next) {

    var siteId = req.get('X-FlexSite')
      , type = siteId ? 'id' : 'host'
      , value = siteId || /^(?:https?:\/\/)?(?:www|local|test)?\.?(.*)$/.exec(req.hostname)[1];

    if (!value) {
      return next();
    }

    getSite(type, value)
      .then((site) => {
        req.flex = { site };
      })
      .then(next)
      .catch(next);
  };

  function getSite(type, value) {

    let site = siteMap[type][value];
    if (site) return Promise.resolve(site);

    let query = {};
    query[type] = value;

    return Site
      .findOne(query)
      .then((site = {}) => {
        if (site.id) siteMap.host[site.host] = siteMap.id[site.id] = site;
        return site;
      });
  }
}
