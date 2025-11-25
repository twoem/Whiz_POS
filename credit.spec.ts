import { test, expect } from '@playwright/test';

test('creates a credit transaction and verifies it', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  await page.goto('http://localhost:5180');
  await page.waitForSelector('input[name="businessName"]');
  await page.screenshot({ path: 'business-registration.png' });

  // Complete business registration
  await page.fill('input[name="businessName"]', 'Test Business');
  await page.fill('input[name="address"]', '123 Test St');
  await page.fill('input[name="ownerName"]', 'Admin'); // Changed from adminName
  await page.fill('input[name="pin"]', '1234');
  await page.click('button[type="submit"]');

  // Log in
  await page.waitForSelector('text=Admin');
  await page.click('text=Admin');
  await page.fill('input[type="password"]', '1234');
  await page.click('button[type="submit"]');

  // Add a product to the cart
  await page.waitForSelector('.product-card');
  await page.click('.product-card');

  // Open checkout
  await page.click('text=Checkout');

  // Select credit payment and create a new customer
  await page.click('text=Credit');
  await page.fill('input[placeholder="Enter customer name"]', 'John Doe');
  await page.click('button:text("Complete Sale")');

  // Get the credit customers from the store
  const creditCustomers = await page.evaluate(() => {
    return (window as any).usePosStore.getState().creditCustomers;
  });

  // Verify the credit sale
  expect(creditCustomers).toHaveLength(1);
  expect(creditCustomers[0].name).toBe('John Doe');
  expect(creditCustomers[0].creditSales).toHaveLength(1);
  expect(creditCustomers[0].creditSales[0].status).toBe('unpaid');
  expect(creditCustomers[0].creditSales[0].amount).toBeGreaterThan(0);
});
