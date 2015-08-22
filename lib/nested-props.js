'use strict';

var objectPath = require('object-path');

export default (obj, delimiter = '_') => {
  let delimRegex = new RegExp(delimiter, 'g');
  Object.keys(obj).forEach((prop) => {
    if(~prop.indexOf(delimiter)){
      objectPath.set(obj, prop.replace(delimRegex, '.'), obj[prop]);
      delete obj[prop];
    }
  });
  return obj;
};
