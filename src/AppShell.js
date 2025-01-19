// AppShell.js
export class AppShell {
  constructor(router) {
    this.router = router;
  }

  init() {
    this.router.navigate("/login");
  }
}
