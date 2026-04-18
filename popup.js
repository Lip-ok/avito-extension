const toggle = document.getElementById('toggle');

// загрузка состояния
chrome.storage.sync.get(['enabled'], (result) => {
  toggle.checked = result.enabled ?? true;
});

// переключение
toggle.addEventListener('change', async () => {
  const enabled = toggle.checked;

  // сохраняем
  chrome.storage.sync.set({ enabled });

  // отправляем в активную вкладку
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    type: 'TOGGLE',
    enabled
  });
});