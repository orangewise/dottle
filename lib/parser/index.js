'use strict';

const { pipe, join, log } = require('../util');
const nodes = require('./nodes');

function walk(States, StartAt, EndAt) {
    const current = States[StartAt];
    if (current) {
        if (current.Type === 'Catch') {
            let output = current.Choices.map(Choice => nodes.edge(StartAt, Choice.Next))
            if (current.Next) {
                output = [
                    ...output,
                    nodes.edge(StartAt, current.Next)
                ];
            } else if (current.End) {
                return [
                    ...output,
                    nodes.edge(StartAt, EndAt)
                ];
            }
            return [
                ...output,
                ...walk(States, current.Next, EndAt)
            ];
        }
        if (current.Next) {
            let next = States[current.Next];
            if (next.Type === 'Parallel') {
                return next.Branches.map(Branch => ({
                    type: 'subgraph',
                    name: StartAt,
                    edges: parse(Branch, StartAt, next.Next)
                })).map(s => ({ ...s, edges: [ ...s.edges, nodes.edge(next.Next, EndAt) ] }))
            }
            return [
                nodes.edge(StartAt, current.Next),
                ...walk(States, current.Next, EndAt)
            ];
        }
        if (current.End) {
            return [
                nodes.edge(StartAt, EndAt)
            ];
        }
    } else {
        return [];
    }
}

function parse(machine, InitialStartAt = 'start', EndAt = 'end') {
    const { StartAt, States } = machine;
    return [
        nodes.edge(InitialStartAt, StartAt),
        ...walk(States, StartAt, EndAt)
    ];
}

function Parser(opts) {
    return { parse };
}

module.exports = {
    Parser
};
