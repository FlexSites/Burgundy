import Hogan from 'hogan.js';
import Promise from 'bluebird';
import { set, get, coalesce } from 'object-path';
import marked from 'marked';
import globLib from 'glob';
import path from 'path';
import fs from 'fs';
import config from 'config';
import { get as getSiteFile } from '../aws/s3';
import lambdas from '../lambdas';
import debug from 'debug';

let log = debug('flexsites:render');

const isProd = config.get('isProd');

var readFile = Promise.promisify(fs.readFile, fs);
var glob = Promise.promisify(globLib);
var options = { delimiters: '[[ ]]', disableLambda: false };


var partialsPromise = promiseDir('../../resources/partials/', 'html', data => Hogan.compile(data, options));

var includeOrder = [
  'venue',
  'event',
  'page',
  'site',
];

partialsPromise
  .then(partials => log('Loaded partials:', Object.keys(partials).join(', ')));

var layouts = {};

export default (host, data) => {
  log('Rendering page for host %s with data %s', host, Object.keys(data).join(', '));

  let templateUrl = get(data, 'page.templateUrl');
  if (!templateUrl) return renderPage(host, data);

  log('Loading file %s', templateUrl);

  // Get page file
  return getSiteFile(templateUrl, host)
    .then((body) => {
      log('Loaded file', body.length);
      data.page.format = get(data.page, 'format', 'html').toLowerCase();
      set(data, 'page.template', body);
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
          ${includeDataTemplates(includeOrder, data, 'title')}
          ${includeDataTemplates(includeOrder, data, 'description')}
          ${includeDataTemplates(['page'], data, 'content')}
          ${includeDataTemplates(['page'], data, 'template')}
          ${includeDataTemplates(includeOrder, data, 'media.0.src', 'shareImage')}
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

function includeDataTemplates(includes, data, field, name = field) {
  var val = coalesce(data, includes.map(val => `${val}.${field}`));
  if (!val) return '';
  return `[[$${name}]]${val}[[/${name}]]`;
}

export function promiseDir(dir, ext = 'js', fn = a => a) {
  return Promise.props(
    glob(path.join(__dirname, dir, `**/*.${ext}`))
      .then(paths => paths.reduce((map, uri) => {
        var file;
        if (ext === 'js') file = Promise.resolve(require(uri));
        else file = readFile(uri, 'utf8');
        if (fn) file = file.then(fn);
        map[path.basename(uri, `.${ext}`)] = file;
        return map;
      }, {}))
  );
}
