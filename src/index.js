import { AppShell } from './AppShell.js';
import { Routing } from '/src/shell/Routing.js';

const app = new AppShell();
const router = new Routing();
app.init();
