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


function* _intersperse(arr, delim) {
    let first = true;
    for (const el of arr) {
        if (!first) yield delim;
        first = false;
        yield el;
    }
}

function* _partition(arr, count) {
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

const intersperse = (arr, delim) => [ ..._intersperse(arr, delim) ];
const partition = (arr, count = 2) => [ ..._partition(arr, count) ];
const pipe = (h, ...t) => (...a) => t.reduce((v, f) => f(v), h(...a));
const join = delim => arr => [ arr ].flat(Infinity).join(delim);
const partial = (fn, ...args) => (...a) => fn(...args, ...a);
const partialr = (fn, ...args) => (...a) => fn(...a, ...args);
const ary = (fn, c) => (...a) => fn(...(a.slice(0, c)));
const unary = partialr(ary, 1);

module.exports = {
    linebreak,
    tap,
    filterNilKeys,
    stringify,
    pipe,
    intersperse,
    partition,
    join,
    partial,
    partialr,
    ary,
    unary
};
