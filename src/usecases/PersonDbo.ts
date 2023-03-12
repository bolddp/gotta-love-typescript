/**
 * Person entity, not optimized for database storage
 */
export interface Person {
  personId: string;
  firstName: string;
  lastName: string;
}

export type PersonDbo = Omit<Person, 'personId'> & { _id: string };

const personToDbo = (person: Person): PersonDbo => {
  return {
    ...person,
    _id: person.personId,
  };
};
