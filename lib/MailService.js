// MAIL SERVICE

var Mailgun = require('mailgun-js')
  , hogan = require('hogan.js')
  , fs = require('fs')
  , path = require('path')
  , mailgun = new Mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: 'flexsites.io',
  });


export default {
  contactTemplate: function(contact, fn) {
    var file = path.join(__dirname, 'contactTemplate.html');
    fs.readFile(file, 'utf8', function(err, data) {
      fn(err, hogan.compile(data, {
        delimiters: '[[ ]]',
        disableLambda: false
      }).render({ contactMessage: contact }));
    });
  },

  send: function(message, fn) {
    if (process.env.MAILGUN_API_KEY) {
      mailgun.messages().send(message, fn);
    } else {
      var msg = 'Missing Mailgun API Key for: ' + message.subject + ' to ' + message.to + ' from ' + message.from + ' message: ' + message.body;
      console.info(msg);
      fn(null, msg);
    }
  }
};
