interface Person {
  name: string;
}

interface PersonWithAdress {
  address?: Address;
}

interface Address {
  street: string;
  number: string;
}

interface PersonWithInlineAddress {
  name: string;
  address?: {
    street: string;
    number: string;
  };
}
