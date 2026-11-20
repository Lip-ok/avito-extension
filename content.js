let observer = null;

function removeModal() {
  const el = document.querySelector('div[role="dialog"]');
  if (el) {
    el.remove();
  }

  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.height = '';
}

function start() {
  if (observer) return;

  removeModal();

  observer = new MutationObserver(removeModal);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function stop() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

chrome.storage.sync.get(['enabled'], (result) => {
  const enabled = result.enabled ?? true;
  if (enabled) start();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.enabled) {
    if (changes.enabled.newValue) {
      start();
    } else {
      stop();
    }
  }
});