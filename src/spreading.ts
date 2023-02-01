interface Employee {
  name: string;
  age: number;
  address: Address;
}

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
