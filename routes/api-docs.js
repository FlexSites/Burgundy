export default {
  get: (req, res) => res.send(req.app.swagger.api)
}
