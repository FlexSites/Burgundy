

export default (events, data) => {
  data.heroes = parseHeroes(events);
  return data;
}

function parseHeroes(data) {
  if (!Array.isArray(data)) data = [data];
  return data
    .filter(data => !!data.media)
    .reduce((prev, curr) => {
      var hero = curr.media.find(medium => medium.type === 'hero');
      if (hero) prev.push(Object.assign({ link: `/events/${curr.id}` }, hero));
      return prev;
    }, []);
}
