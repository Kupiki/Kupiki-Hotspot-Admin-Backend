'use strict';
/*eslint-env node*/
var testsContext;

require('babel-polyfill');

testsContext = require.context('./src', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
