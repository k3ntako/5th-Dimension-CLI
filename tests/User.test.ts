import { assert } from 'chai';
import User from '../src/models/User';

// Regex for UUID
// https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('User', (): void => {
  describe('.create()', (): void => {
    it('should create a new user in database', async (): Promise<void> => {
      const firstName = "Grace";
      const lastName = "Hopper";
      const email = "g.hopper@example.com";

      const user = await User.create({
        firstName, lastName, email,
      });

      assert.hasAllKeys(user, ['id', 'firstName', 'lastName', 'email']);

      assert.match(user.id, uuidRegex)
      assert.strictEqual(user.firstName, firstName);
      assert.strictEqual(user.lastName, lastName);
      assert.strictEqual(user.email, email);
    });
  });

  describe('.loginAsDefault()', (): void => {
    it('should create default user', async (): Promise<void> => {
      const user = await User.loginAsDefault();

      assert.strictEqual(user.firstName, "Default");
      assert.strictEqual(user.lastName, "User");
      assert.strictEqual(user.email, "default@example.com");
    });

    it('should not create default user if it already exists', async (): Promise<void> => {
      const user1 = await User.loginAsDefault();
      const user2 = await User.loginAsDefault();

      assert.strictEqual(user1.id, user2.id);
      assert.strictEqual(user2.firstName, "Default");
      assert.strictEqual(user2.lastName, "User");
      assert.strictEqual(user2.email, "default@example.com");2
    });
  });
});


