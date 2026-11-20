import { test } from '../../fixtures';
import { users } from '../../utils/users';

test.describe('Login', () => {
  test('valid user lands on inventory', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test('locked out user sees an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.locked.username, users.locked.password);
    await loginPage.expectError(/locked out/i);
  });

  test('wrong password is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, 'wrong');
    await loginPage.expectError(/do not match/i);
  });
});
