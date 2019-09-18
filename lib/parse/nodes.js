'use strict';

exports.edge = (...points) => ({
    type: 'edge',
    points: points.map(p => p.replace(/[-\s]/g,''))
});

exports.subgraph = (name, edges) => ({
    type: 'subgraph',
    name: name.replace(/[-\s]/g,''),
    edges
});
