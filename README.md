## Typed try/catch

Tries to mimick behaviour of other languages (like PHP), which allow you to have multiple catch blocks with different error types.

Basic usage is as follows:

```ts
// an example implementation could be as follows
import { Try } from '@randock/try';

await Try.to<void>(async () => {
  // do something that might throw an exception
})
  .catch(SpecificError, error => {
  // if "SpecificError" is thrown, this catch block is called
})
  .catch(AnotherSpecificError, async error => {
  // if "AnotherSpecificError" is thrown, this catch block is called
})
  .catch([FirstError, SecondError], async error => {
  // if "FirstError" or "SecondError" is thrown, this catch block is called
})
  .catch(async error => {
  // This is the catch-all, if none other matched.
  // If the original thrown thing is not an instance of Error, 
  // it will be converted to an instance of ObjectError.
})
  .finally<void>(async () => {
    // finally
});
```
If you don't use the "finally" block, you need to call .run(); 
```ts
await Try.to<void>(async () => {
}).catch(async error => {})
  .run();
```
