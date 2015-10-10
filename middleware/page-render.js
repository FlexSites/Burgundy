import Hogan from 'hogan.js';
import Promise from 'bluebird';
import apiUtil from '../lib/api-util';
import lambdas from '../lib/lambdas';

var flexDataPattern = /<!--\[flex\]>(.*?)<!\[flex\]-->/i
  , options = {
    delimiters: '[[ ]]',
    disableLambda: false,
  };

export default function(app) {
  let util = apiUtil(app);
  return function(req, res, next) {
    let promises = [
      util.getPage(req),
      util.getTemplate(req),
      util.getRouteData(req, res),
    ];

    Promise.all(promises)
      .then(([ page, template, data ]) => {
        // No extra data
        if (!flexDataPattern.test(page.content)) return [ page, template, data ];


        var flexData = page.content.match(flexDataPattern)[1];
        flexData = JSON.parse(flexData);

        return getFlexData(flexData, req, res, data)
          .then(fData => [ page, template, fData ]);
      })
      .then(([ page, layout, data ]) => {
        var include = includeTemplate.bind(this, page);

        Object.keys(lambdas).map(key => {
          if (!data[key]) data[key] = lambdas[key];
        });
        data.page = page;

        res.send(
          Hogan
            .compile(`
              [[<layout]]
              ${include('title')}
              ${include('description')}
              ${include('content')}
              [[/layout]]
            `, options)
            .render(data, { layout })
        );
      })
      .catch(next);
  };

  function getFlexData(obj, req, res, data) {
    let promises = Object.keys(obj)
        .map((prop) => util.getData(prop, obj[prop], req, res, data));
    return Promise.all(promises)
      .then(() => data);
  }
}

function includeTemplate(page, prop) {
  if (page[prop]) return `[[$${prop}]]${page[prop]}[[/${prop}]]`;
  return '';
}
