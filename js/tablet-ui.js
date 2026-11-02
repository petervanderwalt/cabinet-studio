export function initTabletViews() {
  const app = document.getElementById('app');
  const buttons = document.querySelectorAll('.tablet-nav button');
  app.dataset.tabletView = 'preview';
  for (const button of buttons) {
    button.addEventListener('click', () => {
      app.dataset.tabletView = button.dataset.tabletView;
      for (const item of buttons) {
        item.setAttribute('aria-pressed', String(item === button));
      }
    });
  }
}
