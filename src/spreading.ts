import { Address } from "./interface-declarations";

export interface Employee {
  name: string;
  age: number;
  address: Address;
  updatedAt?: number;
}

export type PatchEmployee = Partial<Employee>;

const anEmployee: Employee = {
  name: "Benny",
  age: 48,
  address: {
    street: "Götavägen",
    number: "12",
  },
};

const employeeWithUpdatedName: Employee = {
  ...anEmployee,
  name: "Bönny",
};

const employeeWithUpdatedAddress: Employee = {
  ...anEmployee, // <-- Cannot be removed, will break contract
  address: {
    ...anEmployee.address,
    number: "14",
  },
};

/**
 * Multi spreading
 */
const updateEmployee = (employeeId: string, updates: PatchEmployee) => {
  const existing: Employee = getFromDatabase(employeeId);
  const updated: Employee = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };
};
