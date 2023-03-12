export interface Action {
  type: string;
}

export interface ShootAction extends Action {
  type: 'shoot';
  weapon: 'gun' | 'rpg' | 'rubberband';
}

export interface ScreamAction extends Action {
  type: 'scream';
  level: 'low' | 'medium' | 'high';
  setLevel(level: number): void;
}

export interface SwimAction extends Action {
  type: 'swim';
  kind: 'breast' | 'crawl';
  setLevel(level: number): void;
  swim(): void;
}

export type Actions = ShootAction | ScreamAction | SwimAction;

const handleAction = (action: Actions) => {
  switch (action.type) {
    case 'shoot':
      if (action.weapon == 'gun') {
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
