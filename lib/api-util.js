import Promise from 'bluebird';
import getModels from './db';
import queryBuilder from './db/query-builder';
import glob from 'glob';
import path from 'path';
import { set } from 'object-path';
import { parse as qs } from 'qs';
import { singularize } from './string-util';
import { get as getSiteFile } from './aws/s3';

var filterMap = {
  events: [
    'filter[include]=media',
    'filter[include]=venue',
    'filter[include]=showtimes',
  ],
  entertainers: [
    'filter[include]=media',
  ],
  venues: [
    'filter[include]=media',
  ],
  posts: [
    'filter[include]=media',
  ],
  pages: [
    'filter[include]=media',
  ],
};

var formatters = glob
  .sync(path.join(__dirname, 'formatters/**'))
  .reduce((prev, curr) => {
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

export function getResource(name) {
  let resource = models[name];
  if (!resource) throw new Error(`Resource ${name} not found`);
  return resource;
}

export default (req) => {
  return Promise.all([
    getPage(req),
    getRouteData(req),
  ])
  .then(([page, route]) => Object.assign({ site: req.flex.site }, page, route));
}

export function getPage(req) {
  if (req.flex.site.isSinglePageApp) return {};
  req.url = req.url.replace(/[a-f0-9]{24}.*/, ':id');
  set(req, 'query.filter.where.url', req.url);
  set(req, 'query.filter.where.site', req.flex.site.id);

  return getData('page', req.query.filter, req)
    .then(data => {
      if (!data.page.data) return data.page;
      return populatePageData(data.page.data, data, req);
    })
}

function populatePageData(src, dest, req) {
  let promises = src
      .map(({ name, query }) => getData(name, query, req, dest));
  return Promise.all(promises)
    .return(dest);
}

export function formatter(type, data) {
  var fn = formatters[type];
  if (!fn) return data;
  if (Array.isArray(data)) return data.map(fn);
  return fn(data);
}

export function getRouteData(req) {
  if (req.flex.site.isSinglePageApp) return {};
  let query = '';
  let filters = filterMap[req.params.resource];
  if (filters) query += `?${filters.join('&')}`;
  return getData(req.params.resource + query, req.params.id, req);
}

function list(model, query, req) {
  return Promise.resolve(query)
    .then(body => model.beforeAccess(body, req))
    .then(body => queryBuilder(model, body))
    .then(body => model.afterAccess(body, req));
}

export function getData(resource, query = {}, req = {}, parent = {}) {

  if (resource && ~resource.indexOf('?')) {
    let parts = resource.split('?');
    resource = parts[0];
    query = Object.assign(query, qs(parts[1]));
  }

  // filterMap[resource] || [];
  let key = singularize(resource || '');
  if (!~modelKeys.indexOf(key)) return Promise.resolve([]);
  return getModels(key)
    .then(model => list(model, query, req))
    .then(data => {
      var name = resource;
      if (resource === 'page') data = data[0];
      parent[name] = formatter(resource, data);
      return parent;
    });
}
