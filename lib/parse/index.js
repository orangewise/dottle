'use strict';

const { pipe, join } = require('../util');
const nodes = require('./nodes');

function fork(States, StartAt, exitTo) {
    const { Type, Choices, Catch } = States[StartAt];
    const clauses = Type === 'Choice'
        ? Choices
        : Catch
            ? Catch
            : [];
    return clauses.map(clause => [
        nodes.edge(StartAt, clause.Next),
        ...walk(States, clause.Next, exitTo)
    ]);
}

function walk(States, StartAt, exitTo) {
    const next = States[StartAt].Next || States[StartAt].Default;
    if (next) {
        if (States[next].Type === 'Parallel') {
            const afterParallel = States[next].Next;
            const edges = States[next].Branches
                .map(b => branch(b, StartAt, afterParallel || exitTo));
            return [
                ...fork(States, StartAt, exitTo),
                nodes.subgraph(next, edges),
                ...walk(States, afterParallel, exitTo)
            ];
        }
        return [
            ...fork(States, StartAt, exitTo),
            nodes.edge(StartAt, next),
            ...walk(States, next, exitTo)
        ];
    }
    return [
        ...fork(States, StartAt, exitTo),
        nodes.edge(StartAt, exitTo)
    ];
}

function branch(machine, enterFrom = 'start', exitTo = 'end') {
    const { StartAt, States } = machine;
    const initialStates = States[enterFrom] == null
        ? { ...States, [enterFrom]: { Next: StartAt } }
        : States;
    return walk(initialStates, enterFrom, exitTo);
}

module.exports = branch;
