/**
 * Redirect all requests with a host beginning with www => non-www version
 */
module.exports = function(){
  var isNotApex = /^.*\..*\..*$/;
  return function(req,res,next){
    let host = req.hostname;
    if (host === 'localhost' || isNotApex.test(host)) return next();
    res.redirect(301, req.protocol + '://www.' + host + req.url);
  };
};
