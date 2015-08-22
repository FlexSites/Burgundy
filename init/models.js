import Waterline from 'waterline';
import mongoAdapter from 'sails-mongo';
import glob from 'glob';
import path from 'path';
import Promise from 'bluebird';
import { merge } from 'lodash';
import { pascal } from '../lib/string-util';

export default function(app) {
  // Instantiate a new instance of the ORM
  var orm = new Waterline();
  var schemas = glob
    .sync(path.join(__dirname, '../model/**/**.js'))
    .reduce((prev, curr) => {
      let base = path.basename(curr, '.js');
      prev[base] = curr;
      return prev;
    }, {});

  Object.keys(schemas)
    .map(getModel)
    .filter(model => model.public)
    .map(model => {
      model.tableName = pascal(model.identity);
      return model;
    })
    .map(model => Waterline.Collection.extend(model))
    .map(orm.loadCollection.bind(orm));

  return Promise.promisify(orm.initialize.bind(orm))({

    // Setup Adapters
    // Creates named adapters that have have been required
    adapters: {
      'default': mongoAdapter,
      disk: mongoAdapter,
      mongo: mongoAdapter
    },

    // Build Connections Config
    // Setup connections using the named adapter configs
    connections: {
      myLocalmongo: {
        adapter: 'mongo',
        url: process.env.MONGOLAB_URI
      }
    },

    defaults: {
      migrate: 'alter'
    }

  })
    .then((models) => {
      app.set('models', models.collections);
      app.set('connections', models.connections);
      console.info('Waterline is up');
      return models.collections;
    });

  function getModel(name) {
    var obj = schemas[name];
    if (!obj) throw new Error(`Schmemata for model ${name} not found`);

    if (typeof obj === 'string') obj = schemas[name] = require(obj);

    if (obj.base) obj = mergeParent(getModel(obj.base), obj);

    return obj;
  }

  function mergeParent(parent, child) {
    let parentMethods = getModelFunctions(parent);

    getModelFunctions(child)
      .filter(method => ~parentMethods.indexOf(method))
      .map(method => {
        if (!Array.isArray(parent[method])) parent[method] = [parent[method]];
        parent[method].push(child[method]);
        child[method] = parent[method];
      });

    return merge({}, parent, child);
  }

  function getModelFunctions(model) {
    let methods = [
      'beforeValidate',
      'afterValidate',
      'beforeUpdate',
      'afterUpdate',
      'beforeCreate',
      'afterCreate',
      'beforeDestroy',
      'afterDestroy'
    ];
    return Object.keys(model)
      .filter(key => ~methods.indexOf(key));
  }
}





