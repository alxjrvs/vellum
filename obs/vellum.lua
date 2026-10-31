--[[
Vellum for OBS.

One script does the whole OBS side of Vellum:

  * Setup: paste your Vellum link, pick your webcam, press "Set up Vellum".
    The script builds a "Vellum" scene (webcam underneath, the HUD on top,
    both fitted to the canvas), switches to it and starts the Virtual Camera.
    Running it again updates the same scene; it never touches other scenes.
  * Hotkeys: adds "Vellum: ..." entries to Settings > Hotkeys. Each one sends
    a command straight to every Vellum browser source through the browser
    source's own `javascript_event` call, so there is no websocket, password
    or network involved.

Install: Tools > Scripts > + > pick this file. Requires OBS 28 or newer.

The page receives a `vellum:command` window event whose detail is the JSON
below; see packages/protocol/src/commands.ts for the vocabulary.
]]

obs = obslua

local EVENT_NAME = "vellum:command"
-- Sent every few seconds so the page's setup checks can see the script is loaded.
local ANNOUNCE_EVENT = "vellum:obs-script"
local ANNOUNCE_JSON = '{"version":1}'
local ANNOUNCE_MS = 3000

local DEFAULT_LINK = "https://vellumhud.com/app/daggerheart/player/"
local SCENE_NAME = "Vellum"
local HUD_NAME = "Vellum HUD"
local CAMERA_NAME = "Vellum Camera"

-- Camera choices that aren't a device.
local CAMERA_NONE = ""
local CAMERA_IN_PAGE = "vellum:page"

-- Webcam source types, newest first, with the setting that names the device.
local CAMERA_TYPES = {
  { id = "macos-avcapture", device = "device" },
  { id = "av_capture_input", device = "device" },
  { id = "dshow_input", device = "video_device_id" },
  { id = "v4l2_input", device = "device_id" },
}

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
local settings_ref = nil
local status_text = "Paste your link, pick your camera, then press Set up Vellum."

-- Hotkeys -------------------------------------------------------------------

-- A browser source is Vellum's if its URL points at the app (hosted or local dev).
local function is_vellum_url(url)
  return url:find("vellumhud.com", 1, true) ~= nil
    or url:find("localhost", 1, true) ~= nil
    or url:find("127.0.0.1", 1, true) ~= nil
end

local function is_vellum_source(source)
  if obs.obs_source_get_unversioned_id(source) ~= "browser_source" then
    return false
  end
  local settings = obs.obs_source_get_settings(source)
  local url = obs.obs_data_get_string(settings, "url")
  obs.obs_data_release(settings)
  return is_vellum_url(url)
end

local function send(json, event_name)
  event_name = event_name or EVENT_NAME
  local sources = obs.obs_enum_sources()
  if sources == nil then
    return
  end
  for _, source in ipairs(sources) do
    if is_vellum_source(source) then
      local cd = obs.calldata_create()
      obs.calldata_set_string(cd, "eventName", event_name)
      obs.calldata_set_string(cd, "jsonString", json)
      obs.proc_handler_call(obs.obs_source_get_proc_handler(source), "javascript_event", cd)
      obs.calldata_destroy(cd)
    end
  end
  obs.source_list_release(sources)
end

local function announce()
  send(ANNOUNCE_JSON, ANNOUNCE_EVENT)
end

-- Cameras -------------------------------------------------------------------

-- The webcam source type this OBS build has, or nil.
local function camera_type()
  for _, t in ipairs(CAMERA_TYPES) do
    local name = obs.obs_source_get_display_name(t.id)
    if name ~= nil and name ~= "" then
      return t
    end
  end
  return nil
end

-- { { name, value }, ... } for every webcam OBS can see.
local function list_cameras()
  local cameras = {}
  local t = camera_type()
  if t == nil then
    return cameras
  end
  -- A throwaway private source: its properties hold the live device list.
  local probe = obs.obs_source_create_private(t.id, "Vellum camera probe", nil)
  if probe == nil then
    return cameras
  end
  local props = obs.obs_source_properties(probe)
  local list = obs.obs_properties_get(props, t.device)
  if list ~= nil then
    for i = 0, obs.obs_property_list_item_count(list) - 1 do
      local value = obs.obs_property_list_item_string(list, i)
      if value ~= nil and value ~= "" then
        table.insert(cameras, { obs.obs_property_list_item_name(list, i), value })
      end
    end
  end
  obs.obs_properties_destroy(props)
  obs.obs_source_release(probe)
  return cameras
