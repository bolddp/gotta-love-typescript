import { v4 as uuid } from 'uuid';

export class PersonService {
  private repository: PersonRepository;
  private businessRules: BusinessRules;

  constructor(repository: PersonRepository, businessRules: BusinessRules) {
    this.repository = repository;
    this.businessRules = businessRules;
  }

  updatePersonBad(personId: string, updateRequest: PatchPersonRequest): Promise<void> {
    return this.repository.get(personId).then((existing) => {
      if (!existing) {
        return;
      }
      const updatedPerson: Person = { ...existing, ...updateRequest };
      return this.businessRules.validatePerson(updatedPerson).then(() => this.repository.put(updatedPerson));
    });
  }

  async updatePersonNaajs(personId: string, updateRequest: PatchPersonRequest) {
    const existing = await this.repository.get(personId);
    if (!existing) {
      throw new Error('Person not found');
    }
    const updatedPerson: Person = { ...existing, ...updateRequest };
    await this.businessRules.validatePerson(updatedPerson);
    await this.repository.put(updatedPerson);
  }
}

export interface PersonRepository {
  get(personId: string): Promise<Person | undefined>;
  put(person: Person): Promise<void>;
}

export interface BusinessRules {
  validatePerson(person: Person): Promise<void>;
}
