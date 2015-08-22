import path from 'path';
import { init as stormpath } from 'express-stormpath';

export default function(app) {
  return stormpath(app, {
    expandGroups: true,
    registrationView: path.join(__root, 'views/register.jade'),
    loginView: path.join(__root, 'views/login.jade'),
  });
}

