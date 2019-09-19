'use strict';

const { EOL } = require('os');

async function* linebreak(statements) {
    for await (const statement of statements) {
        yield `${statement}${EOL}`;
    }
}

function pipe(...fns) {
    return x => fns.reduce((v, f) => f(v), x);
}

const join = delim => arr => [ arr ].flat(Infinity).join(delim);

module.exports = {
    linebreak,
    pipe,
    join
};
