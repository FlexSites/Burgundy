import path from 'path';
import config from 'config';
import { init as stormpath } from 'express-stormpath';

export default function(app) {
  return stormpath(app, {
    expandGroups: true,
    registrationView: path.join(__root, 'views/register.jade'),
    loginView: path.join(__root, 'views/login.jade'),
    cache: config.get('stormpath.cache'),
    cacheHost: config.get('redis.host'),
    cachePort: config.get('redis.port'),
    cacheOptions: {
      auth_pass: config.get('redis.password')
    }
  });
}
