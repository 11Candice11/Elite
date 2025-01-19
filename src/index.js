import { AppShell } from "./AppShell.js";
import { Routing } from "/src/shell/Routing.js";

try {
  const router = new Routing();
  const app = new AppShell(router);
  app.init();
} catch (ex) {
  console.log(ex);
}

