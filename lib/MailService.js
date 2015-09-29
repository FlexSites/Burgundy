import Promise from 'bluebird';
import assert from 'assert';
import Mailgun from 'mailgun-js';
import hogan from 'hogan.js';
import fs from 'fs';
import path from 'path';
import config from 'config';
import debug from 'debug';

let log = debug('flexsites:lib:mailservice');
let isProd = config.get('env') === 'prod';
let devEmail = config.get('devEmail');

assert(process.env.MAILGUN_API_KEY, 'Missing Mailgun API Key');

let read = Promise.promisify(fs.readFile, fs);
let mailgun = new Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'flexsites.io',
});

export function contactTemplate(contactMessage, fn) {
  return read(path.join(__dirname, 'templates/contact.html'), 'utf8')
    .then(data => {
      contactMessage.html = hogan
        .compile(data, {
          delimiters: '[[ ]]',
          disableLambda: false
        })
        .render({ contactMessage });
      return contactMessage;
    }).nodeify(fn);
}

export function send(message, fn) {
  if (!isProd) {
    log('Sending to %s since we\'re not on PROD', devEmail);
    message.to = devEmail;
  }

  return Promise.fromNode(cb => mailgun.messages().send(message, cb))
    .nodeify(fn);
}
