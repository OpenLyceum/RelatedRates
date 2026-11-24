import { expect, test } from "@playwright/test";

for (const { screen, controls } of [
  { screen: 1, controls: [{ name: "Curve point", key: "ArrowRight", increases: true }] },
  { screen: 2, controls: [{ name: "Water surface", key: "ArrowUp", increases: true }] },
  {
    screen: 3,
    controls: [
      { name: "Foot of the ladder", key: "ArrowRight", increases: true },
      { name: "Top of the ladder", key: "ArrowUp", increases: false },
    ],
  },
  { screen: 4, controls: [{ name: "Oil slick edge", key: "ArrowRight", increases: true }] },
]) {
  test(`screen ${screen} exposes its picture handles in the tab order`, async ({ page }) => {
    await page.goto(`/?ea&screens=${screen}`);
    const measurement = page.getByRole("slider", { name: /^Measurement / });
    for (const { name, key, increases } of controls) {
      const handle = page.getByText(name, { exact: true });
      await handle.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(handle).toBeFocused();
      const initial = Number(await measurement.getAttribute("aria-valuenow"));
      await page.keyboard.press(key);
      const next = Number(await measurement.getAttribute("aria-valuenow"));
      expect(increases ? next - initial : initial - next).toBeGreaterThan(0);
      await expect(handle).toBeFocused();
    }
  });
}

test("a prediction and the derivation are read in the screen description", async ({ page }) => {
  await page.goto("/?ea&screens=2");
  await page.getByRole("button", { name: "Smaller", exact: true }).press("Enter");
  await expect(page.getByText(/Right\. Here \|dh\/dt\| shrinks as h grows\./)).toBeAttached();
  const next = page.getByRole("button", { name: "Next step", exact: true });
  for (let i = 0; i < 4; i++) {
    await next.press("Enter");
  }
  await expect(page.getByText(/dh\/dt = 0\.2387 m\/s/).first()).toBeAttached();
});
