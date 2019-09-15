'use strict';

const { pipe, join, log } = require('../util');
const { digraph, subgraph, edge } = require('./emitters');
const { EOL } = require('os');

function build(dot) {
    if (Array.isArray(dot)) return dot.map(build);
    if (dot.type === 'edge') return edge(...dot.points);
    if (dot.type === 'subgraph') return subgraph(dot.name, dot.edges.map(build));
}

function Emitter(opts) {
    const emit = pipe(build, digraph, join(' '));
    return { emit };
}

module.exports = {
    Emitter
};
