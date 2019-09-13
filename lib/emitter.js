'use strict';

const { pipe, join, partialr, unary } = require('./util');
const { Digraph, Subgraph, Edge } = require('./dots');

const getNextName = c => c.Next;
const getNextCursor = (States, Next) => States[Next] || {};

function getTail({ StartAt, States }) {
    let Next;
    let curr = StartAt;
    let cursor = States[StartAt];
    while (cursor.Next) {
        Next = getNextName(cursor);
        cursor = getNextCursor(States, Next);
        curr = Next;
    }
    return curr;
}

function walk(StartAt, States) {
    let curr = StartAt;
    let cursor = States[StartAt];
    let output = [];
    while (cursor.Next) {
        let Next = getNextName(cursor);
        output = [ ...output, Edge(curr, Next) ];
        cursor = getNextCursor(States, Next);
        curr = Next;
    }
    output = [ ...output, Edge(curr, 'end') ];
    return output;
}

const Emit = ({ StartAt, States }, root) => {
    let output = []; 
    let curr = StartAt;
    let cursor = States[curr];
    while (cursor) {
        let Next = getNextName(cursor);
        let nextCursor = getNextCursor(States, Next);

        if (cursor.Catch) {
            output = [ ...output, ...cursor.Catch.map(c => [
                Edge(curr, c.Next),
                ...walk(c.Next, States)
            ]) ];
        }

        if (cursor.Next) {
            if (nextCursor.Type === 'Parallel') {
                output = [
                    ...output,
                    ...Subgraph(Next, nextCursor.Branches.map(unary(Emit))),
                    ...nextCursor.Branches.map(b => Edge(curr, b.StartAt))
                ];
                curr = Next;
                cursor = nextCursor;
                output = [
                    ...output,
                    ...nextCursor.Branches.map(b => Edge(getTail(b), getNextName(cursor)))
                ];
            } else {
                output = [ ...output, Edge(curr, cursor.Next) ];
            }
            curr = getNextName(cursor);
            cursor = getNextCursor(States, curr);
            continue;
        }
        break;
    }
    if (root) output = [ Edge('start', StartAt), ...output, Edge(curr, 'end') ];
    return output;
}

const emit = pipe(partialr(Emit, true), Digraph, join(' '));

function Emitter(opts) {
    return { emit };
}

module.exports = {
    Emitter
};
