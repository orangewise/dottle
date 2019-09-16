'use strict';

const { pipe } = require('./util');

const parse = require('./parse');
const emit = require('./emit');

async function* compile(machines) {
    for await (const machine of machines) {
        yield pipe(JSON.parse, parse, emit)(machine);
    }
}

module.exports = compile;
