## Intersection types

Let's say we want some additional data when we save the person to database

### Add AuditData

file: ./domain/AuditData.ts

```ts
export interface AuditData {
  createdAt: number;
  updatedAt?: number;
}
```

### Create PersonDbo type

file: ./domain/Person.ts

```ts
export type PersonDbo = Person & AuditData;
```

### Change PersonRepository to get and put PersonDbo instead
