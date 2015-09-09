import newrelic from 'newrelic';

export default (req, res, next) => {
  if (req.params.resource) {
    let name = `/${req.params.resource}`;
    if (req.params.id) name += '/:id';
    newrelic.setTransactionName(name);
  }
  next();
}
