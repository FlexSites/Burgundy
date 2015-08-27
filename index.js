require('dotenv').load({
  silent: true
});
if (process.NODE_ENV === 'prod') require('newrelic');
require('babel/register');
require('./app');
