import { expect, test } from "@playwright/test";

const enabled = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD && process.env.E2E_SECOND_EMAIL && process.env.E2E_SECOND_PASSWORD && process.env.NEXT_PUBLIC_SUPABASE_URL);

test.describe("configured Supabase golden path", () => {
  test.skip(!enabled, "Set both E2E accounts and Supabase variables for authenticated acceptance testing.");
  test.setTimeout(180_000);

  test("capture, process, apply, record outcome, search, ask, publish, and save", async ({ page }, testInfo) => {
    const insight = `Talk to users before building features (${testInfo.project.name}-${Date.now()}).`;
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_EMAIL!);
    await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/today$/);
    await page.getByRole("button", { name: /Capture/ }).click();
    await page.getByLabel("What did you find useful?").fill(insight);
    await page.getByRole("button", { name: "URL" }).click();
    await page.getByLabel("Source URL").fill("https://www.youtube.com/watch?v=praxis-test");
    await page.getByRole("button", { name: "Save to Inbox" }).click();
    await expect(page).toHaveURL(/\/inbox/);
    await page.getByText(insight).click();
    await page.getByLabel("My interpretation").fill("I tend to implement before verifying customers care.");
    await page.getByLabel("What will you do?").fill("Interview 5 potential users before redesigning onboarding");
    await page.getByLabel("When", { exact: true }).fill("2030-09-27T17:00");
    await page.getByRole("button", { name: "Create applied insight" }).click();
    await page.getByRole("link", { name: /Interview 5 potential users/ }).click();
    await page.getByLabel("What happened?").fill("Four users said onboarding was not the main problem. Pricing confusion was.");
    await page.getByLabel("Did the insight help?").selectOption("helpful");
    await page.getByRole("button", { name: "Complete and record outcome" }).click();
    await page.goto("/library?q=customer+research");
    await page.goto("/ask");
    await page.getByPlaceholder(/What have I learned/).fill("What have I learned about customer research?");
    await page.getByLabel("Ask Praxis").click();
    await expect(page.getByText(/grounded matches|Praxis synthesis|Talk to users/i).first()).toBeVisible();
    await page.goto("/library");
    await page.getByRole("heading", { name: insight }).click();
    await expect(page).toHaveURL(/\/library\/[0-9a-f-]+$/);
    const visibility = page.locator('select[name="selectedVisibility"]');
    await visibility.selectOption("public");
    await expect(visibility).toHaveValue("public");
    await page.getByLabel("Application summary").fill("Interviewed five prospective users before redesigning onboarding.");
    await page.getByLabel("Outcome summary").fill("Pricing confusion mattered more than onboarding.");
    await page.getByRole("button", { name: "Save visibility" }).click();
    await expect(page).toHaveURL(/\?visibility=public$/);
    await page.getByRole("link", { name: /View public page/ }).click();
    await expect(page).toHaveURL(/\/i\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { name: insight })).toBeVisible();

    const publicUrl = page.url();
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_SECOND_EMAIL!);
    await page.getByLabel("Password").fill(process.env.E2E_SECOND_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/today$/);
    await page.goto(publicUrl);
    await page.getByText("Save to my Praxis", { exact: true }).click();
    await expect(page).toHaveURL(/\/library\/[0-9a-f-]+\?saved=1/);
  });
});
