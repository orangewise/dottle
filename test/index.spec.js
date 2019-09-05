'use strict';

import test from 'ava';
import { read } from '..';

const fixtures = {
    basic: JSON.stringify(require('./fixtures/basic')),
    parallel: JSON.stringify(require('./fixtures/parallel'))
};

test('basic', async t => {
    const expected = [
        'digraph { node [shape=record]; a -> b; b -> c; c -> d; }'
    ];
    t.plan(expected.length);
    let i = 0;
    for await (const result of read(fixtures.basic)) {
        t.deepEqual(result, expected[i++]);
    }
});

test.skip('parallel', async t => {
    const expected = [
`digraph {
    compound=true;
    subgraph cluster_b1 {
        b1a -> b1b;
    }
    subgraph cluster_b2 {
        b2a -> b2b;
    }
    a -> b;
    b -> b1a [lhead=cluster_b1];
    b -> b2a [lhead=cluster_b2];
    b1b -> c [ltail=cluster_b1];
    b2b -> c [ltail=cluster_b2];
}`
    ];
    t.plan(expected.length);
    let i = 0;
    for await (const result of read(fixtures.parallel)) {
        t.deepEqual(result, expected[i++]);
    }
});
