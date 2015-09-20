import Promise from 'bluebird';
import getModels from '../lib/db';

export default function(app) {
  var siteMap = { host: {}, _id: {} };
  var isObjectId = /[a-f0-9]{24}/i

  return function(req, res, next) {

    var value = req.get('X-FlexSite') || req.hostname
      , type = 'host';

    if (isObjectId.test(value)) {
      type = '_id';
    } else {
      value = /^(?:https?:\/\/)?(?:www|local|test)?\.?(.*)$/.exec(value)[1];
    }

    getSite(type, value)
      .then((site) => {
        if (!site) throw new Error('Invalid site identifier!');
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

    return getModels('site')
      .then(Site => Site.findOne(query)
        .then((site = {}) => {
          if (site === null) site = {}
          if (site._id) siteMap.host[site.host] = siteMap._id[site._id] = site;
          return site;
        })
      );
  }
}
