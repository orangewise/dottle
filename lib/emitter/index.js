'use strict';

const { pipe, join } = require('../util');
const { digraph, subgraph, edge } = require('./emitters');
const { EOL } = require('os');

function GenSym() {
    const names = {};
    let counter = 0;
    return name => names[name] || (names[name] = `node${counter++}`);
}

function Emitter(opts) {
    const genSym = GenSym();

    function build(dot) {
        if (Array.isArray(dot)) return dot.map(build);
        if (dot.type === 'edge') return edge(dot.points, dot.points.map(genSym));
        if (dot.type === 'subgraph') return subgraph(genSym(dot.name), dot.edges.map(build));
    }

    const emit = pipe(build, digraph, join(' '));

    return {
        emit
    };
}

module.exports = Emitter;
