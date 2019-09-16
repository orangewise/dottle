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

exports.edge = (a, b) => `${a} -> ${b};`;
