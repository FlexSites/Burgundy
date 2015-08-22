'use strict';

import path from 'path';
import glob from 'glob';
import { dashed } from './string-util';
import { merge } from 'lodash';


export default function(){

  var schemas = glob
    .sync(path.join(__dirname, '../models/**/**.js'))
    .reduce((prev, curr) => {
      let base = dashed(path.basename(curr, '.js'));
      if(/elasticsearch/.test(curr)) base = 'es_' + base;
      prev[base] = curr;
      return prev;
    }, {});

  return Object.keys(schemas)
    .map(getModel);

  function getModel(name) {
    var obj = schemas[name];
    if (!obj) return {};
    if (typeof obj === 'string') {
      obj = schemas[name] = require(obj);
    }

    if (obj.base) {
      obj = merge({}, getModel(dashed(obj.base)), obj);
    }

    return obj;
  }
}
