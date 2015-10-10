import routeData from '../lib/api-util';
import render from '../lib/render-util';

export default function() {
  return function(req, res, next) {
    routeData(req)
      .then(data => render(req.flex.host, data))
      .then(res.send.bind(res))
      .catch(next);
  };
}
