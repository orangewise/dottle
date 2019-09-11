'use strict';

const { pipe, join } = require('./util');
const { Digraph, Subgraph, Edge } = require('./dots');

const fromStart = (StartAt, States, start = 'start') =>
    ({ [start]: { Next: StartAt }, ...States });

const toEnd = b => a => Edge(a, b);

const walk = (StartAt, States, emitEnd) => {

    const current = States[StartAt] || {};

    const {
        Next,
        End,
        Type,
        Catch,
        Choices
    } = current;

    const next = States[Next] || {};

    let output = [];

    if (Catch) {
        let clauses = current.Catch.reduce((acc, clause) => {
            let edge = Edge(StartAt, clause.Next);
            return clause.Next
                ? [
                    ...acc,
                    edge,
                    ...walk(clause.Next, States, emitEnd)
                ]
                : acc;
        }, []);
        output = [
            ...output,
            ...clauses
        ];
    }

    if (Type === 'Parallel') {
        let subgraph = Subgraph(StartAt, current.Branches.map(b => walk(b.StartAt, fromStart(b.StartAt, b.States, StartAt), toEnd(Next))));
        output = [
            ...output,
            ...subgraph
        ];
    } else if (Next) {
        let edge = [];
        if (next.Type === 'Parallel') {
            edge = next.Branches.map(b => Edge(StartAt, b.StartAt));
        } else {
            edge = [ Edge(StartAt, Next) ];
        }
        output = [
            ...output,
            ...edge,
            ...walk(Next, States, emitEnd)
        ];
    }

    if (End) {
        output = [
            ...output,
            emitEnd(StartAt)
        ];
    }

    return output;
};

const Emit = ({ StartAt, States }) => walk('start', fromStart(StartAt, States), toEnd('end'));
const emit = pipe(Emit, Digraph, join(' '));

function Emitter(opts) {
    // factory so we can eventually take in custom styles, etc.
    return { emit };
}

module.exports = {
    Emitter
};
