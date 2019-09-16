'use strict';

const { pipe, join, log } = require('../util');
const nodes = require('./nodes');

function getNext(States, StartAt, ExitTo) {
    if (Array.isArray(StartAt)) return StartAt.map(s => getNext(States, s));
    let { Next } = States[StartAt];
    return Next || ExitTo;
}

function walk(States, StartAt, ExitTo) {
    let Next = getNext(States, StartAt);
    if (Next) {
        if (States[Next].Type === 'Parallel') {
            const edges = States[Next].Branches
                .map(b => branch(b, StartAt, getNext(States, Next, ExitTo)))
                .flat(Infinity)
            return [
                nodes.subgraph(Next, edges),
                ...walk(States, getNext(States, Next), ExitTo)
            ];
        }
        return [
            nodes.edge(StartAt, Next),
            ...walk(States, Next, ExitTo)
        ];
    }
    return [ nodes.edge(StartAt, ExitTo) ];
}

function branch(machine, EnterFrom = 'start', ExitTo = 'end') {
    const { StartAt, States } = machine;
    return (States[EnterFrom] == null)
        ? walk({ ...States, [EnterFrom]: { Next: StartAt } }, EnterFrom, ExitTo)
        : walk(States, EnterFrom, ExitTo);
}

function Parser(opts) {
    return {
        parse: branch
    };
}

module.exports = {
    Parser
};
