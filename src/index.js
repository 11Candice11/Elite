import AppShell from './AppShell.js';

document.addEventListener('DOMContentLoaded', () => {
    const appShell = document.querySelector('app-shell');
    if (appShell) {
      // Perform any initialization or interaction here if needed
      console.log('AppShell loaded:', appShell);
    } else {
      console.error('AppShell element not found!');
    }
  });
  