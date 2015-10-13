import Promise from 'bluebird';
import getModels from './db';
import queryBuilder from './db/query-builder';
import { get, set } from 'object-path';
import { singularize } from './string-util';

var filterMap = {
  events: {
    include: ['media', 'venue', 'showtimes'],
  },
  entertainers: {
    include: 'media',
  },
  venues: {
    include: 'media',
  },
  posts: {
    include: 'media',
  },
  pages: {
    include: 'media',
  },
};

var validCollections = [];

getModels()
  .then(models => validCollections = Object.keys(models));

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

  return getData('pages', req.query.filter, req)
    .then(data => {
      let page = get(data, 'page', {});
      if (!page.data) return page;
      return populatePageData(page.data, data, req);
    })
}

function populatePageData(src, dest, req) {
  let promises = src
      .map(({ name, query = '{}' }) => getData(name, JSON.parse(query), req, dest));
  return Promise.all(promises)
    .return(dest);
}

export function getRouteData(req) {
  if (req.flex.site.isSinglePageApp) return {};
  let query = {};
  let filters = filterMap[req.params.resource];
  if (filters) Object.assign(filters, query);
  set(query, 'where.id', req.params.id);
  return getData(req.params.resource, query, req);
}

function list(model, query, req) {
  return Promise.resolve(query)
    .then(body => model.beforeAccess(body, req))
    .then(body => queryBuilder(model, body))
    .then(body => model.afterAccess(body, req));
}

export function getData(resource = '', query = {}, req = {}, parent = {}) {
  let key = singularize(resource);
  if (!~validCollections.indexOf(key)) return Promise.resolve(parent);
  return getModels(key)
    .then(model => list(model, query, req))
    .then(data => {
      if (data && data.length === 1) parent[key] = data[0];
      if (resource !== 'pages') parent[resource] = data;
      return parent;
    });
}
