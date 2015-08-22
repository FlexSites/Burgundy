'use strict';

import config from 'config';
import express from 'express';
import path from 'path';
import httpProxy from 'http-proxy';

export default function() {

  let isFile = /\.[a-z0-9]{2,4}$/
    , prefixMatch = /^(?:https?:\/\/)?(?:www|local|test)?\.?(.*)$/
    , middleware = staticMiddleware();


  return (req, res, next) => {
    if (!isFile.test(req.url)) return next();
    req.url = `/${removePrefix(req.hostname)}/public${req.url}`;
    middleware(req, res, next);
  };

  function staticMiddleware() {

    let { bucket, region } = config.get('aws.s3');

    // If there's no bucket, stop short and serve local files
    if (!bucket) return express.static(path.join(__root, '../sites'));

    let proxy = httpProxy.createProxyServer({
      changeOrigin: true,
      target: `http://${bucket}.s3-website-${region}.amazonaws.com`
    });

    return (req, res, next) => {
      proxy.web(req, res, {});
      proxy.on('error', next);
    };
  }

  function removePrefix(url) {
    return prefixMatch.exec(url)[1];
  }
}

