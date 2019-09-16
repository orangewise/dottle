'use strict';

const { pipe, join, log } = require('../util');
const nodes = require('./nodes');

function walk(States, StartAt, ExitTo) {
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
                    nodes.edge(StartAt, ExitTo)
                ];
            }
            return [
                ...output,
                ...walk(States, current.Next, ExitTo)
            ];
        }
        if (current.Next) {
            let next = States[current.Next];
            if (next.Type === 'Parallel') {
                const edges = next.Branches.map(Branch => branch(Branch, StartAt, next.Next));
                return [
                    {
                        type: 'subgraph',
                        name: current.Next,
                        edges: edges.map(s => s.slice(0, -1))
                    },
                    ...edges.map(s => s.slice(-1)[0]),
                    nodes.edge(next.Next, ExitTo)
                ];
            }
            return [
                nodes.edge(StartAt, current.Next),
                ...walk(States, current.Next, ExitTo)
            ];
        }
        if (current.End) {
            return [
                nodes.edge(StartAt, ExitTo)
            ];
        }
    } else {
        return [];
    }
}

function branch(machine, EnterFrom = 'start', ExitTo = 'end') {
    const { StartAt, States } = machine;
    return [
        nodes.edge(EnterFrom, StartAt),
        ...walk(States, StartAt, ExitTo)
    ];
}

function Parser(opts) {
    return {
        parse: branch
    };
}

module.exports = {
    Parser
};
