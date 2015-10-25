
import config from 'config';
import express from 'express';
import path from 'path';
import httpProxy from 'http-proxy';

const REGEX_IS_REV = /-[a-f0-9]{10}\.[a-z0-9]{2,}$/;
const FILE_EXTENSIONS = [

  // Image
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',

  // Web
  'js',
  'css',
  'html',
  'json',
  'xml',

  // Fonts
  'woff',
  'otf',
  'eot',
  'svg',
  'ttf',

  // Video
  'mp4',
  'ogg',
  'mov',
  'webm',

  // Audio
  'mp3',
  'wav',

  // Other
  'csv',
  'zip',
]

export default function(ignores = []) {

  let middleware = staticMiddleware();

  return (req, res, next) => {
    if (!isFile(req.url) || ~ignores.indexOf(req.path)) return next();
    req.url = `/${req.flex.host}/public${req.url}`;
    let maxAge = 0;
    if (isRevisioned(req.url)) maxAge = 31556926;
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    middleware(req, res, next);
  };

  function staticMiddleware() {

    let { bucket, region } = config.get('aws.s3');

    // If there's no bucket, stop short and serve local files
    if (!bucket) return express.static(path.join(global.__root, '../sites'));

    let proxy = httpProxy.createProxyServer({
      changeOrigin: true,
      target: `http://${bucket}.s3-website-${region}.amazonaws.com`,
    });

    return (req, res, next) => {
      proxy.web(req, res, {});
      proxy.on('error', next);
    };
  }
}

function isRevisioned(uri) {
  return REGEX_IS_REV.test(uri);
}

function isFile(uri) {
  let ext = path.extname(uri).substr(1);
  return !!~FILE_EXTENSIONS.indexOf(ext);
}
