'use strict';

exports.digraph = [
    'rankdir=TB;',
    'ratio=fill;',
    'splines=curved;',
    'edge [arrowsize=0.75 color="#333333"];',
    'node [shape=rect color="#aaaaaa" style="rounded"];',
    'start [shape=circle fillcolor="#ffda75" style="filled"];',
    'end [shape=circle fillcolor="#ffda75" style="filled"];'
].join(' ');

exports.subgraph = [
    'color=grey;',
    'style="rounded";'
].join(' ');
