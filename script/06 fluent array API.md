## Arrays

file: ./src/arrays.ts

Declare some name arrays

```ts
const names1: string[] = ['Benny', 'Ola', 'Anders'];
const names2: string[] = ['Allan', 'Benny', 'Kristina'];

const allNames: string[] = ['Siv', 'Tore', 'Benny', 'Ola', 'Kenta', 'Kristina', 'Anders', 'Lydia', 'Allan'];
```

### Use a Set to find unique names

```ts
const uniqueNames = [...new Set([...names1, ...names2])];
console.log(`Unique names: ${JSON.stringify(uniqueNames)}`);
```

### Try it out

`> npx ts-node ./src/arrays.ts`

### Sort the unique names

```ts
const uniqueNames = [...new Set([...names1, ...names2])].sort((a, b) => a.localeCompare(b));
console.log(`Unique names: ${JSON.stringify(uniqueNames)}`);
```

### Filter them with filter()

```ts
...filter((n) => n.startsWith('A'));
```

### Transform them with map()

...uniqueNames.map(n => `* ${n} *`);

### Find names that are obsolete (a real use case)...

remove the previous filter and mapping on uniqueNames

```ts
const obsoleteNames = allNames.filter((name) => !uniqueNames.includes(name));
console.log(`Redundant names: ${JSON.stringify(obsoleteNames)}`);
```
