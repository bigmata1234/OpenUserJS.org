'use strict';

// Define some pseudo module globals
var isPro = require('../libs/debug').isPro;
var isDev = require('../libs/debug').isDev;
var isDbg = require('../libs/debug').isDbg;

//
var mu = require('mu2');

mu.root = __dirname + '/../views';

function renderFile(aRes, aPath, aOptions) {
  // If you need to render a file with a different content
  // type, do it directly on the response object
  if (isDev || isDbg) {
    mu.clearCache();

    aOptions.isDbg = isDbg;
    aOptions.isDev = isDev;
  }

  // Hide the Google OAuth migration reminder for logged-in users
  // that don't use Google for authentication
  if (aOptions.authedUser && aOptions.authedUser
      .strategies.indexOf('google') === -1) {
    aOptions.hideReminder = true;
  }

  aRes.set('Content-Type', 'text/html; charset=UTF-8');
  mu.compileAndRender(aPath, aOptions).pipe(aRes);
}

// Express doesn't have stream support for rendering templates
// Hack express to add support for rendering a template with Mu
exports.renderFile = function (aApp) {
  var render = aApp.response.__proto__.render;

  aApp.response.__proto__.render = function (aView, aOptions, aFn) {
    var self = this;

    if (!aFn && aApp.get('view engine') === 'html') {
      aFn = function (aPath, aOptions) {
        renderFile(self, aPath, aOptions);
      };
    }

    render.call(self, aView, aOptions, aFn);
  };

  return (function (aPath, aOptions, aFn) {
    aFn(aPath, aOptions);
  });
};
