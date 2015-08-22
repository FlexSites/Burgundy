import Promise from 'bluebird';
import async from 'async';
import objectPath from 'object-path';
import { Unauthorized, Forbidden, NotAllowed } from '../lib/error';
import { singularize } from '../lib/string-util';
import { compact } from 'lodash';

let methodMapping = {
  POST: 'create',
  GET: 'read',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete'
};

const RESOURCE_KEY = '_resource';
const METHOD_KEY = '_method';

export default class ACL {
  constructor(groupFn) {
    this.groupFn = groupFn || () => Promise.resolve([]);
    this[RESOURCE_KEY] = {};
    this[METHOD_KEY] = {
      $everyone: (req, items) => Promise.resolve(true),
      $authenticated: (req, items) => Promise.resolve(!!req.user),
      $inGroup: (req, items) =>
        this.groupFn(req)
          .then(groups => items.map(item => !!~groups.indexOf(item)))
          .then(compact)
          .then((values) => !!values.length)
    };
  }

  addResource(name, acl) {
    this._add(RESOURCE_KEY, name, acl);
  }

  addMethod(name, method) {
    this._add(METHOD_KEY, name, method);
  }

  _add(type, key, value) {
    this[type][key] = value;
  }

  getACL(req) {
    let resource = req.params.resource || '';
    let acl = objectPath.get(this, `${RESOURCE_KEY}.${singularize(resource)}.${methodMapping[req.method]}`);
    if (acl && !Array.isArray(acl)) acl = [acl];
    return acl;
  }

  middleware(req, res, next) {
    let acl = this.getACL(req);

    // Method not allowed by model definition
    if (acl === false) return next(new NotAllowed());

    if (!acl) return next();

    let lambdaCount = 0;

    let methods = acl
      .reduce((prev, curr) => {

        let key = curr;
        if (typeof curr === 'function') key = `$anon_${++lambdaCount}`;
        else if (key.charAt(0) !== '$') key = '$inGroup';

        // Ensure value is array
        if (!prev[key]) prev[key] = [];
        if (key !== curr) prev[key].push(curr);

        return prev;
      }, {});

    let promises = Object.keys(methods)
      .map(key => (this[METHOD_KEY][key] || methods[key][0])(req, methods[key]));

    Promise.any(promises)
      .then(result => {
        if (!result) return new Unauthorized();
      })
      .then(next)
      .catch(next);
  }
}
