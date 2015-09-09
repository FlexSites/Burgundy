import Hogan from 'hogan.js';
import Promise from 'bluebird';
import getModels from 'express-waterline';
import { set } from 'object-path';
import marked from 'marked';
import glob from 'glob';
import path from 'path';
import { parse as qs } from 'qs';
import queryBuilder from 'express-waterline/lib/query-builder';
import { singularize } from './string-util';
import { get as getSiteFile } from './aws/s3';


var prefix = process.env.NODE_ENV || 'local';
if (prefix === 'prod') prefix = '';

var isDynamic = /^\/(events|entertainers|venues|posts|media)\/*([a-f0-9]{24}\/*)*/
  , templates = {}
  , filterMap = {
    'events': [
      'filter[include]=media',
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

export default function(app) {
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
  var apiPath = isDynamic.test(url) ? 'dynamicpage' : 'page';
  url = url.replace(/[a-f0-9]{24}.*/, ':id');
  return getResource(apiPath)
    .findOne()
    .where({ url, site: flex.site.id })
    .then((page = {}) => {
      page.templateUrl = page.templateUrl || page._templateUrl;
      if (!page.templateUrl) return page;
      return getSiteFile(page.templateUrl, flex.site.host)
        .then((body) => {

          // Parse Markdown
          if (page.format === 'MarkDown') body = marked(body);
          page.content = body;
          delete page.templateUrl;
          page.url = url.substr(1, url.length - 1);
          return page;
        });
    });
}

export function clearTemplate({ hostname }) {
  delete templates[hostname];
}

export function getTemplate({ hostname }) {
  if (process.env.NODE_ENV === 'prod' && templates[hostname]) return templates[hostname];
  return (templates[hostname] = getSiteFile('/index.html', removePrefix(hostname)))
    .then((file) => Hogan.compile(file, options));
}

export function removePrefix(url) {
  return /^(?:https?:\/\/)?(?:www|local|test)?\.?(.*)$/.exec(url)[1];
}

export function formatter(type, data) {
  var fn = formatters[type];
  if (!fn) return data;
  if (Array.isArray(data)) return data.map(fn);
  return fn(data);
}

export function getRouteData(req, res) {
  if (req.flex.site.isSinglePageApp) return {};
  return getData(req.params.resource, req.params.id, req, res);
}

export function getResourceQuery(model, req) {
  return model.lifecycle.beforeAccess(req.query.filter, req);
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

  let model = getResource(key);

  return getResourceQuery(model, req)
    .then(() => {
      if (id) set(req, 'query.filter.where.id', id);

      let query = req.query.filter;
      return queryBuilder(model, query)
        .then((data) => {
          var name = resource;
          if (!isList) name = singularize(name);
          parent[name] = formatter(resource, data);
          return parent;
        });
    }
  );
}

export function parseMarkdown(field, data) {
  if (!data) return {};
  data[field] = marked(data[field]);
  return data;
}
