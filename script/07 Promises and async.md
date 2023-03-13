## Promises and async

Node.js is single threaded, so all I/O operations must be asynchronous. Awkward at first, but then it becomes very natural

file: ./src/async.ts

### (Unwanted) parallel processing

```ts
const counting = () => {
  for (let a = 0; a < 10; a += 1) {
    setTimeout(() => console.log(`Second ${a}`), 1000);
  }
};
```

`> npx ts-node ./src/async.ts`

### Introducing promises

- you will get the value... eventually
- A promise either resolves (with a valud) or reject (with an error)
- CompletableFuture in Java, almost identical concept in C# nowadays

```ts
const oneSecondPromise = () => new Promise<void>((resolve, reject) => setTimeout(() => resolve(), 1000));

oneSecondPromise().then(() => console.log('One second has gone by!'));
oneSecondPromise().then(() => oneSecondPromise().then(() => oneSecondPromise().then(() => console.log('3 seconds?!'))));
```

### Not so elegant...

```ts
const counting2 = () => {
  oneSecondPromise().then(() => {
    console.log('Second 0');
    oneSecondPromise().then(() => {
      console.log('Second 1');
      oneSecondPromise().then(() => {
        console.log('Second 2');
        oneSecondPromise().then(() => {
          console.log('Second 3');
          oneSecondPromise().then(() => {
            console.log('Second 4');
            oneSecondPromise().then(() => {
              console.log('Second 5');
              oneSecondPromise().then(() => {
                console.log('Second 6');
                oneSecondPromise().then(() => {
                  console.log('Second 7');
                  oneSecondPromise().then(() => {
                    console.log('Second 8');
                    oneSecondPromise().then(() => {
                      console.log('Second 9');
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};
```

### Recursion

```ts
const counting3 = () => {
  const logAndReschedule = (second: number) => {
    oneSecondPromise().then(() => {
      console.log(`Second ${second}`);
      if (second < 9) {
        logAndReschedule(second + 1);
      }
    });
  };
  logAndReschedule(0);
};
```

### Async... mmm, najs!

```ts
const counting4 = async () => {
  for (let second = 0; second < 10; second += 1) {
    await oneSecondPromise();
    console.log(`Second ${second}`);
  }
};
```

```ts
counting2();
```
