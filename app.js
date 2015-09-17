'use strict';

import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { json } from 'body-parser';
import stormpath from 'express-stormpath';
import Promise from 'bluebird';

// Documentation
import swaggerize from 'swaggerize-express';
import swaggerDocs from 'swaggerize-docs';

// Initialization
import waterline from './init/waterline';
import stormpathInit from './init/stormpath';
import featureClient from './init/xprmntl';

// Router
import staticProxy from './middleware/static-proxy';
import pageRender from './middleware/page-render';

// FlexSites custom
import wwwRedirect from './middleware/www-redirect';
import siteInjector from './middleware/site-injector';

const DOCS_DIR       = path.join(__dirname, 'docs');
const ROUTES_DIR     = path.join(__dirname, 'routes');
const SWAGGER_URI    = '/api-docs';

global.__root = __dirname;

var app = express();

app.use(cors());

// Redirect Apex domains to www
app.use(wwwRedirect());

app.use(cookieParser());
app.use(json({ extended: true }));

// Static Proxy
app.use(staticProxy(['/xprmntl/xpr-toggle.js']));

// Stormpath Config
app.use(stormpathInit(app));

// Inject current requests site
app.use(siteInjector(app));

Promise.all([
  swaggerDocs(DOCS_DIR),
  featureClient.announce()
])
.then(([api]) => {

  // Health Check
  app.get('/ping', (req, res) => res.send({ pong: true }));

  // XPRMNTL
  app.use(featureClient.express, featureClient.toggle);

  // Check that they're in the right group
  app.use((req, res, next) => {
    if (req.flex.site.host !== 'admin.flexsites.io') return next();
    stormpath.groupsRequired(['Site Owner', 'Admin'], false)(req, res, next);
  });

  // API
  app.use(swaggerize({
    api,
    docspath: SWAGGER_URI,
    handlers: ROUTES_DIR
  }));
  app.use('/api/:version', waterline);

  // Page Render
  app.get('/:resource?/:id?', pageRender(app));

  app.use((err, req, res, next) => {
    console.error(err.message);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Server error.');
  });

  app.listen(process.env.PORT || 3000, function() {
    console.log('Startup complete', process.env.PORT || 3000);
  });
})
.catch(ex => {
  console.error('Startup failed', ex.message, ex.status, ex.stack);
  process.exit(1);
});


