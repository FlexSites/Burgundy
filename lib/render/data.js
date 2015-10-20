import Promise from 'bluebird';
import getModels from '../db';
import queryBuilder from '../db/query-builder';
import { get, set } from 'object-path';
import { singularize } from '../string-util';
import { promiseDir } from './index';
import debug from 'debug';

let log = debug('flexsites:render:data');

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

var formattersPromise = promiseDir('formatters');

function getFormatters() {
  return formattersPromise;
}

formattersPromise
  .then(formatters => log('Loaded formatters:', Object.keys(formatters).join(', ')));

function format(data = {}) {
  return getFormatters()
    .then(formatters => Object.keys(data)
      .reduce((obj, key) => {
        let formatter = formatters[singularize(key)];
        if (formatter) formatter(obj[key], obj)
        return obj;
      }, data));
}


getModels()
  .then(models => validCollections = Object.keys(models));

export default (req) => {
  return Promise.all([
    getPage(req),
    getRouteData(req),
  ])
  .then(([page, route]) => Object.assign({ site: req.flex.site }, page, route))
  .then(format);
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
    .reduce((prev, curr) => {
      let query = {};
      try {
        query = JSON.parse(curr.query );
      } catch (ex) {
        log(`Bad JSON for ${curr.name}`);
      }
      curr.query = query;
      prev.push(curr);
      return prev;
    }, [])
    .map(({ name, query }) => getData(name, query, req, dest));
  return Promise.all(promises)
    .return(dest);
}

export function getRouteData(req) {
  if (req.flex.site.isSinglePageApp) return {};
  let query = {};
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

  let filters = filterMap[resource];
  if (filters) query = Object.assign(filters, query);
  return getModels(key)
    .then(model => list(model, query, req))
    .then(populateMedia)
    .then(data => {
      if (!Array.isArray(data)) parent[key] = data;
      if (data.length === 1) parent[key] = data[0];
      if (resource !== 'pages') parent[resource] = data;
      return parent;
    });
}

function populateMedia(data) {
  if (Array.isArray(data)) return data.map(populateMedia);
  data = data.toObject();
  if (!data.media) return data;
  data = data.media.reduce((obj, media) => {
    obj[media.type] = media;
    return obj;
  }, data);
  return data;
}
