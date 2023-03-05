"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anEmployee = {
    name: "Benny",
    age: 48,
    address: {
        street: "Götavägen",
        number: "12",
    },
};
const employeeWithUpdatedName = Object.assign(Object.assign({}, anEmployee), { name: "Bönny" });
const employeeWithUpdatedAddress = Object.assign(Object.assign({}, anEmployee), { address: Object.assign(Object.assign({}, anEmployee.address), { number: "14" }) });
/**
 * Multi spreading
 */
const updateEmployee = (employeeId, updates) => {
    const existing = getFromDatabase(employeeId);
    const updated = Object.assign(Object.assign(Object.assign({}, existing), updates), { updatedAt: Date.now() });
};
