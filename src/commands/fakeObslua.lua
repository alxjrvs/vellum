-- A small stand-in for OBS's `obslua` module, enough to run obs/vellum.lua
-- in a test. It keeps sources, scenes and the Virtual Camera in `fake.state`
-- so a scenario can drive the script and read back what it built.

fake = {}
fake.state = {
  sources = {},
  order = {},
  current_scene = nil,
  virtualcam = false,
  events = {},
  hotkeys = {},
  cameras = { { "Desk Cam", "cam-1" }, { "Capture Card", "cam-2" } },
  types = {
    browser_source = "Browser",
    dshow_input = "Video Capture Device",
    scene = "Scene",
  },
}
local state = fake.state

local o = {}
obslua = o

o.OBS_TEXT_DEFAULT = 0
o.OBS_TEXT_INFO = 3
o.OBS_COMBO_TYPE_LIST = 2
o.OBS_COMBO_FORMAT_STRING = 3
o.OBS_BOUNDS_SCALE_INNER = 2
o.OBS_ORDER_MOVE_TOP = 2
o.OBS_ORDER_MOVE_BOTTOM = 3

-- obs_data ------------------------------------------------------------------

function o.obs_data_create()
  return { values = {}, defaults = {} }
end
function o.obs_data_release() end
function o.obs_data_set_string(d, k, v)
  d.values[k] = v
end
o.obs_data_set_int = o.obs_data_set_string
o.obs_data_set_bool = o.obs_data_set_string
function o.obs_data_set_default_string(d, k, v)
  d.defaults[k] = v
end
function o.obs_data_get_string(d, k)
  local v = d.values[k]
  if v == nil then
    v = d.defaults[k]
  end
  return v or ""
end
function o.obs_data_get_array()
  return nil
end
function o.obs_data_set_array() end
function o.obs_data_array_release() end

-- sources -------------------------------------------------------------------

local function copy_into(target, data)
  if data ~= nil then
    for k, v in pairs(data.values) do
      target.values[k] = v
    end
  end
end

function o.obs_source_get_display_name(id)
  return state.types[id]
end

function o.obs_source_create(id, name, settings)
  local source = { id = id, name = name, settings = o.obs_data_create() }
  copy_into(source.settings, settings)
  state.sources[name] = source
  table.insert(state.order, name)
  return source
end

function o.obs_source_create_private(id, name)
  return { id = id, name = name, private = true, settings = o.obs_data_create() }
end

function o.obs_get_source_by_name(name)
  return state.sources[name]
end
function o.obs_source_get_ref(source)
  return source
end
function o.obs_source_release() end
function o.obs_source_get_unversioned_id(source)
  return source.id
end
function o.obs_source_get_settings(source)
  return source.settings
end
function o.obs_source_update(source, settings)
  copy_into(source.settings, settings)
end

function o.obs_enum_sources()
  local list = {}
  for _, name in ipairs(state.order) do
    table.insert(list, state.sources[name])
  end
  return list
end
function o.source_list_release() end

-- properties ----------------------------------------------------------------

function o.obs_properties_create()
  return { list = {}, by_name = {} }
end
function o.obs_properties_destroy() end
local function add(props, prop)
  table.insert(props.list, prop)
  props.by_name[prop.name] = prop
  return prop
end
function o.obs_properties_add_text(props, name, description)
  return add(props, { name = name, description = description })
end
function o.obs_properties_add_list(props, name, description)
  return add(props, { name = name, description = description, items = {} })
end
function o.obs_properties_add_button(props, name, description, callback)
  return add(props, { name = name, description = description, callback = callback })
end
function o.obs_properties_get(props, name)
  return props.by_name[name]
end
function o.obs_property_set_description(prop, description)
  prop.description = description
end
function o.obs_property_list_clear(prop)
  prop.items = {}
end
function o.obs_property_list_add_string(prop, name, value)
  table.insert(prop.items, { name, value })
end
function o.obs_property_list_item_count(prop)
  return #prop.items
end
function o.obs_property_list_item_name(prop, i)
  return prop.items[i + 1][1]
end
function o.obs_property_list_item_string(prop, i)
  return prop.items[i + 1][2]
end

