const names1: string[] = ['Benny', 'Ola', 'Anders'];
const names2: string[] = ['Allan', 'Benny', 'Kristina'];

const allNames: string[] = ['Siv', 'Tore', 'Benny', 'Ola', 'Kenta', 'Kristina', 'Anders', 'Lydia', 'Allan'];

const uniqueNames = [...new Set([...names1, ...names2])]
  .sort((a, b) => a.localeCompare(b))
  .filter((n) => n.startsWith('A'))
  .map((n) => `* ${n} *`);
console.log(`Unique names: ${JSON.stringify(uniqueNames)}`);
