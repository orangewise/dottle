'use strict';

const { pipe, join } = require('./util');
const { Digraph, Subgraph, Edge } = require('./dots');

const getNextName = c => c.Next;
const getNextCursor = (States, Next) => States[Next] || {};

function getTail({ StartAt, States }) {
    let Next;
    let Current = StartAt;
    let cursor = States[StartAt];
    while (cursor.Next) {
        Next = getNextName(cursor);
        cursor = getNextCursor(States, Next);
        Current = Next;
    }
    return Current;
}

function Walk(name, cursor, States) {

    // current -> next
    let Current = cursor.Next;
    let output = [ Edge(name, Current) ];
    cursor = States[Current];

    // current -> catch branches

    // go to next
    while (cursor.Next) {
        let Next = getNextName(cursor);
        output = [ ...output, Edge(Current, Next) ];
        cursor = getNextCursor(States, Next);
        Current = Next;
    }
    output = [ ...output, Edge(Current, 'end') ];
    return output;
}

const Emit = ({ root = false } = {}) => ({ StartAt, States }) => {
    let output = []; 
    let Current = StartAt;
    let cursor = States[Current];

    while (cursor) {
        let Next = getNextName(cursor);
        let nextCursor = getNextCursor(States, Next);

        if (cursor.Catch) {
            output = [ ...output, ...cursor.Catch.map(c => Walk(Current, c, States)) ];
        }

        if (cursor.Next) {

            if (nextCursor.Type === 'Parallel') {

                // emit subgraph
                output = [ ...output, ...Subgraph(Next, nextCursor.Branches.map(Emit())) ];

                // connect current to subgraph
                output = [ ...output, ...nextCursor.Branches.map(b => Edge(Current, b.StartAt)) ];

                // move to next
                Current = Next;
                cursor = nextCursor;

                // connect subgraph to next
                output = [ ...output, ...nextCursor.Branches.map(b => Edge(getTail(b), getNextName(cursor))) ];

            } else {
                output = [ ...output, Edge(Current, cursor.Next) ];
            }

            // move to next
            Current = getNextName(cursor);
            cursor = getNextCursor(States, Current);

            continue;
        }

        break;
    }

    if (root) output = [ Edge('start', StartAt), ...output, Edge(Current, 'end') ];

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
