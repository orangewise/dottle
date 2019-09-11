'use strict';

const { pipe, join } = require('./util');
const { Digraph, Subgraph, Edge } = require('./dots');

const walk = (StartAt, States, EndAt) => {

    EndAt = EndAt == null
        ? 'end'
        : EndAt;

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
                    ...walk(clause.Next, States, false)
                ]
                : acc;
        }, []);
        output = [
            ...output,
            ...clauses
        ];
    }

    if (Type === 'Parallel') {
        let subgraph = Subgraph(StartAt, current.Branches.map(b => walk(b.StartAt, withStart(b.StartAt, b.States, StartAt), Next)));
        output = [
            ...output,
            ...subgraph
        ];
    }

    if (Next) {
        let edge = [];
        if (next.Type === 'Parallel') {
            edge = next.Branches.map(b => Edge(StartAt, b.StartAt));
        } else {
            edge = [ Edge(StartAt, Next) ];
        }
        output = [
            ...output,
            ...edge,
            ...walk(Next, States)
        ];
    }

    if (EndAt) output.push(Edge(StartAt, EndAt));

    return output;
};

const withStart = (StartAt, States, start = 'start') => ({ [start]: { Next: StartAt }, ...States });
const Emit = ({ StartAt, States }) => walk('start', withStart(StartAt, States));
const emit = pipe(Emit, Digraph, join(' '));

function Emitter(opts) {
    // factory so we can eventually take in custom styles, etc.
    return { emit };
}

module.exports = {
    Emitter
};
