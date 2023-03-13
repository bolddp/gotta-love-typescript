## Union types (discriminating)

file: Actions.ts

### Let's define the actions

```ts
export interface Action {
  type: string;
}

export interface ShootAction extends Action {
  type: 'shoot';
  weapon: 'gun' | 'rpg' | 'rubberband';
}

export interface ScreamAction extends Action {
  type: 'scream';
  pitch: 'low' | 'medium' | 'high';
  setLevel(level: number): void;
}

export interface SwimAction extends Action {
  type: 'swim';
  kind: 'breast' | 'crawl';
  setLevel(level: number): void;
  swim(): void;
}
```

### The union type

```ts
export type Actions = ShootAction | ScreamAction | SwimAction;
```

### Now we can apply logic type constraints in code

```ts
const handleAction = (action: Actions) => {
  switch (action.type) {
    case 'shoot':
      if (action.weapon == 'gun') {
        // <-- there is a weapon property
        console.log('Bam');
      } else if (action.weapon == 'rpg') {
        console.log('BAAAAAAAM!');
      }
      break; // <-- Makes the default clause valid
    default:
      action.setLevel(1);
  }
};

const handleActionIf = (action: Actions) => {
  if (action.type == 'swim') {
    action.swim();
  }
};
```
