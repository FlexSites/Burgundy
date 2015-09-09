import path from 'path';
import config from 'config';
import { init as stormpath } from 'express-stormpath';

export default function(app) {
  return stormpath(app, {
    api: true,
    website: true,
    expandGroups: true,
    registrationView: path.join(__root, 'views/register.jade'),
    loginView: path.join(__root, 'views/login.jade'),
    // cacheOptions: {
    //   store: 'redis',
    //   connection: {
    //     host: config.get('redis.host'),
    //     port: config.get('redis.port'),
    //   },
    //   options: {
    //     return_buffers: false,
    //     auth_pass: config.get('redis.password')
    //   },
    //   ttl: 300,
    //   tti: 300
    // },
    getOauthTokenUrl: '/oauth/token',
    oauthTTL: 5 * 60 // 5 minutes
  });
}
