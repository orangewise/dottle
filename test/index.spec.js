'use strict';

import test from 'ava';
import { read } from '..';
import styles from '../lib/styles';
const {
    digraph:digraphStyles,
    subgraph:subgraphStyles
} = styles;

const fixtures = {
    basic: JSON.stringify(require('./fixtures/basic')),
    parallel: JSON.stringify(require('./fixtures/parallel'))
};

test('basic', async t => {
    const expected = [
`digraph {

    ${digraphStyles}

    start -> a;
    a -> b;
    b -> c;
    c -> d;
    d -> end;

}`.replace(/\s\s+/g, ' ')
    ];
    t.plan(expected.length);
    let i = 0;
    for await (const result of read(fixtures.basic)) {
        t.deepEqual(result, expected[i++]);
    }
});

test('parallel', async t => {
    const expected = [
`digraph {

    ${digraphStyles}

    start -> a;

    subgraph cluster_b {

        ${subgraphStyles}

        b1a -> b1b;
        b2a -> b2b;
    }

    a -> b1a;
    a -> b2a;

    b1b -> c;
    b2b -> c;

    c -> end;

}`.replace(/\s\s+/g, ' ')
    ];
    t.plan(expected.length);
    let i = 0;
    for await (const result of read(fixtures.parallel)) {
        t.deepEqual(result, expected[i++]);
    }
});
