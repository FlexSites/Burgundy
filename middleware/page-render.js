import routeData from '../lib/render/data';
import render from '../lib/render';
import NodeCache from 'node-cache';
import etag from 'etag';
import debug from 'debug';

let cache = new NodeCache();
let log = debug('flexsites:cache');

export default function() {
  return function(req, res, next) {
    let key = createKey(req.flex.host, req.originalUrl);
    let expected = cache.get(key);
    let actual = req.get('If-None-Match');

    let cacheMiss = !expected || expected !== actual;

    let response = routeData(req)
      .then(data => render(req.flex.host, data))
      .then(data => {
        let hash = etag(data);
        cache.set(key, hash);
        log('Setting etag %s for %s', hash, key);
        if (cacheMiss) res.set('ETag', hash);
        return data;
      })
      .catch(next);

    if (cacheMiss) {
      log('Missed the cache wanted %s actual %s for key %s', cache.get(key), req.get('If-None-Match'), key);
      return response.then(res.send.bind(res));
    }

    res.set('ETag', expected);
    res.send();
  };
}

export function clearKey(host, uri) {
  cache.del(createKey(host, uri));
}

function createKey(host, uri) {
  return `${host}|${uri}`;
}
