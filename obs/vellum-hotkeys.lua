--[[
Vellum hotkeys for OBS.

Adds "Vellum: ..." entries to Settings > Hotkeys. Each one sends a command
straight to every Vellum browser source in the scene collection, through the
browser source's own `javascript_event` call, so it needs no websocket, no
password and no network. A Stream Deck can trigger the same hotkeys with its
built-in "Hotkey" action.

Install: Tools > Scripts > + > pick this file. Then bind keys under
Settings > Hotkeys (search for "Vellum").

The page receives a `vellum:command` window event whose detail is the JSON
below; see src/commands/types.ts for the vocabulary.
]]

obs = obslua

local EVENT_NAME = "vellum:command"

-- id, description, command JSON. Keep ids stable: OBS saves bindings by id.
local COMMANDS = {
  { "vellum_hope_up", "Vellum: Hope +1", '{"type":"track.adjust","track":"hope","delta":1}' },
  { "vellum_hope_down", "Vellum: Hope -1", '{"type":"track.adjust","track":"hope","delta":-1}' },
  { "vellum_hp_mark", "Vellum: Mark HP (take damage)", '{"type":"track.adjust","track":"hp","delta":1}' },
  { "vellum_hp_clear", "Vellum: Clear HP (heal)", '{"type":"track.adjust","track":"hp","delta":-1}' },
  { "vellum_stress_mark", "Vellum: Mark Stress", '{"type":"track.adjust","track":"stress","delta":1}' },
  { "vellum_stress_clear", "Vellum: Clear Stress", '{"type":"track.adjust","track":"stress","delta":-1}' },
  { "vellum_armor_mark", "Vellum: Mark Armor", '{"type":"track.adjust","track":"armor","delta":1}' },
  { "vellum_armor_clear", "Vellum: Clear Armor", '{"type":"track.adjust","track":"armor","delta":-1}' },
  { "vellum_fear_up", "Vellum: Fear +1 (GM)", '{"type":"track.adjust","track":"fear","delta":1}' },
  { "vellum_fear_down", "Vellum: Fear -1 (GM)", '{"type":"track.adjust","track":"fear","delta":-1}' },
  { "vellum_hidden", "Vellum: Toggle Hidden", '{"type":"condition.toggle","condition":"hidden"}' },
  { "vellum_restrained", "Vellum: Toggle Restrained", '{"type":"condition.toggle","condition":"restrained"}' },
  { "vellum_vulnerable", "Vellum: Toggle Vulnerable", '{"type":"condition.toggle","condition":"vulnerable"}' },
  { "vellum_frame_next", "Vellum: Next frame", '{"type":"frame.cycle","delta":1}' },
  { "vellum_frame_prev", "Vellum: Previous frame", '{"type":"frame.cycle","delta":-1}' },
}

local hotkey_ids = {}

-- A browser source is Vellum's if its URL points at the app (hosted or local dev).
local function is_vellum_source(source)
  if obs.obs_source_get_unversioned_id(source) ~= "browser_source" then
    return false
  end
  local settings = obs.obs_source_get_settings(source)
  local url = obs.obs_data_get_string(settings, "url")
  obs.obs_data_release(settings)
  return url:find("vellumhud.com", 1, true) ~= nil
    or url:find("localhost", 1, true) ~= nil
    or url:find("127.0.0.1", 1, true) ~= nil
end

local function send(json)
  local sources = obs.obs_enum_sources()
  if sources == nil then
    return
  end
  for _, source in ipairs(sources) do
    if is_vellum_source(source) then
      local cd = obs.calldata_create()
      obs.calldata_set_string(cd, "eventName", EVENT_NAME)
      obs.calldata_set_string(cd, "jsonString", json)
      obs.proc_handler_call(obs.obs_source_get_proc_handler(source), "javascript_event", cd)
      obs.calldata_destroy(cd)
    end
  end
  obs.source_list_release(sources)
end

function script_description()
  return "Vellum HUD hotkeys: adjust Hope, HP, Stress, Armor, Fear and conditions, "
    .. "and switch frames, from Settings > Hotkeys or a Stream Deck Hotkey action. "
    .. "No network needed."
end

function script_load(settings)
  for _, entry in ipairs(COMMANDS) do
    local id, description, json = entry[1], entry[2], entry[3]
    local hotkey_id = obs.obs_hotkey_register_frontend(id, description, function(pressed)
      if pressed then
        send(json)
      end
    end)
    hotkey_ids[id] = hotkey_id
    local saved = obs.obs_data_get_array(settings, id)
    obs.obs_hotkey_load(hotkey_id, saved)
    obs.obs_data_array_release(saved)
  end
end

function script_save(settings)
  for id, hotkey_id in pairs(hotkey_ids) do
    local saved = obs.obs_hotkey_save(hotkey_id)
    obs.obs_data_set_array(settings, id, saved)
    obs.obs_data_array_release(saved)
  end
end
