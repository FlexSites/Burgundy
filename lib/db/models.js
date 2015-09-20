import mongoose, { Schema } from 'mongoose';
import glob from 'glob';
import path from 'path';
import { reduce } from 'async';
import Promise from 'bluebird';
import { merge } from 'lodash';
import { get, set } from 'object-path';
import { pascalCase as pascal, snakeCase as snake } from 'change-case';

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
  'beforeDelete',
  'afterDelete',
];

let passThrough = (data) => Promise.resolve(data);

export default function(config) {

  var schema = glob
    .sync(path.join(config.dir, '**/*.js'))
    .map(require)
    .reduce((schema, schemata) => {
      schema[schemata.identity] = schemata;
      return schema;
    }, {});

  return Object.keys(schema)
    .map(getModel)
    .map(model => {
      model.lifecycle = getLifecycle(model);

      model = merge({}, config.defaults, model);

      if (!model.tableName) model.tableName = pascal(model.identity);
      return model;
    })
    .filter(model => model.public !== false)
    // .filter(model => model.tableName === 'Site')
    .reduce((schema, schemata) => {
      let obj = JSON.parse(JSON.stringify(schemata));
      let real = Schema(schemata.attributes, {
        collection: obj.tableName,
        toObject: { getters: true },
        toJSON: { getters: true }
      });

      if (schemata.virtuals) Object.keys(schemata.virtuals)
        .map(key => {
          let virtual = schemata.virtuals[key];
          if (virtual.get) real.virtual(key).get(virtual.get);
          if (virtual.set) real.virtual(key).set(virtual.set);
        });


      let model = mongoose.model(obj.tableName, real);

      Object.keys(schemata.lifecycle)
        .map(key => {
          model[key] = schemata.lifecycle[key];
        });

      if (obj.tableName) schema[obj.tableName.toLowerCase()] = model;
      return schema;
    }, {});


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

  function getLifecycle(model) {
    return METHODS
      .reduce((prev, method) => {
        let fn = get(model, ['lifecycle', method], passThrough);
        set(prev, method, execLifecycle.bind(model, fn));
        return prev;
      }, {});
  }

  function execLifecycle(lifecycle, ...args) {
    let [instance] = args;
    if (!instance) instance = args[0] = {};
    if (!lifecycle) lifecycle = () => Promise.resolve(instance);
    if (!Array.isArray(lifecycle)) lifecycle = [lifecycle];

    return Promise.fromNode(cb => {
      reduce(lifecycle, instance, (i, mw, cb) => {
        Promise.method(mw).apply(this, args)
          .then(ins => {
            if (typeof ins !== 'undefined') return ins;
            return instance;
          }).nodeify(cb);
      }, cb);
    });
  }
}
