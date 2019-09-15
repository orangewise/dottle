const { EOL } = require('os');
const { inspect } = require('util');
const log = v => console.log(inspect(v, { depth: null, colors:true }));

const styles = require('./lib/styles');

const emitDigraph = edges => [
    'digraph {',
    styles.digraph,
    ...edges.flat(),
    '}'
];

const emitSubgraph = (name, edges) => [
    `subgraph cluster_${name} {`,
    styles.subgraph,
    ...edges.flat(),
    '}'
];

const emitEdge = (a, b) => `${a} -> ${b};`;

const machine = {
    "StartAt": "a",
    "States": {
        "a": {
            "Next": "b"
        },
        "b": {
            "Type": "Parallel",
            "Branches": [
                {
                    "StartAt": "b1a",
                    "States": {
                        "b1a": {
                            "Next": "b1p"
                        },
                        "b1p": {
                            "Type": "Parallel",
                            "Branches": [
                                {
                                    "StartAt": "b1pa",
                                    "States": {
                                        "b1pa": {
                                            "Next": "b1pb"
                                        },
                                        "b1pb": {
                                            "End": true
                                        }
                                    }
                                },
                                {
                                    "StartAt": "b2pa",
                                    "States": {
                                        "b2pa": {
                                            "Next": "b2pb"
                                        },
                                        "b2pb": {
                                            "End": true
                                        }
                                    }
                                }
                            ],
                            "Next": "b1b"
                        },
                        "b1b": {
                            "End": true
                        }
                    }
                },
                {
                    "StartAt": "b2a",
                    "States": {
                        "b2a": {
                            "Next": "b2b"
                        },
                        "b2b": {
                            "End": true
                        }
                    }
                }
            ],
            "Next": "c"
        },
        "c": {
            "End": true
        }
    }
};

function edge(a, b) {
    return {
        type: 'edge',
        points: [ a, b ]
    };
}

function walk(States, StartAt, EndAt) {
    const current = States[StartAt];
    if (current) {
        if (current.Type === 'Parallel') {
            return current.Branches.map(Branch => ({
                type: 'branch',
                name: StartAt,
                edges: [
                    edge(StartAt, Branch.StartAt),
                    ...walk(Branch.States, Branch.StartAt, current.Next)
                ]
            }));
        }
        if (current.Next) return [
            edge(StartAt, current.Next),
            ...walk(States, current.Next, EndAt)
        ];
        if (current.End) return [
            edge(StartAt, EndAt)
        ];
    } else {
        return [];
    }
}

function emit(dot) {
    if (Array.isArray(dot)) return dot.map(emit);
    if (dot.type === 'edge') return emitEdge(...dot.points);
    if (dot.type === 'branch') return emitSubgraph(dot.name, dot.edges.map(emit));
}

function Emit(machine, InitialStartAt, EndAt) {
    const { StartAt, States } = machine;
    const dots = [
        edge(InitialStartAt, StartAt),
        ...walk(States, StartAt, EndAt)
    ];
    return emitDigraph(emit(dots)).join(EOL);
}

log(Emit(machine, 'start', 'end'));
