import ACL from '../lib/acl';
import getModels from '../lib/get-models';
import { dashed } from '../lib/string-util';
import Promise from 'bluebird';

let acl = new ACL(req => {

  if (!req.user) return Promise.resolve([]);

  return Promise.resolve(
    Object.keys(
      req.user.groups.join(',').split(',')
        .reduce((prev, curr) => {
          prev[curr.split('=')[1]] = '';
          return prev;
        }, {})
    )
  );
});

getModels()
  .map(model => acl.addResource(dashed(model.identity), model.acl));

export default function(app) {
  return acl.middleware.bind(acl);
}
