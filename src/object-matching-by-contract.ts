// If the contract is the same, it can be used interchangeably

interface Person {
  name: string;
}

interface Pet {
  name: string;
}

const a: Person = { name: "Bob" };
const b: Pet = a;
