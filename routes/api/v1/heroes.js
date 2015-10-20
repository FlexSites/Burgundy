import { set } from 'object-path';
import getModels, { list } from '../../../lib/db';

export default {
  get: (req, res, next) => {
    set(req, 'query.filter.include.media', true);
    getModels('event')
      .then(Event => list(Event, req))
      .then(parseHeroes)
      .then(res.send.bind(res))
      .catch(next);
  },
}

function parseHeroes(data) {
  return data
    .filter(data => !!data.media)
    .reduce((prev, curr) => {
      var hero = curr.media.find(medium => medium.type === 'hero');
      if (hero) prev.push(Object.assign({ link: `/events/${curr.id}` }, hero.toObject()));
      return prev;
    }, []);

}
