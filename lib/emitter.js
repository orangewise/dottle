'use strict';

const {
    digraph:digraphStyles,
    subgraph:subgraphStyles
} = require('./styles');

const { pipe } = require('./util');

const emitDigraph = body =>
    `digraph { ${digraphStyles} ${body} }`;

const emitSubgraph = (name, body) =>
    `subgraph cluster_${name} { ${subgraphStyles} ${body} }`;

const emitEdge = (a, b) =>
    `${a} -> ${b};`;

const Edge = arr =>
    (a, b) =>
        arr.push(emitEdge(a, b));

const Subgraph = arr =>
    (name, body) =>
        arr.push(emitSubgraph(name, body));

const getNextName = c =>
    c.Next;

const getNextCursor = (States, Next) =>
    States[Next];

function getTail({ StartAt, States }) {
    let Next;
    let curr = StartAt;
    let cursor = States[StartAt];

    do {
        Next = getNextName(cursor);
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
        let Next = getNextName(cursor);
        let nextCursor = getNextCursor(States, Next);

        if (cursor.Next) {
            if (nextCursor.Type === 'Parallel') {

                // emit subgraph
                subgraph(Next, nextCursor.Branches.map(emitDots()).join(' '));

                // connect current to subgraph
                nextCursor.Branches.forEach(b => edge(curr, b.StartAt));

                // move to next
                curr = Next;
                cursor = nextCursor;

                // connect subgraph to next
                nextCursor.Branches.forEach(b => edge(getTail(b), getNextName(cursor)));

            } else {
                edge(curr, cursor.Next);
            }

            // move to next
            curr = getNextName(cursor);
            cursor = getNextCursor(States, curr);

            continue;
        }

        break;
    }

    if (root) edge(curr, 'end');

    return output.join(' ');
}

const emit = pipe(emitDots(true), emitDigraph);

function Emitter(opts) {
    // factory here for the future ... we'll need it soon.
    return { emit };
}

module.exports = {
    Emitter
};
