'use strict';

import path from 'path';
import express from 'express';

// Initialization
import waterline from './init/waterline';
import stormpathInit from './init/stormpath';
import cors from 'cors';

// Documentation
import swaggerize from 'swaggerize-express';
import swaggerDocs from 'swaggerize-docs';
import swaggerUi from 'swaggerize-ui';
import augmentDocs from './middleware/augment-docs';

// Util
import { NotFound } from './lib/error';
import apiUtil from './lib/api-util';

import cookieParser from 'cookie-parser';
import featureClient from 'feature-client';
import xprExpress from 'xpr-express';
import xprToggle from 'xpr-toggle';

// AWS
import requestSigner from './middleware/request-signer';

// Router
import staticProxy from './middleware/static-proxy';
import pageRender from './middleware/page-render';

// FlexSites custom
import wwwRedirect from './middleware/www-redirect';
import siteInjector from './middleware/site-injector';

// API
import { json } from 'body-parser';
import stormpath from 'express-stormpath';

var app = express();
const DOCS_DIR       = path.join(__dirname, 'docs');
const ROUTES_DIR     = path.join(__dirname, 'routes');
const DOCS_URI       = '/docs';
const SWAGGER_URI    = '/api-docs';

featureClient.use(xprExpress());
featureClient.use(xprToggle());

featureClient.configure({
  featureUrl: 'https://flexprmntl.herokuapp.com',
  devKey: '1f4d2450-1592-4ea1-8442-4ea5d7dde5f7',
  experiments: ['testExp1', 'testExp2']
});

featureClient.cron('* * * * * *');

global.__root = __dirname;

featureClient.announce()
  .then(() => swaggerDocs(path.join(__dirname, 'docs')))
  .then((api) => {

    app.use(cors());

    app.use(SWAGGER_URI, (req, res, next) => {
      res.send(app.swagger.api);
    })

    // Redirect Apex domains to www
    app.use(wwwRedirect());

    app.use(cookieParser());

    // Parse JSON requests
    app.use(json({ extended: true }));

    // Cache bust
    let util = apiUtil(app);
    app.get('/sex-panther', function(req, res) {
      util.clearTemplate(req);
      res.send({ message: 'Template for site ' + req.hostname + ' cleared successfully' });
    });

    // Static Proxy
    app.use(staticProxy(['/xprmntl/xpr-toggle.js']));

    // Stormpath Config
    app.use(stormpathInit(app));

    app.use(featureClient.express);
    app.use(featureClient.toggle);

    app.use(siteInjector(app));

    // Check that they're in the right group
    app.use((req, res, next) => {
      if (req.flex.site.host !== 'admin.flexsites.io') return next();
      stormpath.groupsRequired(['Site Owner', 'Admin'], false)(req, res, next);
    });

    // API
    app.use('/api/:version', swaggerize({
      api,
      docspath: SWAGGER_URI,
      handlers: ROUTES_DIR
    }), waterline);

    // Page Render
    app.get('/:resource?/:id?', pageRender(app));

    app.use((err, req, res, next) => {
      console.log('Found err', err.stack);
      res.status(err.status || 500).send(err);
    });

    app.listen(process.env.PORT || 3000, function() {
      console.log('Startup complete', process.env.PORT || 3000);
    });
  })
  .catch(ex => {
    console.error('Horrible problem', ex);
    process.exit(1);
  });


