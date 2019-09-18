'use strict';

const { pipe, join } = require('../util');
const nodes = require('./nodes');
const visited = new WeakSet();

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

const ReduceBranches = (States, enterFrom, exitTo) =>
    ({ head = [], body = [], tail = [] }, branch) => {
        const [ start, ...middle ] = parse(branch, enterFrom, exitTo);
        const end = middle.pop();
        return {
            head: [ ...head, start ],
            body: [ ...body, ...middle ],
            tail: [ ...tail, end ]
        };
    };

function walk(States, StartAt, exitTo) {
    const current = States[StartAt];
    if (visited.has(current)) return [];
    visited.add(current);
    const next = States[StartAt].Next || States[StartAt].Default;
    if (next) {
        if (States[next].Type === 'Parallel') {
            const { head, body, tail } = States[next].Branches
                .reduce(ReduceBranches(States, StartAt, States[next].Next || exitTo), {});
            return [
                ...fork(States, StartAt, exitTo),
                ...head,
                nodes.subgraph(next, body),
                ...tail,
                ...walk(States, States[next].Next, exitTo)
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

function parse(machine, enterFrom = 'start', exitTo = 'end') {
    const { StartAt, States } = machine;
    const initialStates = States[enterFrom] == null
        ? { ...States, [enterFrom]: { Next: StartAt } }
        : States;
    return walk(initialStates, enterFrom, exitTo);
}

module.exports = parse;
