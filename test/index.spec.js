'use strict';

import test from 'ava';
import { read } from '..';

test.skip('works', async t => {
    const input = JSON.stringify({
        "StartAt": "a",
        "States": {
            "a": {
                "Type": "Pass",
                "Next": "b"
            },
            "b": {
                "Type": "Pass",
                "End": true
            }
        }
    });
    const expected = [
        'digraph { a -> b }'
    ];
    t.plan(expected.length);
    let i = 0;
    for await (const result of read(input)) {
        t.deepEqual(result, expected[i++]);
    }
});
