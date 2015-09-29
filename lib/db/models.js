import glob from 'glob';
import path from 'path';
import Promise from 'bluebird';
import { get, set } from 'object-path';
import debug from 'debug';
import createModel from './factory';
import merge from 'lodash.merge';

let log = debug('supermodel:models');

const METHODS = [
  // GET
  'beforeAccess',
  'afterAccess',

  // PUT, POST
  'beforeSave',
  'afterSave',

  // PUT
  'beforeUpdate',
  'afterUpdate',

  // POST
  'beforeCreate',
  'afterCreate',

  // DELETE
  'beforeRemove',
  'afterRemove',
];

let passThrough = (data) => Promise.resolve(data);

export default function(config) {

  let factoryMethod = Promise.method(createModel);

  var schema = glob
    .sync(path.join(config.dir, '**/*.js'))
    .map(uri => {
      let model = require(uri);
      if (!model.identity) model.identity = path.basename(uri, '.js');
      model.identity = model.identity.toLowerCase();
      return model;
    })
    .reduce((schema, schemata) => {
      schema[schemata.identity] = schemata;
      return schema;
    }, {});

  let models = Object.keys(schema)
    .map(getModel)
    .map(model => merge({}, setLifecycle(model)))
    .filter(model => model.public !== false)
    .reduce((schema, schemata) => {
      schema[schemata.identity.replace(/-/g, '')] = factoryMethod(schemata);
      return schema;
    }, {});

  return Promise.props(models);

  function getModel(name) {
    var obj = schema[name];
    if (!obj) throw new Error(`Schmemata for model ${name} not found`);
    if (obj.base) obj = merge({}, getModel(obj.base), obj, (a, b, key) => {
      if (~METHODS.indexOf(key) && a && b) {
        if (!Array.isArray(a)) a = [a];
        if (!Array.isArray(b)) b = [b];
        return a.concat(b);
      }
    });

    return obj;
  }

  function setLifecycle(model) {
    METHODS
      .map(method => {
        let lifecyclePath = ['lifecycle', method];
        let fn = get(model, lifecyclePath, passThrough);
        set(model, lifecyclePath, execLifecycle.bind(model, fn));
      }, {});
    return model;
  }

  function execLifecycle(lifecycle, ...args) {
    log('exec lifecycle %s', lifecycle);
    let [instance] = args;
    if (!instance) instance = args[0] = {};
    if (!lifecycle) lifecycle = () => Promise.resolve(instance);
    if (!Array.isArray(lifecycle)) lifecycle = [lifecycle];

    return Promise.reduce(lifecycle, (prev, mw) => {
      return Promise.method(mw)
        .apply(this, args)
        .then(ins => {
          if (typeof ins !== 'undefined') return ins;
          return instance;
        });
    }, instance);
  }
}
