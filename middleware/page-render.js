import routeData from '../lib/render/data';
import render from '../lib/render';

export default function() {
  return function(req, res, next) {
    routeData(req)
      .then(data => render(req.flex.host, data))
      .then(res.send.bind(res))
      .catch(next);
  };
}
