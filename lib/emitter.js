'use strict';

const { pipe } = require('./util');

const {
    digraph:digraphStyles,
    subgraph:subgraphStyles
} = require('./styles');

const Digraph = dots => [
    'digraph {',
    digraphStyles,
    ...dots.flat(),
    '}'
];

const Subgraph = (name, dots) => [
    `subgraph cluster_${name} {`,
    subgraphStyles,
    ...dots.flat(),
    '}'
];

const Edge = (a, b) =>
    `${a} -> ${b};`;

const getNextName = c =>
    c.Next;

const getNextCursor = (States, Next) =>
    States[Next] || {};

// O-( :: big O is sad
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
    let Next;
    let curr = StartAt;
    let cursor = States[StartAt];
    let output = [];
    while (cursor.Next) {
        Next = getNextName(cursor);
        output = [ ...output, Edge(curr, Next) ];
        cursor = getNextCursor(States, Next);
        curr = Next;
    }
    output = [ ...output, Edge(curr, 'end') ];
    return output;
}

const Dots = ({ root = false } = {}) => ({ StartAt, States }) => {
    let output = []; 
    let curr = StartAt;
    let cursor = States[curr];

    while (cursor) {
        let Next = getNextName(cursor);
        let nextCursor = getNextCursor(States, Next);

        if (cursor.Next) {

            if (cursor.Catch) {
                output = [ ...output, ...cursor.Catch.map(c => [
                    Edge(curr, c.Next),
                    ...Walk(c.Next, States)
                ]) ];
            }

            if (nextCursor.Type === 'Parallel') {

                // emit subgraph
                output = [ ...output, ...Subgraph(Next, nextCursor.Branches.map(Dots())) ];

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

const join = delim => arr => arr.join(delim);

const emit = pipe(Dots({ root: true }), Digraph, join(' '));

function Emitter(opts) {
    return { emit };
}

module.exports = {
    Emitter
};
