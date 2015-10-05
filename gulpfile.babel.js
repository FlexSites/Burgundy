import gulp from 'gulp';
import inquirer from 'inquirer';
import Promise from 'bluebird';
import glob from 'glob';
import nodemon from 'nodemon';
import path, { basename } from 'path';

function getHostname() {

  var choices = glob.sync(path.resolve(__dirname, '../sites/*'))
    .filter(dir => dir.charAt(0) !== '.')
    .map(basename);

  choices.unshift({
    name: 'All (requires /etc/hosts and proxy)',
    value: 'ALL'
  });

  return Promise.fromNode(cb => {
    inquirer.prompt([
      {
        type: 'list',
        name: 'site',
        message: 'Enter hostname',
        choices
      }
    ], results => cb(null, results));
  });
}

function startServer(site) {

  nodemon({
    script: 'index.js',
    ext: 'js',
    env: {
      OVERRIDE_HOST: site
    }
  });

  nodemon.on('start', function() {
    console.log('App has started');
  })
  .on('quit', function() {
    console.log('App has quit');
  })
  .on('restart', function(files) {
    console.log('App restarted due to: ', files);
  });
}

gulp.task('site', function(done) {
  getHostname()
    .then(({ site }) => {
      startServer(site);
      done();
    });
});
