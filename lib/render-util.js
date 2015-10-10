import Hogan from 'hogan.js';
import Promise from 'bluebird';
import { get, coalesce } from 'object-path';
import marked from 'marked';
import globLib from 'glob';
import path from 'path';
import fs from 'fs';
import config from 'config';
import { get as getSiteFile } from './aws/s3';
import lambdas from './lambdas';
import debug from 'debug';

let log = debug('flexsites:render');

const isProd = config.get('isProd');

var readFile = Promise.promisify(fs.readFile, fs);
var glob = Promise.promisify(globLib);
var options = { delimiters: '[[ ]]', disableLambda: false };

var partialsPromise = Promise.props(
  glob(path.join(__dirname, '../resources/partials/**/*.html'))
    .then(paths => paths.reduce((map, uri) => {
      map[path.basename(uri, '.html')] = readFile(uri, 'utf8')
        .then(data => Hogan.compile(data, options));
      return map;
    }, {}))
);

var includeOrder = [
  'venue',
  'event',
  'page',
  'site',
]

partialsPromise
  .then(partials => log('Loaded partials:', Object.keys(partials).join(', ')));

var layouts = {};

export default (host, data) => {
  log('Rendering page for host %s with data %o', host, data);

  let templateUrl = get(data, 'page.templateUrl');
  if (!templateUrl) return renderPage(host, data);

  log('Loading file %s', templateUrl);

  // Get page file
  return getSiteFile(templateUrl, host)
    .then((body) => {
      log('Loaded file', body.length);
      data.page.format = get(data.page, 'format', 'html').toLowerCase();
      data.page.content = body;
      delete data.page.templateUrl;
      return renderPage(host, data);
    });
}

export function clearTemplate({ flex: { host } }) {
  delete layouts[host];
}

export function parseMarkdown(field, data = {}) {
  if (data[field]) data[field] = marked(data[field]);
  return data;
}

function getLayout(host) {
  if (isProd && layouts[host]) return layouts[host];
  return (layouts[host] = getSiteFile('/index.html', host))
    .then((file) => Hogan.compile(file, options));
}

function getPartials() {
  return partialsPromise;
}

function getTemplates(host) {
  return Promise.all([
    getPartials(),
    getLayout(host),
  ])
    .then(([partials, layout]) => {
      partials.layout = layout;
      return partials;
    })
}

function renderPage(host, data) {
  return getTemplates(host)
    .then(templates => {

      // Parse Markdown
      if (data.format === 'markdown') {
        parseMarkdown('content', data);
      }

      includeLambdas(data);

      return Hogan
        .compile(`
          [[<layout]]
          ${includeDataTemplates(data, 'title')}
          ${includeDataTemplates(data, 'description')}
          ${includeDataTemplates(data, 'content')}
          [[/layout]]
        `, options)
        .render(data, templates);
    });
}

function includeLambdas(data) {
  Object.keys(lambdas).map(key => {
    if (!data[key]) data[key] = lambdas[key];
  });
}

function includeDataTemplates(data, field) {
  var val = coalesce(data, includeOrder.map(val => `${val}.${field}`));
  return `[[$${field}]]${val}[[/${field}]]`;
}
