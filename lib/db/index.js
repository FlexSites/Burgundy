import path from 'path';
import assert from 'assert';
import Promise from 'bluebird';
import initModels from './models';
import router from './resource-router';
import mongoose from 'mongoose';

var initialized;
var configured;
var initPromise = Promise.fromNode((cb) => { initialized = cb; });

export let getModels = (name) => initPromise
  .then((collections) => {
    if (!name) return collections;
    name = name.toLowerCase().replace(/-/g, '');
    assert(collections[name], `No collection with name "${name}" exists`);
    return collections[name];
  });

export default getModels;

export function lifecycle(model, cycle) {
  return (ins, req) => getModels(model)
    .then(Model => Model.lifecycle[cycle](ins, req));
}

export function init(config) {
  assert(
    !configured,
    'You can only initialize waterline-models once'
  );

  configured = true;

  // Defaults
  config = Object.assign({
    dir: path.join(process.cwd(), 'models'),
    defaults: {},
  }, config);

  mongoose.connect(process.env.MONGOLAB_URI);
  initModels(config).nodeify(initialized);

  return router(config);
}

export * from './methods';
