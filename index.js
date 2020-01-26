#!/usr/bin/env node
'use strict';

require('array-flat-polyfill');

const {
    read,
    readToStream,
    readAll,
    readOne
} = module.exports = require('./lib/reader');

require('streamface').wrap({ readToStream, readAll, module });
