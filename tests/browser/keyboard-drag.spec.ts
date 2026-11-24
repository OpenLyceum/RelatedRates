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
    const measurement = page.getByRole("slider", { name: "Starting measurement", exact: true });
    for (const { name, key, increases } of controls) {
      const handle = page.getByRole("application", { name, exact: true });
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
