const { EOL } = require('os');
const { inspect } = require('util');
const log = v => console.log(inspect(v, { depth: null, colors:true }));

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

function walk(States, StartAt, EndAt) {
    const current = States[StartAt];
    if (current) {
        if (current.Type === 'Parallel') {
            return current.Branches.map(Branch => ({
                type: 'branch',
                edges: [
                    {
                        type: 'edge',
                        points: [ StartAt, Branch.StartAt ]
                    },
                    ...walk(Branch, Branch.StartAt, current.Next)
                ]
            }));
        }
        if (current.Next) return [
            {
                type: 'edge',
                points: [ StartAt, current.Next ]
            },
            ...walk(States, current.Next, EndAt)
        ];
        if (current.End) return [
            {
                type: 'edge',
                points: [ StartAt, EndAt ]
            }
        ];
    } else {
        return [];
    }
}

function emit(dots) {
    return dots;
    return `${dots.map(edge =>
        edge.join('->')
    ).join(`;${EOL}`)};${EOL}`;
}

function branch(machine, InitialStartAt, EndAt) {
    const { StartAt, States } = machine;
    const dots = [
        {
            type: 'edge',
            points: [ InitialStartAt, StartAt ]
        },
        ...walk(States, StartAt, EndAt)
    ];
    return emit(dots);
}

log(branch(machine, 'start', 'end'));
