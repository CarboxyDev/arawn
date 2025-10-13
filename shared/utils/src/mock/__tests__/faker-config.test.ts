import { describe, expect, it } from 'vitest';

import { configureFaker, faker, resetFaker } from '../faker-config';

describe('Faker Config', () => {
  describe('configureFaker', () => {
    it('should generate deterministic data with same seed', () => {
      const seed = 12345;

      configureFaker(seed);
      const name1 = faker.person.fullName();
      const email1 = faker.internet.email();

      configureFaker(seed);
      const name2 = faker.person.fullName();
      const email2 = faker.internet.email();

      expect(name1).toBe(name2);
      expect(email1).toBe(email2);
    });

    it('should generate different data with different seeds', () => {
      configureFaker(11111);
      const name1 = faker.person.fullName();

      configureFaker(22222);
      const name2 = faker.person.fullName();

      expect(name1).not.toBe(name2);
    });

    it('should work without explicit seed', () => {
      configureFaker();
      const name = faker.person.fullName();

      expect(name).toBeTruthy();
      expect(typeof name).toBe('string');
    });
  });

  describe('resetFaker', () => {
    it('should generate random data after reset', () => {
      configureFaker(12345);
      const name1 = faker.person.fullName();

      resetFaker();
      configureFaker(12345);
      const name2 = faker.person.fullName();

      expect(name1).toBe(name2);
    });
  });

  describe('faker export', () => {
    it('should export faker instance', () => {
      expect(faker).toBeDefined();
      expect(faker.person).toBeDefined();
      expect(faker.internet).toBeDefined();
    });
  });
});
