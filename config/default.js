import { deferConfig as defer } from 'config/defer';
import url from 'url';

export default {
  aws: {
    region: 'us-west-2',
    s3: {
      region: defer(function(cfg) {
        return cfg.aws.region;
      })
    }
  },
  redis: {
    host: defer(function(cfg) {
      if (cfg.redis.url) return url.parse(cfg.redis.url).hostname;
    }),
    port: defer(function(cfg) {
      if (cfg.redis.url) return url.parse(cfg.redis.url).port;
    }),
    password: defer(function(cfg) {
      if (cfg.redis.url) return url.parse(cfg.redis.url).auth.split(':')[1];
    })
  },
  stormpath: {
    cache: 'memory'
  }
};

