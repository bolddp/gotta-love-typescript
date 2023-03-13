import { Address } from './02 interface and types';

export interface Employee {
  id: string;
  name: string;
  age: number;
  address: Address;
  updatedAt?: number;
}

const anEmployee: Employee = {
  id: 'e01',
  name: 'Benny',
  age: 48,
  address: {
    street: 'Götavägen',
    number: '12',
  },
};

const employeeWithUpdatedName: Employee = {
  ...anEmployee,
  name: 'Bönny',
};

const employeeWithUpdatedAddress: Employee = {
  ...anEmployee, // <-- Cannot be removed, will break contract
  address: {
    ...anEmployee.address,
    number: '14',
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
