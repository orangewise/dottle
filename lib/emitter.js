'use strict';

const { pipe, join } = require('./util');
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

function Walk(StartAt, States) {
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

const Emit = ({ root = false } = {}) => ({ StartAt, States }) => {
    let output = []; 
    let curr = StartAt;
    let cursor = States[curr];

    while (cursor) {
        let Next = getNextName(cursor);
        let nextCursor = getNextCursor(States, Next);

        if (cursor.Catch) {
            output = [ ...output, ...cursor.Catch.map(c => [
                Edge(curr, c.Next),
                ...Walk(c.Next, States)
            ]) ];
        }

        if (cursor.Next) {

            if (nextCursor.Type === 'Parallel') {

                // emit subgraph
                output = [ ...output, ...Subgraph(Next, nextCursor.Branches.map(Emit())) ];

                // connect current to subgraph
                output = [ ...output, ...nextCursor.Branches.map(b => Edge(curr, b.StartAt)) ];

                // move to next
                curr = Next;
                cursor = nextCursor;

                // connect subgraph to next
                output = [ ...output, ...nextCursor.Branches.map(b => Edge(getTail(b), getNextName(cursor))) ];

            } else {
                output = [ ...output, Edge(curr, cursor.Next) ];
            }

            // move to next
            curr = getNextName(cursor);
            cursor = getNextCursor(States, curr);

            continue;
        }

        break;
    }

    if (root) output = [ Edge('start', StartAt), ...output, Edge(curr, 'end') ];

    return output;
}

const emit = pipe(Emit({ root: true }), Digraph, join(' '));

function Emitter(opts) {
    // factory so we can eventually take in custom styles, etc.
    return { emit };
}

module.exports = {
    Emitter
};
