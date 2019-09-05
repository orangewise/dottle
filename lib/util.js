'use strict';

const { EOL } = require('os');

async function* linebreak(statements) {
    for await (const statement of statements) {
        yield `${statement}${EOL}`;
    }
}

async function* stringify(statements) {
    for await (const statement of statements) {
        yield JSON.stringify(statement);
    }
}

async function* tap(chunks) {
    for await (const chunk of chunks) {
        console.log(EOL, require('util').inspect(chunk, { depth: null, colors: true }), EOL);
        yield chunk;
    }
}

function filterNilKeys(obj) {
    return Object.entries(obj).reduce((acc, [ key, value ]) => {
        if (value != null) acc[key] = value;
        return acc;
    }, {});
}

function pipe(...fns) {
    return x => fns.reduce((v, f) => f(v), x);
}

module.exports = {
    linebreak,
    tap,
    filterNilKeys,
    stringify,
    pipe
};
