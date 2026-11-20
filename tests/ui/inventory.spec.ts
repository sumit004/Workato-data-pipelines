import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test('shows six products', async ({ loggedInInventory }) => {
    await expect(loggedInInventory.items).toHaveCount(6);
  });

  test('adding an item updates the cart badge', async ({ loggedInInventory }) => {
    await loggedInInventory.addToCart('Sauce Labs Backpack');
    await expect(loggedInInventory.cartBadge).toHaveText('1');
  });

  test('sorting by price low to high', async ({ loggedInInventory }) => {
    await loggedInInventory.sort.selectOption('lohi');
    const prices = await loggedInInventory.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
