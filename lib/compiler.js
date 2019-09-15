'use strict';

const { pipe } = require('./util');
const { Parser } = require('./parser');
const { Emitter } = require('./emitter');

function Compiler(opts) {
    const parser = Parser(opts);
    const emitter = Emitter(opts);
    function compile(machine) {
        return pipe(parser, emitter)(machine);
    }
    return { compile };
}

module.exports = {
    Compiler
};
