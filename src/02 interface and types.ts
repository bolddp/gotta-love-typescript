// Interfaces

export interface Person {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface Address {
  street: string;
  number: string;
}

export interface PersonWithAddress extends Person {
  // Not everyone has an address...
  address?: Address;
}

// Often turns out that a separate Address interface is preferred...
export interface PersonWithInlineAddress {
  name: string;
  address?: {
    street: string;
    number: string;
  };
}

// Types

export type PatchPersonWithAddress = Partial<PersonWithAddress>;
