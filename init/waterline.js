import { init } from 'express-waterline';
import mongoAdapter from 'sails-mongo';
import path from 'path';

export default init({
  dir: path.join(process.cwd(), 'model'),
  // Setup Adapters
  // Creates named adapters that have have been required
  adapters: {
    'default': mongoAdapter,
    disk: mongoAdapter,
    mongo: mongoAdapter
  },

  // Build Connections Config
  // Setup connections using the named adapter configs
  connections: {
    myLocalmongo: {
      adapter: 'mongo',
      url: process.env.MONGOLAB_URI
    }
  },

  defaults: {
    migrate: 'alter'
  }

});





