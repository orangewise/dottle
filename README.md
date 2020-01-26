# @robodo/Dottle

Drop-in replacement for [Dottle](https://www.npmjs.com/package/dottle), works on node versions below 11.

> AWS State Language
to Graphviz DOT language

# Install

```bash
npm i @robodo/dottle
```

# API

<a name="read"></a>

## read(input, [options]) ⇒ <code>AsyncIterator</code>
Accepts a ReadableStream, an AsyncIterator, an array or a string and returns an AsyncIterator.

**Kind**: global function  
**Returns**: <code>AsyncIterator</code> - Returns an AsyncIterator which yields Promises which resolve to parsed data.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>ReadableStream</code> \| <code>AsyncIterator</code> \| <code>Array</code> \| <code>string</code> | Raw input data |
| [options] | <code>Object</code> | Optional options object. |

**Example**  
```js
for await (const result of read('{ "StartAt": "a", "States": { "a": { "Type": "Pass", "Next": "b" }, "b": { "Type": "Pass", "End": true } } }')) {
    console.log(result);
}
// => digraph { a -> b }
```
<a name="readToStream"></a>

## readToStream(input, [options]) ⇒ <code>WritableStream</code>
Accepts a ReadableStream, an array or a string and returns a WritableStream. Stream output will be utf-8 text. Stream values will be delimited by a system-native newline escape character.

**Kind**: global function  
**Returns**: <code>WritableStream</code> - Returns a WritableStream Stream output will be utf-8 text. Stream values will be delimited by a system-native newline escape character.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>ReadableStream</code> \| <code>AsyncIterator</code> \| <code>Array</code> \| <code>string</code> | Raw input data |
| [options] | <code>Object</code> | Optional options object. |

**Example**  
```js
readToStream('{ "StartAt": "a", "States": { "a": { "Type": "Pass", "Next": "b" }, "b": { "Type": "Pass", "End": true } } }').pipe(process.stdout);
// => digraph { a -> b }
```
<a name="readOne"></a>

## readOne(input, [options]) ⇒ <code>Promise</code>
Accepts a ReadableStream, an AsyncIterator, an array or a string and returns a Promise which resolves to the first value of the stream.

**Kind**: global function  
**Returns**: <code>Promise</code> - Returns a Promise which resolves to the first value of the stream.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>ReadableStream</code> \| <code>AsyncIterator</code> \| <code>Array</code> \| <code>string</code> | Raw input data |
| [options] | <code>Object</code> | Optional options object. |

**Example**  
```js
console.log(await readOne('{ "StartAt": "a", "States": { "a": { "Type": "Pass", "Next": "b" }, "b": { "Type": "Pass", "End": true } } }'));
// => digraph { a -> b }
```
<a name="readAll"></a>

## readAll(input, [options]) ⇒ <code>Promise</code>
Accepts a ReadableStream, an AsyncIterator, an array or a string and returns a Promise which resolves to an array of all values.

Note: If a stream or iterator is passed to `readAll` and it does not complete, the Promise returned by this function will never resolve.

**Kind**: global function  
**Returns**: <code>Promise</code> - Returns a Promise which resolves to an array of all values.  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>ReadableStream</code> \| <code>AsyncIterator</code> \| <code>Array</code> \| <code>string</code> | Raw input data |
| [options] | <code>Object</code> | Optional options object. |

**Example**  
```js
console.log(await readAll('{ "StartAt": "a", "States": { "a": { "Type": "Pass", "Next": "b" }, "b": { "Type": "Pass", "End": true } } }'));
// => digraph { a -> b }
```
# License

MIT