'use strict';

const styles = require('./styles');

exports.digraph = dots => [
    'strict digraph {',
    styles.digraph,
    ...dots.flat(),
    '}'
];

exports.subgraph = (name, dots) => [
    `subgraph cluster_${name} {`,
    styles.subgraph,
    ...dots.flat(),
    '}'
];

const terminals = new Set(['start', 'end']);

// total hack for now ... need to redesign emitter to handle separate printing of node definitions
exports.edge = (labels, points) => {
    labels = labels.map((l, i) => terminals.has(l)
        ? `${points[i]} [label="${l}" shape=circle fillcolor="#ffda75" style="dashed,filled"]`
        : `${points[i]} [label="${l}"]`).join(';');
    return `${labels}; ${points.join(' -> ')};`;
};
