import { expect, test } from "@playwright/test";

test("landing communicates the promise and has working auth paths", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Turn what you learn/i })).toBeVisible();
  await expect(page.getByText("Private by default", { exact: false }).first()).toBeVisible();
  await page.getByRole("link", { name: "Start free" }).first().click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading", { name: "Turn learning into action." })).toBeVisible();
});

test("public explore and auth guard work", async ({ page }) => {
  await page.goto("/explore");
  await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
  await page.goto("/today");
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await expect(page).toHaveURL(/\/login\?next=%2Ftoday/);
  } else {
    await expect(page).toHaveURL(/\/login\?setup=1/);
    await expect(page.getByText("Supabase configuration is required", { exact: false })).toBeVisible();
  }
});

test("landing has no horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await expect(page.getByRole("heading", { name: /Turn what you learn/i })).toBeVisible();
});
