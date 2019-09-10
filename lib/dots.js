'use strict';

const styles = require('./styles');

const Digraph = dots => [
    'digraph {',
    styles.digraph,
    ...dots.flat(),
    '}'
];

const Subgraph = (name, dots) => [
    `subgraph cluster_${name} {`,
    styles.subgraph,
    ...dots.flat(),
    '}'
];

const Edge = (a, b) => `${a} -> ${b};`;

module.exports = {
    Digraph,
    Subgraph,
    Edge
};
