'use strict';

import test from 'ava';
import { readOne } from '..';
import styles from '../lib/emitter/styles';

const fixtures = {
    basic: JSON.stringify(require('./fixtures/basic')),
    parallel: JSON.stringify(require('./fixtures/parallel')),
    catch: JSON.stringify(require('./fixtures/catch')),
    choice: JSON.stringify(require('./fixtures/choice'))
};

test('basic', async t => {

    const expected =
        `strict digraph {
            ${styles.digraph}
            "start" -> "a";
            "a" -> "b";
            "b" -> "c";
            "c" -> "d";
            "d" -> "end";

        }`.replace(/\s+/g, ' ');

    const result = await readOne(fixtures.basic);

    t.deepEqual(result, expected);
});

test('parallel', async t => {

    const expected = `strict digraph {
        ${styles.digraph}
        "start" -> "a";
        "a" -> "b1a";
        "a" -> "b2a";
        subgraph "cluster_b" {
            ${styles.subgraph}
            "b1a" -> "b1pa";
            "b1a" -> "b2pa";
            subgraph "cluster_b1p" {
                ${styles.subgraph}
                "b1pa" -> "b1pb";
                "b2pa" -> "b2pb";
            }
            "b1pb" -> "b1b";
            "b2pb" -> "b1b";
            "b2a" -> "b2b";
        }
        "b1b" -> "c";
        "b2b" -> "c";
        "c" -> "end";
    }`.replace(/\s+/g, ' ');

    const result = await readOne(fixtures.parallel);

    t.deepEqual(result, expected);
});

test('catch', async t => {

    const expected =
        `strict digraph {
            ${styles.digraph}
            "start" -> "a";
            "a" -> "b";
            "b" -> "d";
            "d" -> "end";
            "b" -> "e";
            "e" -> "end";
            "b" -> "c";
            "c" -> "end";
        }`.replace(/\s+/g, ' ');

    const result = await readOne(fixtures.catch);

    t.deepEqual(result, expected);
});

test('choice', async t => {

    const expected =
        `strict digraph {
            ${styles.digraph}
            "start" -> "a";
            "a" -> "b";
            "b" -> "d";
            "d" -> "end";
            "b" -> "e";
            "e" -> "end";
            "b" -> "c";
            "c" -> "end";
        }`.replace(/\s+/g, ' ');

    const result = await readOne(fixtures.choice);

    t.deepEqual(result, expected);
});
