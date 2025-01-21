// AppShell.js
import { router } from '/src/shell/Routing.js'
export class AppShell {

  init() {
    router.navigate('/login'); // Set default route to login page
  }
}
