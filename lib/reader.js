'use strict';

const { EOL } = require('os');
const streamify = require('async-stream-generator');
const {
    digraph:digraphStyles,
    subgraph:subgraphStyles
} = require('./styles');

const {
    linebreak,
    stringify,
    pipe,
    intersperse,
    partition
} = require('./util');

const emitDigraph = body => `digraph { ${digraphStyles} ${body} }`;
const emitSubgraph = (name, body) => `subgraph ${name ? `cluster_${name} ` : ''}{ ${subgraphStyles} ${body} }`;
const emitEdge = (a, b) => `${a} -> ${b};`;
const Edge = arr => (a, b) => arr.push(emitEdge(a, b));
const Subgraph = arr => (name, body) => arr.push(emitSubgraph(name, body));
const getNext = c => c.Next;
const getNextCursor = (States, Next) => States[Next];

function getTail({ StartAt, States }) {
    let Next;
    let curr = StartAt;
    let cursor = States[StartAt];
    do{
        Next = getNext(cursor);
        cursor = getNextCursor(States, Next);
        curr = Next;
        continue;
    } while (cursor.Next);
    return curr;
}

const emitDots = root => ({ StartAt, States }) => {
    let output = []; 
    const edge = Edge(output);
    const subgraph = Subgraph(output);

    if (root) edge('start', StartAt);

    let curr = StartAt;
    let cursor = States[curr];

    while (cursor) {
        let Next = getNext(cursor);
        let nextCursor = getNextCursor(States, Next);

        if (cursor.Next) {
            if (nextCursor.Type === 'Parallel') {
                subgraph(Next, nextCursor.Branches.map(emitDots()).join(' '));
                nextCursor.Branches.forEach(b => edge(curr, b.StartAt));
                curr = cursor.Next;
                cursor = States[curr];
                nextCursor.Branches.forEach(b => edge(getTail(b), getNext(cursor)));
            } else {
                edge(curr, cursor.Next);
            }
            curr = cursor.Next;
            cursor = States[curr];
            continue;
        }

        break;
    }

    if (root) edge(curr, 'end');

    return output.join(' ');
}

const emit = pipe(emitDots(true), emitDigraph);

function Compiler(opts) {

    async function* compile(strings) {
        for await (const string of strings) {
            const machine = JSON.parse(string);
            yield emit(machine);
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
