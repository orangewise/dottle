'use strict';

const streamify = require('async-stream-generator');

const {
    linebreak,
    stringify,
    pipe
} = require('./util');

function Compiler(opts) {

    async function* compile(machines) {
        for await (const machine of machines) {
            yield JSON.parse(machine);
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
    return pipe(Compiler(opts).compile, stringify, linebreak, streamify)(data);
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
