export interface Person {
  name: string;
}

export interface PersonWithAdress extends Person {
  address?: Address;
}

export interface Address {
  street: string;
  number: string;
}

export interface PersonWithInlineAddress {
  name: string;
  address?: {
    street: string;
    number: string;
  };
}
