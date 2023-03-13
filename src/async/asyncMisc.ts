// Node.js has one thread, all long running operations need to be asynchronous
// No blocking calls!!

const unprovokedPausing = () => {
  for (let a = 0; a < 10; a += 1) {
    setTimeout(() => console.log(`Second ${a}`), 1000);
  }
};

// Introducing promises: you will get the value... eventually
// A promise either resolves (with a valud) or reject (with an error)
const oneSecondPromise = () => new Promise<void>((resolve, reject) => setTimeout(() => resolve(), 1000));

const unprovokedPausing2 = () => {
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

const unprovokedPausing3 = () => {
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

const unprovokedPausing4 = async () => {
  for (let second = 0; second < 10; second += 1) {
    await oneSecondPromise();
    console.log(`Second ${second}`);
  }
};

unprovokedPausing2();
