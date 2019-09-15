'use strict';

import test from 'ava';
import { readOne } from '..';
import styles from '../lib/emitter/styles';

const fixtures = {
    basic: JSON.stringify(require('./fixtures/basic')),
    parallel: JSON.stringify(require('./fixtures/parallel')),
    catch: JSON.stringify(require('./fixtures/catch'))
};

test('basic', async t => {

    const expected =
        `digraph {
            ${styles.digraph}
            start -> a;
            a -> b;
            b -> c;
            c -> d;
            d -> end;

        }`.replace(/\s+/g, ' ');

    const result = await readOne(fixtures.basic);

    t.deepEqual(result, expected);
});

test('parallel', async t => {

    const expected =
        `digraph {
            ${styles.digraph}
            start -> a;
            subgraph cluster_b {
                ${styles.subgraph}
                subgraph cluster_b1p {
                    ${styles.subgraph}
                    b1pa -> b1pb;
                    b2pa -> b2pb;
                }
                b1a -> b1pa;
                b1a -> b2pa;
                b1pb -> b1b;
                b2pb -> b1b;
                b2a -> b2b;
            }
            a -> b1a;
            a -> b2a;
            b1b -> c;
            b2b -> c;
            c -> end;
        }`.replace(/\s+/g, ' ');

    const result = await readOne(fixtures.parallel);

    t.deepEqual(result, expected);
});

test('catch', async t => {

    const expected =
        `digraph {
            ${styles.digraph}
            start -> a;
            a -> b;
            b -> d;
            d -> end;
            b -> e;
            e -> end;
            b -> c;
            c -> end;
        }`.replace(/\s+/g, ' ');

    const result = await readOne(fixtures.catch);

    t.deepEqual(result, expected);
});
