import { PersonWithAdress, PersonWithAdress } from "./interface-declarations";

interface AnObject {
  data?: string;
}

const processObject = (obj: AnObject) => {
  if (!obj.data) {
    // return;
    throw new Error("No data!");
  }
  console.log(`Uppercase data! ${obj.data.toUpperCase()}`);
};

// Optional chaining

const personWithoutAddress: PersonWithAdress = {
  name: "Daniel Persson",
};

const personWithAddess: PersonWithAdress = {
  name: "Daniel Persson",
  address: {
    street: "Ekbackavägen",
    number: "9",
  },
};

console.log(`street: ${personWithoutAddress.address?.street}`);
