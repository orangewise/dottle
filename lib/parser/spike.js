'use strict';

const { pipe, join, log } = require('../util');
const nodes = require('./nodes');

function getNext(States, StartAt) {
    if (Array.isArray(StartAt)) return StartAt.map(s => getNext(States, s));
    let { Next } = States[StartAt];
    return Next;
}

function walk(States, StartAt, ExitTo) {
    let Next = getNext(States, StartAt);
    if (Next) {
        if (States[Next].Type === 'Parallel') {
            return [
                {
                    type: 'subgraph',
                    edges: States[Next].Branches.map(b => branch(b, StartAt, getNext(States, Next) || ExitTo)).flat(Infinity)
                },
                ...walk(States, getNext(States, Next), ExitTo)
            ];
        }
        return [ nodes.edge(StartAt, Next), ...walk(States, Next, ExitTo) ];
    } else {
        return [ nodes.edge(StartAt, ExitTo) ];
    }
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

const machine = {
    StartAt: 'a',
    States: {
        a: {
            Next: 'b'
        },
        b: {
            Type: 'Parallel',
            Branches: [
                {
                    StartAt: 'b1_1',
                    States: {
                        b1_1: {
                            Next: 'b1_2',
                        },
                        b1_2: {
                            Next: 'b1p'
                        },
                        b1p: {
                            Type: 'Parallel',
                            Branches: [
                                {
                                    StartAt: 'b1p_1_1',
                                    States: {
                                        b1p_1_1: {
                                            Next: 'b1p_1_2'
                                        },
                                        b1p_1_2: {
                                            Next: 'b1p_1_3'
                                        },
                                        b1p_1_3: {
                                            End: true
                                        }
                                    }
                                },
                                {
                                    StartAt: 'b1p_2_1',
                                    States: {
                                        b1p_2_1: {
                                            Next: 'b1p_2_2'
                                        },
                                        b1p_2_2: {
                                            Next: 'b1p_2_3'
                                        },
                                        b1p_2_3: {
                                            End: true
                                        }
                                    }
                                }
                            ],
                            Next: 'b1_3'
                        },
                        b1_3: {
                            Next: 'b1_4'
                        },
                        b1_4: {
                            End: true
                        }
                    }
                },
                {
                    StartAt: 'b2_1',
                    States: {
                        b2_1: {
                            Next: 'b2_2',
                        },
                        b2_2: {
                            End: true
                        }
                    }
                }
            ],
            Next: 'c'
        },
        c: {
            End: true
        }
    }
};

log(branch(machine, 'start', 'end'));
