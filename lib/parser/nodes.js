'use strict';

exports.edge = (...points) => ({
    type: 'edge',
    points
});

exports.subgraph = (name, edges) => ({
    type: 'subgraph',
    name, 
    edges
});
