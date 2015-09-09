
// XPRMNTL
import featureClient from 'feature-client';
import xprExpress from 'xpr-express';
import xprToggle from 'xpr-toggle';

featureClient.use(xprExpress());
featureClient.use(xprToggle());

featureClient.configure({
  featureUrl: 'https://flexprmntl.herokuapp.com',
  devKey: '1f4d2450-1592-4ea1-8442-4ea5d7dde5f7',
  experiments: ['testExp1', 'testExp2']
});

featureClient.cron('* * * * * *');

export default featureClient;
