import { assert } from 'chai';
import User from '../src/models/User';

// Regex for UUID
// https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('User', (): void => {
  describe('.create()', (): void => {
    it('should create a new user in database', async (): Promise<void> => {
      const firstName = "Kentaro";
      const lastName = "Kaneki";
      const email = "kentarokaneki@example.com";

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
});


