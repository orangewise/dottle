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

function* intersperse(arr, delim) {
    let first = true;
    for (const el of arr) {
        if (!first) yield delim;
        first = false;
        yield el;
    }
}

function* partition(arr, count = 2) {
    let curr = [];
    let i = 0;
    for (const el of arr) {
        curr.push(el);
        if (++i == count) {
            yield curr;
            i = 0;
            curr = [];
        }
    }
}

const join = delim => arr => [ arr ].flat(Infinity).join(delim);

const { inspect } = require('util');
const log = (...a) => console.log(inspect(a, { depth: null, colors: true }));

module.exports = {
    linebreak,
    tap,
    filterNilKeys,
    stringify,
    pipe,
    intersperse,
    partition,
    join,
    log
};
