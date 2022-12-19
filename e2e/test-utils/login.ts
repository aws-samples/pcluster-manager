import { ENVIRONMENT_CONFIG } from "../configs/environment";
import { LOGIN_CONFIG } from "../configs/login";

export async function visitAndLogin(page) {
  await page.goto(ENVIRONMENT_CONFIG.URL);
  await page.getByRole('textbox', { name: 'name@host.com' }).fill(LOGIN_CONFIG.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(LOGIN_CONFIG.password);
  await page.getByRole('button', { name: 'submit' }).click();
}