// Create
export interface AnInterface {
  anInteger: number;
  aFloat: number; // <-- WUT?
  aBoolean: boolean;
  aString: string;
}

const logAnInterface = (data: AnInterface) => {
  console.log(JSON.stringify(data));
};

// Let's create an instance of this object
// make everything but anInteger optional

// Implicit, no errors here
const anInstance = {
  anInteger: 12,
}

logAnInterface(anInstance);

const anotherInstance: AnInterface = {
  anInteger: 123,
  aFloat: 0.5,
  aBoolean: true,
  aString: 'Hello!'
}

logAnInterface(anotherInstance);

// Direct assignment

logAnInterface({
  anInteger: 155,
  aFloat: 
})

