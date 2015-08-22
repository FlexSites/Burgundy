import { deferConfig as defer } from 'config/defer';

export default {
  aws: {
    region: 'us-west-2',
    s3: {
      region: defer(function(cfg) {
        return cfg.aws.region;
      })
    }
  }
};

