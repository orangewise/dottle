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
        'digraph { node [shape=record]; a -> b; subgraph b { b1a -> b1b; b2a -> b2b; } b -> c; }'
    ];
    t.plan(expected.length);
    let i = 0;
    for await (const result of read(fixtures.parallel)) {
        t.deepEqual(result, expected[i++]);
    }
});
