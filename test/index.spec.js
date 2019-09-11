'use strict';

import test from 'ava';
import { readOne } from '..';
import styles from '../lib/styles';

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
            a -> b1a;
            a -> b2a;
            subgraph cluster_b {
                ${styles.subgraph}
                b1a -> b1pa;
                b1a -> b2pa;
                subgraph cluster_b1p {
                    ${styles.subgraph}
                    b1pa -> b1pb;
                    b2pa -> b2pb;
                }
                b1pb -> b1b;
                b2pb -> b1b;
                b2a -> b2b;
            }
            b1b -> c;
            b2b -> c;
            c -> end;
        }`.replace(/\s+/g, ' ');
    //const expected =
        //`digraph {
            //${styles.digraph}
            //start -> a;
            //b -> b1a;
            //b -> b2a;
            //subgraph cluster_b {
                //${styles.subgraph}
                //subgraph cluster_b1p {
                    //${styles.subgraph}
                    //b1pa -> b1pb;
                    //b1pb -> end;
                    //b2pa -> b2pb;
                    //b2pb -> end;
                //}
                //b1p -> b1pa;
                //b1p -> b2pa;
                //b2a -> b2b;
                //b2b -> end;
            //}
        //}`.replace(/\s+/g, ' ');
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
            d -> e;
            e -> end;
            b -> e;
            b -> c;
            c -> end;
            e -> end;
        }`.replace(/\s+/g, ' ');

    const result = await readOne(fixtures.catch);

    t.deepEqual(result, expected);
});
