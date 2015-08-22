'use strict';

import express from 'express';

// Initialization
import initDB from './init/models';
import { NotFound } from './lib/error';
import apiUtil from './lib/api-util';

// Middlewares
import { json } from 'body-parser';
import swaggerUi from 'swaggerize-ui';
import stormpathInit from './middleware/stormpath-init';
import stormpath from 'express-stormpath';
import wwwRedirect from './middleware/www-redirect';

// Router
import staticProxy from './middleware/static-proxy';
import pageRender from './middleware/page-render';

// API
import resourceRouter from './middleware/api/resource-router';
import magic from './middleware/api/magic';
import siteInjector from './middleware/site-injector';
import augmentDocs from './middleware/augment-docs';

var app = express();
const DOCS_PATH = '/docs';
const SWAGGER_PATH = '/api-docs';

global.__root = __dirname;

initDB(app)
  .then((models) => {

    // Redirect Apex domains to www
    app.use(wwwRedirect());

    // Parse JSON requests
    app.use(json({ extended: true }));

    // Swagger Spec
    app.use(SWAGGER_PATH, augmentDocs(models));

    // Swagger UI
    app.use(DOCS_PATH, swaggerUi({ docs: SWAGGER_PATH }));

    // Cache bust
    let util = apiUtil(app);
    app.get('/sex-panther', function(req, res) {
      util.clearTemplate(req);
      res.send({ message: 'Template for site ' + req.hostname + ' cleared successfully' });
    });

    // Static Proxy
    app.use(staticProxy());

    // Stormpath Config
    app.use(stormpathInit(app));

    app.get('/api/v1/sessions', (req, res, next) => {
      if (req.user) {

        // Add the isAdmin flag
        req.user.isAdmin = !!req.user.groups.items.find(function(item){
          return item.name === 'Admin';
        });

        return res.send([ req.user ]);
      }

      next(new NotFound('Session not found'));
    });

    app.use(siteInjector(app));

    // Check that they're in the right group
    app.use((req, res, next) => {
      if (req.flex.site.host !== 'admin.flexsites.io') return next();
      stormpath.groupsRequired(['Site Owner', 'Admin'], false)(req, res, next);
    });

    // API
    app.use('/api/:version/:resource', magic(app), resourceRouter(app));

    // Page Render
    app.get('/:resource?/:id?', magic(app), pageRender(app));

    app.use((err, req, res, next) => {
      console.log('Found err', err.stack);
      res.status(err.status || 500).send(err);
    });

    app.listen(process.env.PORT || 3000, function(){
      console.log('Startup complete');
    });
  });


