import { init as stormpath } from 'express-stormpath';

export default function(app) {
  return stormpath(app, {
    expandGroups: true
  });
}
