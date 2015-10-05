import Hogan from 'hogan.js';
import Promise from 'bluebird';
import getModels, { list } from './db';
import { get, set } from 'object-path';
import marked from 'marked';
import glob from 'glob';
import config from 'config';
import path from 'path';
import { parse as qs } from 'qs';
import { singularize } from './string-util';
import { get as getSiteFile } from './aws/s3';

const isProd = config.get('isProd');

var templates = {}
  , filterMap = {
    'events': [
      'filter[include]=media',
      'filter[include]=venue',
      'filter[include]=showtimes'
    ],
    'entertainers': [
      'filter[include]=media'
    ],
    'venues': [
      'filter[include]=media'
    ],
    'posts': [
      'filter[include]=media'
    ],
    'pages': [
      'filter[include]=media'
    ]
  }

  , options = {
  delimiters: '[[ ]]',
  disableLambda: false
};

var formatters = glob
  .sync(path.join(__dirname, 'formatters/**'))
  .reduce(function(prev, curr) {
    var name = curr.split('/').pop()
      , idx = name.indexOf('.');
    if (!~idx) return prev;
    prev[name.substr(0, idx)] = require(curr);
    return prev;
  }, {});

var models, modelKeys;

getModels()
  .then(m => {
    models = m;
    modelKeys = Object.keys(models);
  });

export default function() {
  return {
    getPage,
    getTemplate,
    clearTemplate,
    getData,
    getRouteData,
    getSiteFile,
    parseMarkdown,
  };
}

export function getResource(name) {
  let resource = models[name];
  if (!resource) throw new Error(`Resource ${name} not found`);
  return resource;
}

export function getPage({ url, flex }) {
  if (flex.site.isSinglePageApp) return {};
  url = url.replace(/[a-f0-9]{24}.*/, ':id');
  let query = { url, site: flex.site.id };
  return getResource('page')
    .findOne()
    .where(query)
    .then((page = {}) => {
      if (!page) return {};
      if (!page.templateUrl) return page;
      page.format = get(page, 'format', 'html').toLowerCase();
      return getSiteFile(page.templateUrl, flex.site.host)
        .then((body) => {
          page.content = body;
          delete page.templateUrl;
          page.url = url.substr(1, url.length - 1);
          return page;
        });
    })
    .then(page => {
      // Parse Markdown
      if (page.format === 'markdown') page.content = marked(page.content);
      return page;
    });
}

export function clearTemplate({ flex: { host } }) {
  delete templates[host];
}

export function getTemplate({ flex: { host } }) {
  if (isProd && templates[host]) return templates[host];
  return (templates[host] = getSiteFile('/index.html', host))
    .then((file) => Hogan.compile(file, options));
}

export function formatter(type, data) {
  var fn = formatters[type];
  if (!fn) return data;
  if (Array.isArray(data)) return data.map(fn);
  return fn(data);
}

export function getRouteData(req, res) {
  if (req.flex.site.isSinglePageApp) return {};
  let query = '';
  let filters = filterMap[req.params.resource];
  if (filters) query += `?${filters.join('&')}`;
  return getData(req.params.resource + query, req.params.id, req, res);
}

export function getData(resource, id, req = {}, res = {}, parent = {}) {
  var isList = !id;
  if (resource && ~resource.indexOf('?')) {
    let parts = resource.split('?');
    resource = parts[0];
    req.query = qs(parts[1]);
  }

  // filterMap[resource] || [];
  let key = singularize(resource || '');
  if (!~modelKeys.indexOf(key)) return Promise.resolve(id ? {} : []);

  return getModels(key)
    .then(model => {
      if (id) set(req, 'query.filter.where.id', id);
      return list(model, req)
        .then(data => {
          var name = resource;
          if (!isList) name = singularize(name);
          parent[name] = formatter(resource, data);
          return parent;
        });
    });
}

export function parseMarkdown(field, data) {
  if (!data) return {};
  data[field] = marked(data[field]);
  return data;
}
