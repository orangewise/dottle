'use strict';

const { EOL } = require('os');
const streamify = require('async-stream-generator');

const {
    linebreak,
    stringify,
    pipe,
    intersperse,
    partition
} = require('./util');

const digraph = (body, name) =>
   `digraph ${name ? `${name} ` : ''}{ node [shape=record]; ${body}; }`;

const subgraph = (body, name) =>
   `subgraph ${name ? `${name} ` : ''}{ ${body}; }`;

function dots(machine, delim = ' -> ') {
    let {
        StartAt:current,
        States = {}
    } = machine;
    const seq = [];
    do {
        seq.push(current);
        let cursor = States[current];
        if (!cursor) break;
        if (cursor.Type === 'Parallel') {
            seq.push(`{ ${cursor.Branches.reduce((a, b) => {
                return `${a.length ? `${a} ` : '{ '}${dots(b, ', ')} }`;
            }, '')} }`);
        }
        current = cursor.Next || false;
    } while (current);
    const doubled = [
        seq[0],
        ...seq.slice(1, -1).reduce((a, v) => [ ...a, v, v ], []),
        seq[seq.length - 1]
    ];
    const partitioned = [ ...partition(doubled) ];
    return partitioned.map(v => v.join(delim)).join('; ');
}

const emit = pipe(dots, digraph);

function Compiler(opts) {

    async function* compile(strings) {
        for await (const string of strings) {
            const machine = JSON.parse(string);
            const output = emit(machine);
            yield output;
        }
    }

    return { compile };
}

function Reader(opts) {
    const { compile } = Compiler(opts);
    function read(data) {
        const input = data[Symbol.asyncIterator]
            ? data
            : Array.isArray(data)
                ? data.values()
                : [ data ].values();
        return compile(linebreak(input));
    }
    return { read };
}

/**
 * Accepts a ReadableStream, an AsyncIterator, an array or a string and returns an AsyncIterator.
 *
 * @function read
 * @param {ReadableStream|AsyncIterator|Array|string} input Raw input data
 * @param {Object} [options] Optional options object.
 * @returns {AsyncIterator} Returns an AsyncIterator which yields Promises which resolve to parsed data.
 * @example
 *
 * for await (const result of read('{ "StartAt": "a", "States": { "a": { "Type": "Pass", "Next": "b" }, "b": { "Type": "Pass", "End": true } } }')) {
 *     console.log(result);
 * }
 * // => digraph { a -> b }
 *
 */
function read(data = '', opts) {
    const { read } = Reader(opts);
    return read(data);
}

/**
 * Accepts a ReadableStream, an array or a string and returns a WritableStream. Stream output will be utf-8 text. Stream values will be delimited by a system-native newline escape character.
 *
 * @function readToStream
 * @param {ReadableStream|AsyncIterator|Array|string} input Raw input data
 * @param {Object} [options] Optional options object.
 * @returns {WritableStream} Returns a WritableStream Stream output will be utf-8 text. Stream values will be delimited by a system-native newline escape character.
 * @example
 *
 * readToStream('{ "StartAt": "a", "States": { "a": { "Type": "Pass", "Next": "b" }, "b": { "Type": "Pass", "End": true } } }').pipe(process.stdout);
 * // => digraph { a -> b }
 *
 */
function readToStream(data = '', opts) {
    return pipe(Reader(opts).read, stringify, linebreak, streamify)(data);
}

/**
 * Accepts a ReadableStream, an AsyncIterator, an array or a string and returns a Promise which resolves to the first value of the stream.
 *
 * @function readOne
 * @param {ReadableStream|AsyncIterator|Array|string} input Raw input data
 * @param {Object} [options] Optional options object.
 * @returns {Promise} Returns a Promise which resolves to the first value of the stream.
 * @example
 *
 * console.log(await readOne('{ "StartAt": "a", "States": { "a": { "Type": "Pass", "Next": "b" }, "b": { "Type": "Pass", "End": true } } }'));
 * // => digraph { a -> b }
 *
 */
async function readOne(data = '', opts) {
    const { value } = await read(data, opts).next();
    return value;
}

/**
 * Accepts a ReadableStream, an AsyncIterator, an array or a string and returns a Promise which resolves to an array of all values.
 *
 * Note: If a stream or iterator is passed to `readAll` and it does not complete, the Promise returned by this function will never resolve.
 *
 * @function readAll
 * @param {ReadableStream|AsyncIterator|Array|string} input Raw input data
 * @param {Object} [options] Optional options object.
 * @returns {Promise} Returns a Promise which resolves to an array of all values.
 * @example
 *
 * console.log(await readAll('{ "StartAt": "a", "States": { "a": { "Type": "Pass", "Next": "b" }, "b": { "Type": "Pass", "End": true } } }'));
 * // => digraph { a -> b }
 *
 */
async function readAll(data = '', opts) {
    const results = [];
    for await (const result of read(data, opts)) {
        results.push(result);
    }
    return results;
}

module.exports = {
    Reader,
    read,
    readToStream,
    readOne,
    readAll
};
