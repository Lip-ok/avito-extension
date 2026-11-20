let observer = null;

const VPN_BLOCK_MESSAGE = 'возможно, у вас включен vpn';
const REFRESH_MESSAGE = 'обновить страницу';

function normalizeText(text) {
  return text
    .toLocaleLowerCase('ru')
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasVpnBlockMessage(element) {
  const text = normalizeText(element.textContent || '');
  return text.includes(VPN_BLOCK_MESSAGE) && text.includes(REFRESH_MESSAGE);
}

function findVpnBlocker() {
  const dialog = Array.from(document.querySelectorAll('[role="dialog"]'))
    .find(hasVpnBlockMessage);

  if (dialog) {
    return dialog;
  }

  const heading = Array.from(
    document.querySelectorAll('h1, h2, h3, [role="heading"]')
  ).find((element) =>
    normalizeText(element.textContent || '').includes(VPN_BLOCK_MESSAGE)
  );

  if (!heading) {
    return null;
  }

  let element = heading.parentElement;
  let contentContainer = null;

  while (element && element !== document.body) {
    if (hasVpnBlockMessage(element)) {
      contentContainer ??= element;
    }

    const style = getComputedStyle(element);
    if (style.position === 'fixed' && hasVpnBlockMessage(element)) {
      return element;
    }

    element = element.parentElement;
  }

  return contentContainer;
}

function removeVpnBlocker() {
  const blocker = findVpnBlocker();
  if (!blocker) return;

  blocker.remove();
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.height = '';
}

function start() {
  if (observer) return;

  removeVpnBlocker();

  observer = new MutationObserver(removeVpnBlocker);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
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