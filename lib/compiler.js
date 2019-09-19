'use strict';

const { pipe } = require('./util');

const Parser = require('./parser');
const Emitter = require('./emitter');

function Compiler(opts) {
    const { parse } = Parser(opts);
    const { emit } = Emitter(opts);

    async function* compile(machines) {
        for await (const machine of machines) {
            yield pipe(JSON.parse, parse, emit)(machine);
        }
    }

    return {
        compile
    };
}

module.exports = Compiler;
