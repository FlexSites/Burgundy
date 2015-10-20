require('dotenv').load({
  silent: true,
});
require('newrelic');
require('babel/register');
require('./app');
