'use strict';

exports.digraph = [
    'layout=dot;',
    'rankdir=TB;',
    'ratio=fill;',
    'splines=curved;',
    'edge [arrowsize=0.75 color="#333333"];',
    'node [shape=rect color="#aaaaaa" style="dashed,rounded"];',
    'start [shape=circle fillcolor="#ffda75" style="dashed,filled"];',
    'end [shape=circle fillcolor="#ffda75" style="dashed,filled"];'
].join(' ');

exports.subgraph = [
    'color=grey;',
    'style="dashed,rounded";'
].join(' ');
