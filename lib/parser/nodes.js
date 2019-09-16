'use strict';

exports.edge = (a, b) => ({
    type: 'edge',
    points: [ a, b ]
});

exports.subgraph = (name, edges) => ({
    type: 'subgraph',
    name,
    edges
});
