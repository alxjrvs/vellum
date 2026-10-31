// Shared property-inspector glue: the Stream Deck app calls
// connectElgatoStreamDeckSocket when the panel opens. Each <select data-setting>
// reads from and writes to the action's settings.
function connectElgatoStreamDeckSocket(port, uuid, registerEvent, _info, actionInfo) {
  const settings = JSON.parse(actionInfo).payload.settings || {};
  const socket = new WebSocket('ws://127.0.0.1:' + port);
  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ event: registerEvent, uuid }));
  });
  for (const input of document.querySelectorAll('[data-setting]')) {
    const key = input.dataset.setting;
    const numeric = input.dataset.type === 'number';
    if (settings[key] !== undefined) input.value = String(settings[key]);
    input.addEventListener('change', () => {
      settings[key] = numeric ? Number(input.value) : input.value;
      socket.send(JSON.stringify({ event: 'setSettings', context: uuid, payload: settings }));
    });
  }
}