end

local function fill_camera_list(prop)
  obs.obs_property_list_clear(prop)
  local cameras = list_cameras()
  for _, camera in ipairs(cameras) do
    obs.obs_property_list_add_string(prop, camera[1], camera[2])
  end
  obs.obs_property_list_add_string(prop, "Vellum draws the camera (face tracking)", CAMERA_IN_PAGE)
  obs.obs_property_list_add_string(prop, "No camera", CAMERA_NONE)
end

-- Scene ---------------------------------------------------------------------

local function link_from(settings)
  local link = obs.obs_data_get_string(settings, "link")
  link = link:gsub("^%s+", ""):gsub("%s+$", "")
  if link == "" then
    return DEFAULT_LINK
  end
  return link
end

-- Fit a scene item to the whole canvas, keeping its aspect ratio.
local function fit_to_canvas(item)
  local video = obs.obs_video_info()
  obs.obs_get_video_info(video)
  local pos = obs.vec2()
  pos.x = 0
  pos.y = 0
  local bounds = obs.vec2()
  bounds.x = video.base_width
  bounds.y = video.base_height
  obs.obs_sceneitem_set_alignment(item, 5) -- top left
  obs.obs_sceneitem_set_pos(item, pos)
  obs.obs_sceneitem_set_bounds_type(item, obs.OBS_BOUNDS_SCALE_INNER)
  obs.obs_sceneitem_set_bounds_alignment(item, 0) -- centre
  obs.obs_sceneitem_set_bounds(item, bounds)
end

-- Find a source by name and update its settings, or create it. Returns a
-- reference the caller releases, or nil plus a reason.
local function upsert_source(name, id, settings)
  local source = obs.obs_get_source_by_name(name)
  if source ~= nil then
    if obs.obs_source_get_unversioned_id(source) ~= id then
      obs.obs_source_release(source)
      return nil, '"' .. name .. '" already exists and is a different kind of source. Rename it and try again.'
    end
    obs.obs_source_update(source, settings)
    return source
  end
  return obs.obs_source_create(id, name, settings, nil)
end

-- Put a source in the scene once, fitted, at the top or bottom of the stack.
local function place(scene, source, name, order)
  local item = obs.obs_scene_find_source(scene, name)
  if item == nil then
    item = obs.obs_scene_add(scene, source)
  end
  fit_to_canvas(item)
  obs.obs_sceneitem_set_visible(item, true)
  obs.obs_sceneitem_set_order(item, order)
end

local function hide(scene, name)
  local item = obs.obs_scene_find_source(scene, name)
  if item ~= nil then
    obs.obs_sceneitem_set_visible(item, false)
  end
end

local function set_up(settings)
  local link = link_from(settings)
  local camera = obs.obs_data_get_string(settings, "camera")

  -- The scene, created on first run.
  local scene_source = obs.obs_get_source_by_name(SCENE_NAME)
  if scene_source == nil then
    local created = obs.obs_scene_create(SCENE_NAME)
    scene_source = obs.obs_source_get_ref(obs.obs_scene_get_source(created))
    obs.obs_scene_release(created)
  end
  local scene = obs.obs_scene_from_source(scene_source)
  if scene == nil then
    obs.obs_source_release(scene_source)
    return false, '"' .. SCENE_NAME .. '" already exists and is not a scene. Rename it and try again.'
  end

  -- The webcam, underneath.
  if camera == CAMERA_NONE or camera == CAMERA_IN_PAGE then
    hide(scene, CAMERA_NAME)
  else
    local t = camera_type()
    if t == nil then
      obs.obs_source_release(scene_source)
      return false, "This OBS has no Video Capture Device source."
    end
    local cam_settings = obs.obs_data_create()
    obs.obs_data_set_string(cam_settings, t.device, camera)
    local cam, err = upsert_source(CAMERA_NAME, t.id, cam_settings)
    obs.obs_data_release(cam_settings)
    if cam == nil then
      obs.obs_source_release(scene_source)
      return false, err
    end
    place(scene, cam, CAMERA_NAME, obs.OBS_ORDER_MOVE_BOTTOM)
    obs.obs_source_release(cam)
  end

  -- The HUD, on top. 1920x1080 is the size Vellum is drawn for; the scene item
  -- scales it to whatever the canvas is.
  local hud_settings = obs.obs_data_create()
  obs.obs_data_set_bool(hud_settings, "is_local_file", false)
  obs.obs_data_set_string(hud_settings, "url", link)
  obs.obs_data_set_int(hud_settings, "width", 1920)
  obs.obs_data_set_int(hud_settings, "height", 1080)
  obs.obs_data_set_bool(hud_settings, "reroute_audio", false)
  local hud, err = upsert_source(HUD_NAME, "browser_source", hud_settings)
  obs.obs_data_release(hud_settings)
  if hud == nil then
    obs.obs_source_release(scene_source)
    return false, err
  end
  place(scene, hud, HUD_NAME, obs.OBS_ORDER_MOVE_TOP)
  obs.obs_source_release(hud)

  obs.obs_frontend_set_current_scene(scene_source)
  obs.obs_source_release(scene_source)

  announce()

  if not obs.obs_frontend_virtualcam_active() then
    obs.obs_frontend_start_virtualcam()
  end

  local done = "Done. In Discord, choose OBS Virtual Camera under Settings > Voice & Video."
  if camera == CAMERA_IN_PAGE then
    done = done .. " Vellum draws the camera, so start OBS with --enable-media-stream (see vellumhud.com/docs/face-tracking)."
  end
  if not is_vellum_url(link) then
    done = done .. " Note: that link isn't on vellumhud.com, so hotkeys won't reach it."
  end
  return true, done
