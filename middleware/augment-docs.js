
import { pathTemplate } from '../lib/docs/default';
import { capitalize, camel } from '../lib/string-util';
import objectPath from 'object-path';
import filterParameters from '../lib/docs/filters.json';

export function getModelDefinitions(name, properties, obj) {

  let nestedObj = {};

  Object.keys(properties)
    .map(prop => {
      let val = properties[prop];

      if (~prop.indexOf('_')) {
        objectPath.set(nestedObj, prop.replace(/_/, '.'), val);
        let nestedObjName = prop.split('_').shift();
        properties[nestedObjName] = {
          $ref: `#/definitions/${capitalize(name)}_${capitalize(nestedObjName)}`
        };
        delete properties[prop];
      }
    });

  let nestedObjKeys = Object.keys(nestedObj);
  if (nestedObjKeys.length) {
    nestedObjKeys
      .map(key => getModelDefinitions(`${capitalize(name)}_${capitalize(key)}`, nestedObj[key], obj));
  }

  if (name !== 'BlogPost') return;

  properties = Object.keys(properties)
    .map(key => {
      return { key, value: properties[key] };
    })
    .filter(({ value }) => !!~Object.keys(value).indexOf('type') && Object.keys(value).length === 1)
    .reduce((prev, { key }) => {
      prev[key] = { type: 'string' };
      return prev;
    }, {});

   obj[name] = { properties };
}

export default function augmentDocs(api, models) {
  Object.keys(models)
    .map(key => models[key])
    .filter(model => model.public && model.connection || console.log(model.connection))
    .map(model => {
      Object.assign(api.paths, pathTemplate(model));
      getModelDefinitions(camel(model.identity), model.attributes, api.definitions);
    });

  for (var path in api.paths) {
    if (api.paths.hasOwnProperty(path)) {
      let pathObj = api.paths[path];
      for (var method in pathObj) {
        if (pathObj.hasOwnProperty(method)) {
          let methodObj = pathObj[method];

          if (/\{id\}/.test(path)) {
            if (!methodObj.parameters) methodObj.parameters = [];
            // methodObj.parameters = [
            //   {
            //     'in': 'path',
            //     name: 'id',
            //     type: 'string',
            //     required: true
            //   }
            // ].concat(methodObj.parameters);
          } else if (method === 'get') {
            if (!methodObj.parameters) methodObj.parameters = [];
            methodObj.parameters = methodObj.parameters.concat(filterParameters);
          }
        }
      }
    }
  }

  // TODO: only add swagger docs for "public" models
  return api;
}
