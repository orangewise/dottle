'use strict';

const { pipe, join } = require('../util');
const nodes = require('./nodes');

function Parser(opts) {

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

    let counter = 0;
    function walk(States, StartAt, exitTo) {
        if (!StartAt) return [];

        const current = States[StartAt];

        if (visited.has(current)) return [];
        let next;
        if (current) {
            visited.add(current);
            next = current.Next || current.Default;
        }
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
            ? { ...States, [enterFrom]: { Next: StartAt }, [exitTo]: { End: true } }
            : States;

        return walk(initialStates, enterFrom, exitTo);
    }

    return {
        parse
    };
}

module.exports = Parser;
