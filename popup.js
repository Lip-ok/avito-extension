const toggle = document.getElementById('toggle');
const status = document.getElementById('status');

function render(enabled) {
  toggle.checked = enabled;
  status.textContent = enabled ? 'Расширение включено' : 'Расширение выключено';
}

chrome.storage.sync.get(['enabled'], (result) => {
  render(result.enabled ?? true);
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  render(enabled);

  chrome.storage.sync.set({ enabled }, () => {
    if (chrome.runtime.lastError) {
      render(!enabled);
    }
  });
});