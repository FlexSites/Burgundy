import routeData from '../lib/render/data';
import render from '../lib/render';
import NodeCache from 'node-cache';
import etag from 'etag';
import debug from 'debug';
import config from 'config';

let cache = new NodeCache();
let log = debug('flexsites:cache');
let isProd = config.get('isProd');

export default function(app) {

  app.set('etag', 'strong');

  return function(req, res, next) {
    let key = createKey(req.flex.host, req.originalUrl);
    let expected = cache.get(key);
    let actual = req.get('If-None-Match');

    let cacheMiss = !expected || expected !== actual;

    let response = routeData(req)
      .then(data => render(req.flex.host, data))
      .then(data => {
        let hash = etag(data);
        if (isProd) cache.set(key, hash);
        log('Setting etag %s for %s', hash, key);
        if (cacheMiss) res.set('ETag', hash);
        return data;
      })
      .catch(next);

    res.set('Cache-Control', 'public, max-age=0, must-revalidate');

    if (cacheMiss) {
      log('Missed the cache wanted %s actual %s for key %s', cache.get(key), req.get('If-None-Match'), key);
      return response.then(res.send.bind(res));
    }

    res.sendStatus(304);
  };
}

export function clearKey(host, uri) {
  cache.del(createKey(host, uri));
}

function createKey(host, uri) {
  return `${host}|${uri}`;
}
