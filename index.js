#!/usr/bin/env node
'use strict';

const {
    read,
    readToStream,
    readAll,
    readOne
} = module.exports = require('./lib/reader');

require('streamface').wrap({ readToStream, readAll, module });
