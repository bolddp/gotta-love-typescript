# Interfaces

## Create interface

file: ./person/Person.ts

```ts
export interface Person {
  personId: string; // UUID
  name: string;
  yearOfBirth: number;
}
```

## Create function to log interface

temporarily put it below interface

- freedom! functions and interfaces together!
- info: JSON.stringify built in

```ts
const logPerson = (person: Person) => {
  console.log(`Person: ${JSON.stringify(person)}`);
};
```

## Declare person

```ts
const person = {
  name: 'Daniel',
};
```

### No errors yet!

```ts
logPerson(implicitPerson); // <-- Error is here
```

### Change to explicit person, error now in correct place

```ts
const person: Person = {
  name: 'Daniel',
};
```

### Add yearOfBirth to remove error

```ts
const person: Person = {
  name: 'Daniel',
  yearOfBirth: 1972,
};
```

### Declare in function call

Maximal freedom

```ts
logPerson({
  name: 'Benny',
  yearOfBirth: 1980,
});
```

### Clean up

Remove everything except the Person interface
