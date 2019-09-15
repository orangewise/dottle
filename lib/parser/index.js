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
                const edges = next.Branches.map(Branch => parse(Branch, StartAt, next.Next));
                return [
                    {
                        type: 'subgraph',
                        name: current.Next,
                        edges: edges.map(s => s.slice(0, -1))
                    },
                    ...edges.map(s => s.slice(-1)[0]),
                    nodes.edge(next.Next, EndAt)
                ];
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
