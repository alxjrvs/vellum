import { describe, expect, it } from 'vitest';
import { lauxlib, lua, lualib, to_luastring } from 'fengari';
import script from '../../obs/vellum.lua?raw';
import fakeObslua from './fakeObslua.lua?raw';
import { COMMAND_EVENT } from './commandBus';
import { parseCommand } from '@vellum/protocol';

// Rows of the script's COMMANDS table: { "id", "description", 'json' }.
const ROW = /\{\s*"([^"]+)",\s*"([^"]+)",\s*'([^']+)'\s*\}/g;
const rows = [...script.matchAll(ROW)].map(([, id, description, json]) => ({
  id,
  description,
  json,
}));

/**
 * Runs the real OBS script against a fake `obslua`, then `scenario`, which
 * returns a string for the test to check.
 */
function run(scenario: string): string {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  const source = `${fakeObslua}\n${script}\nreturn (function()\n${scenario}\nend)()`;
  const loaded = lauxlib.luaL_loadstring(L, to_luastring(source));
  if (loaded !== lua.LUA_OK || lua.lua_pcall(L, 0, 1, 0) !== lua.LUA_OK) {
    throw new Error(lua.lua_tojsstring(L, -1));
  }
  return lua.lua_tojsstring(L, -1);
}

describe('OBS script hotkeys', () => {
  it('declares hotkeys', () => {
    expect(rows.length).toBeGreaterThan(10);
  });

  it('sends the event name the app listens for', () => {
    expect(script).toContain(`local EVENT_NAME = "${COMMAND_EVENT}"`);
  });

  it('gives every hotkey a unique id', () => {
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(rows.map((r) => [r.description, r.json] as const))(
    '%s sends a command the app accepts',
    (_, json) => {
      expect(parseCommand(JSON.parse(json))).not.toBeNull();
    }
  );

  it('sends a pressed hotkey only to Vellum browser sources', () => {
    const events = run(`
      fake.load({ camera = "cam-1" })
      fake.press("set_up")
      obslua.obs_source_create("browser_source", "Other page", { values = { url = "https://example.com" } })
      fake.state.hotkeys["vellum_hope_up"](true)
      fake.state.hotkeys["vellum_hope_up"](false)
      local out = {}
      for _, e in ipairs(fake.state.events) do
        if e.event ~= "vellum:obs-script" then table.insert(out, e.source .. "|" .. e.call .. "|" .. e.event .. "|" .. e.json) end
      end
      return table.concat(out, "\\n")
    `);
    expect(events.split('\n')).toEqual([
      `Vellum HUD|javascript_event|${COMMAND_EVENT}|{"type":"track.adjust","track":"hope","delta":1}`,
    ]);
  });
});

describe('OBS script announcement', () => {
  it('tells Vellum sources it is loaded, on a timer and right after setup', () => {
    const result = run(`
      fake.load({ camera = "cam-1" })
      fake.press("set_up")
      local after_setup = #fake.state.events
      local ms
      for callback, interval in pairs(fake.state.timers) do
        ms = interval
        callback()
      end
      local last = fake.state.events[#fake.state.events]
      script_unload()
      return table.concat({ after_setup, ms, last.source, last.event, last.json, next(fake.state.timers) == nil and "removed" or "kept" }, "\\n")
    `);
    expect(result.split('\n')).toEqual([
      '1',
      '3000',
      'Vellum HUD',
      'vellum:obs-script',
      '{"version":1}',
      'removed',
    ]);
  });
});

describe('OBS script setup', () => {
  it('lists the webcams OBS can see, plus the in-page camera and none', () => {
    const items = run(`
      fake.load()
      local out = {}
      for _, item in ipairs(fake.props.by_name.camera.items) do
        table.insert(out, item[1] .. "=" .. item[2])
      end
      return table.concat(out, ",")
    `);
    expect(items).toBe(
      'Desk Cam=cam-1,Capture Card=cam-2,Vellum draws the camera (face tracking)=vellum:page,No camera='
    );
  });

  it('builds the scene with the webcam under the HUD and starts the Virtual Camera', () => {
    const result = run(`
      fake.load({ link = "  https://vellumhud.com/app/daggerheart/player/?c=abc  ", camera = "cam-2" })
      fake.press("set_up")
      local hud = fake.state.sources["Vellum HUD"].settings
      local cam = fake.state.sources["Vellum Camera"].settings
      local item = obslua.obs_scene_find_source(fake.state.sources["Vellum"].scene, "Vellum HUD")
      return table.concat({
        fake.stack("Vellum"),
        obslua.obs_data_get_string(hud, "url"),
        tostring(hud.values.width) .. "x" .. tostring(hud.values.height),
        obslua.obs_data_get_string(cam, "video_device_id"),
        tostring(item.bounds.x) .. "x" .. tostring(item.bounds.y),
        tostring(fake.state.current_scene),
        tostring(fake.state.virtualcam),
      }, "\\n")
    `);
    expect(result.split('\n')).toEqual([
      'Vellum Camera:true,Vellum HUD:true',
      'https://vellumhud.com/app/daggerheart/player/?c=abc',
      '1920x1080',
      'cam-2',
      '1280x720',
      'Vellum',
      'true',
    ]);
  });

  it('uses the player screen when no link is pasted', () => {
    const url = run(`
      fake.load()
      fake.press("set_up")
      return obslua.obs_data_get_string(fake.state.sources["Vellum HUD"].settings, "url")
    `);
    expect(url).toBe('https://vellumhud.com/app/daggerheart/player/');
  });

  it('updates the same scene on a second run, hiding the webcam when Vellum draws it', () => {
    const result = run(`
      fake.load({ camera = "cam-1" })
      fake.press("set_up")
      fake.settings.values.camera = "vellum:page"
      fake.press("set_up")
      return fake.stack("Vellum") .. "\\n" .. fake.props.by_name.status.description
    `);
    const [stack, status] = result.split('\n');
    expect(stack).toBe('Vellum Camera:false,Vellum HUD:true');
    expect(status).toMatch(/--enable-media-stream/);
  });

  it('follows a newly pasted link once the HUD exists', () => {
    const url = run(`
      fake.load()
      fake.press("set_up")
      fake.settings.values.link = "https://vellumhud.com/app/daggerheart/gm/?c=new"
      script_update(fake.settings)
      return obslua.obs_data_get_string(fake.state.sources["Vellum HUD"].settings, "url")
    `);
    expect(url).toBe('https://vellumhud.com/app/daggerheart/gm/?c=new');
  });

  it('leaves a same-named source of another kind alone and says why', () => {
    const result = run(`
      obslua.obs_source_create("image_source", "Vellum HUD", nil)
      fake.load()
      fake.press("set_up")
      return fake.state.sources["Vellum HUD"].id .. "\\n" .. fake.props.by_name.status.description
    `);
    const [kind, status] = result.split('\n');
    expect(kind).toBe('image_source');
    expect(status).toMatch(/different kind of source/);
  });
});
