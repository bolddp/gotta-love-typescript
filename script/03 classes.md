# Classes

file: ./person/PersonService.ts

```ts
export class PersonService {
  private config: PersonServiceConfig;
  private personRepository: PersonRepository;

  constructor(config: PersonServiceConfig, personRepository: PersonRepository) {
    this.config = config;
    this.personRepository = personRepository;
  }
}
```

### Add PersonRepository interface

file: ./person/PersonRepository.ts

```ts
export interface PersonRepository {
  get(personId: string): Person;
  put(person: Person): void;
}
```

Add import statement to remove errors

### Add PersonServiceConfig

file: ./person/PersonService.ts
in same file... freedom!

```ts
export interface PersonServiceConfig {
  log?: (msg: string) => void;
}
```

### Add createPerson method

```ts
createPerson(person: Person) { // <-- Problem: the id shouldn't be included, that should be generated by PersonService
}
```

### Add CreatePersonRequest type

```ts
export type CreatePersonRequest = Omit<Person, 'personId'>;
```

### Change createPerson

```ts
createPerson(personRequest: CreatePersonRequest) {
  this.config.log?.('createPerson'); // <-- Optional chaining: NIIICE!
  const newPerson: Person = {
    ...personRequest,
    personId: uuid()
  }
}
```

### Create updatePerson

```ts
updatePerson(updatePersonRequest: CreatePersonRequest) { // <-- No, we don't want to be forced to update all fields...
}
```

### add PatchPersonRequest

```ts
export type PatchPersonRequest = Partial<CreatePersonRequest>;
```

### update updatePerson

Also demonstrates spreading nicely

```ts
const updatePerson = (personId: string, updates: PatchPersonRequest) => {
  const existing = getFromDatabase(employeeId);
  if (!existing) {
    throw new Error('Person not found');
  }
  const updated: Person = {
    ...existing,
    ...updates,
  };
};
```