-- A webcam source's properties carry the live device list.
function o.obs_source_properties(source)
  local props = o.obs_properties_create()
  if source.id == "dshow_input" then
    local list = o.obs_properties_add_list(props, "video_device_id", "Device")
    for _, camera in ipairs(state.cameras) do
      o.obs_property_list_add_string(list, camera[1], camera[2])
    end
  end
  return props
end

-- scenes --------------------------------------------------------------------

function o.obs_scene_create(name)
  local source = o.obs_source_create("scene", name, nil)
  source.scene = { source = source, items = {} }
  return source.scene
end
function o.obs_scene_release() end
function o.obs_scene_get_source(scene)
  return scene.source
end
function o.obs_scene_from_source(source)
  return source.scene
end
function o.obs_scene_find_source(scene, name)
  for _, item in ipairs(scene.items) do
    if item.source.name == name then
      return item
    end
  end
  return nil
end
function o.obs_scene_add(scene, source)
  local item = { source = source, scene = scene, visible = true }
  table.insert(scene.items, item)
  return item
end

function o.obs_sceneitem_set_order(item, order)
  local items = item.scene.items
  for i, other in ipairs(items) do
    if other == item then
      table.remove(items, i)
      break
    end
  end
  -- items[1] is the bottom of the stack, as in OBS.
  if order == o.OBS_ORDER_MOVE_TOP then
    table.insert(items, item)
  else
    table.insert(items, 1, item)
  end
end
function o.obs_sceneitem_set_visible(item, visible)
  item.visible = visible
end
function o.obs_sceneitem_set_alignment(item, a)
  item.alignment = a
end
function o.obs_sceneitem_set_pos(item, pos)
  item.pos = { x = pos.x, y = pos.y }
end
function o.obs_sceneitem_set_bounds_type(item, t)
  item.bounds_type = t
end
function o.obs_sceneitem_set_bounds_alignment(item, a)
  item.bounds_alignment = a
end
function o.obs_sceneitem_set_bounds(item, bounds)
  item.bounds = { x = bounds.x, y = bounds.y }
end

function o.vec2()
  return { x = 0, y = 0 }
end
function o.obs_video_info()
  return {}
end
function o.obs_get_video_info(video)
  video.base_width = 1280
  video.base_height = 720
  return true
end

-- frontend ------------------------------------------------------------------

function o.obs_frontend_set_current_scene(source)
  state.current_scene = source.name
end
function o.obs_frontend_virtualcam_active()
  return state.virtualcam
end
function o.obs_frontend_start_virtualcam()
  state.virtualcam = true
end

-- hotkeys and browser events ------------------------------------------------

function o.obs_hotkey_register_frontend(id, _, callback)
  state.hotkeys[id] = callback
  return id
end
function o.obs_hotkey_load() end
function o.obs_hotkey_save()
  return nil
end
function o.calldata_create()
  return {}
end
function o.calldata_set_string(cd, k, v)
  cd[k] = v
end
function o.calldata_destroy() end
function o.obs_source_get_proc_handler(source)
  return source
end
function o.proc_handler_call(source, name, cd)
  table.insert(state.events, { source = source.name, call = name, event = cd.eventName, json = cd.jsonString })
end

-- timers ----------------------------------------------------------------------

fake.state.timers = {}
function o.timer_add(callback, ms)
  fake.state.timers[callback] = ms
end
function o.timer_remove(callback)
  fake.state.timers[callback] = nil
end

-- helpers for scenarios -----------------------------------------------------

-- Run the script's lifecycle the way OBS does when it is first added.
function fake.load(values)
  local settings = o.obs_data_create()
  script_defaults(settings)
  script_load(settings)
  for k, v in pairs(values or {}) do
    settings.values[k] = v
  end
  script_update(settings)
  fake.settings = settings
  fake.props = script_properties()
  return settings
end

function fake.press(name)
  local prop = fake.props.by_name[name]
  return prop.callback(fake.props, prop)
end

-- The scene as a list of "name:visible" from bottom to top.
function fake.stack(scene_name)
  local source = state.sources[scene_name]
  local out = {}
  for _, item in ipairs(source.scene.items) do
    table.insert(out, item.source.name .. ":" .. tostring(item.visible))
  end
  return table.concat(out, ",")
end
