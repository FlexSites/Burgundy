import Promise from 'bluebird';
import { set } from 'object-path';
import getModels from '../lib/db';

export default function() {
  var siteMap = { host: {}, _id: {} };
  var isObjectId = /[a-f0-9]{24}/i;

  return function(req, res, next) {

    var value = req.get('X-FlexSite') || req.flex.host
      , type = 'host';

    if (isObjectId.test(value)) {
      type = '_id';
    }

    getSite(type, value)
      .then((site) => {
        if (!site) throw new Error('Invalid site identifier!');
        set(req, 'flex.site', site);
      })
      .then(next)
      .catch(next);
  };

  function getSite(type, value) {

    let cachedSite = siteMap[type][value];
    if (cachedSite) return Promise.resolve(cachedSite);

    let query = {};
    query[type] = value;

    return getModels('site')
      .then(Site => Site.findOne(query)
        .then((site = {}) => {
          if (site === null) site = {};
          if (site._id) siteMap.host[site.host] = siteMap._id[site._id] = site.toObject();
          return site;
        })
      );
  }
}
