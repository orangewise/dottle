'use strict';

const { EOL } = require('os');

async function* linebreak(statements) {
    for await (const statement of statements) {
        yield `${statement}${EOL}`;
    }
}

async function* window(statements) {
    let output = '';
    for await (const statement of statements) {
        output += statement;
        try {
            JSON.parse(output);
            yield output;
        } catch (e) {}
    }
}

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const join = delim => arr => [ arr ].flat(Infinity).join(delim);

module.exports = {
    window,
    linebreak,
    pipe,
    join
};
