import config from 'config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import debug from 'debug';
import { json } from 'body-parser';
import stormpath from 'express-stormpath';

// Documentation
import swaggerize from 'swaggerize-express';
import swaggerDocs from 'swaggerize-docs';

// Initialization
import { init as mongoose } from './lib/db';
import stormpathInit from './init/stormpath';

// Router
import staticProxy from './middleware/static-proxy';
import pageRender from './middleware/page-render';

// FlexSites custom
import wwwRedirect from './middleware/www-redirect';
import hostInjector from './middleware/host-injector';
import siteInjector from './middleware/site-injector';

const DOCS_DIR = path.join(__dirname, 'docs');
const ROUTES_DIR = path.join(__dirname, 'routes');
const SWAGGER_URI = '/api-docs';
const PORT = config.get('port');
const ENV = config.get('env');

global.__root = __dirname;

var log = debug('flexsites:boot');
log.log = console.log.bind(console);
var err = debug('flexsites:boot:error');

export let app = express();

app.use(cors({ origin: true }));

// Redirect Apex domains to www
app.use(wwwRedirect());

app.use(json({ extended: true }));
app.use(hostInjector(app));

// Static Proxy
app.use(staticProxy(['/xprmntl/xpr-toggle.js']));

// Stormpath Config
app.use(stormpathInit(app));

// Inject current requests site
app.use(siteInjector(app));

export default swaggerDocs(DOCS_DIR)
  .then(api => {

    // Health Check
    app.get('/ping', (req, res) => res.send({ pong: true }));

    // XPRMNTL
    // app.use(featureClient.express, featureClient.toggle);

    // Check that they're in the right group
    app.use((req, res, next) => {
      if (req.flex.site.host !== 'admin.flexsites.io') return next();
      stormpath.groupsRequired(['Site Owner', 'Admin'], false)(req, res, next);
    });

    // API
    app.use(swaggerize({
      api,
      docspath: SWAGGER_URI,
      handlers: ROUTES_DIR,
    }));

    app.use('/api/:version', mongoose({
      url: process.env.MONGOLAB_URI,
      dir: path.join(__dirname, 'models'),
    }));

    // Page Render
    app.get('/:resource?/:id?', pageRender(app));

    app.use((err, req, res, next) => {
      console.error(err.message);
      console.error(err.stack);
      res.status(err.status || 500).send(err.message || 'Server error.');
    });

    app.listen(PORT, () => {
      let sites = 'all FlexSites';
      if (process.env.OVERRIDE_HOST) sites = `site: "${process.env.OVERRIDE_HOST}"`;
      log(`Environment: ${ENV}`);
      log(`Listening on port ${PORT}`);
      log(`Serving ${sites}`);
    });
  })
  .catch(ex => {
    err('Startup failed', ex.message, ex.status, ex.stack);
    throw new Error(ex);
  });