end

-- Keep an existing HUD source on the latest pasted link.
local function sync_link(settings)
  local hud = obs.obs_get_source_by_name(HUD_NAME)
  if hud == nil then
    return
  end
  if obs.obs_source_get_unversioned_id(hud) == "browser_source" then
    local current = obs.obs_source_get_settings(hud)
    local link = link_from(settings)
    if obs.obs_data_get_string(current, "url") ~= link then
      local update = obs.obs_data_create()
      obs.obs_data_set_string(update, "url", link)
      obs.obs_source_update(hud, update)
      obs.obs_data_release(update)
    end
    obs.obs_data_release(current)
  end
  obs.obs_source_release(hud)
end

-- Script entry points -------------------------------------------------------

function script_description()
  return "<b>Vellum</b>: your character HUD on your Discord camera.<br><br>"
    .. "1. In Vellum, press <b>Copy share link</b> and paste it below.<br>"
    .. "2. Pick your webcam.<br>"
    .. "3. Press <b>Set up Vellum</b>, then choose <b>OBS Virtual Camera</b> in Discord.<br><br>"
    .. "Hotkeys are under Settings &gt; Hotkeys (search for \"Vellum\"). "
    .. '<a href="https://vellumhud.com/docs/obs/">Setup guide</a>'
end

function script_defaults(settings)
  obs.obs_data_set_default_string(settings, "link", "")
  obs.obs_data_set_default_string(settings, "camera", CAMERA_NONE)
end

function script_properties()
  local props = obs.obs_properties_create()

  obs.obs_properties_add_text(props, "link", "Your Vellum link", obs.OBS_TEXT_DEFAULT)

  local camera = obs.obs_properties_add_list(
    props,
    "camera",
    "Camera",
    obs.OBS_COMBO_TYPE_LIST,
    obs.OBS_COMBO_FORMAT_STRING
  )
  fill_camera_list(camera)

  obs.obs_properties_add_button(props, "refresh_cameras", "Refresh camera list", function(p)
    fill_camera_list(obs.obs_properties_get(p, "camera"))
    return true
  end)

  obs.obs_properties_add_button(props, "set_up", "Set up Vellum", function(p)
    if settings_ref == nil then
      return false
    end
    local _, message = set_up(settings_ref)
    status_text = message
    obs.obs_property_set_description(obs.obs_properties_get(p, "status"), status_text)
    return true
  end)

  obs.obs_properties_add_text(props, "status", status_text, obs.OBS_TEXT_INFO)

  return props
end

function script_update(settings)
  settings_ref = settings
  sync_link(settings)
end

function script_load(settings)
  settings_ref = settings
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
  obs.timer_add(announce, ANNOUNCE_MS)
end

function script_unload()
  obs.timer_remove(announce)
end

function script_save(settings)
  for id, hotkey_id in pairs(hotkey_ids) do
    local saved = obs.obs_hotkey_save(hotkey_id)
    obs.obs_data_set_array(settings, id, saved)
    obs.obs_data_array_release(saved)
  end
end
