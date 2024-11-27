-- Pull in the wezterm API
local wezterm = require("wezterm")

-- This will hold the configuration.
local config = wezterm.config_builder()

-- This is where you actually apply your config choices
config.font = wezterm.font_with_fallback({
	"Fira Code",
	"Monaco",
})
config.font_size = 14.0
config.adjust_window_size_when_changing_font_size = true
config.use_ime = true
config.window_background_opacity = 0.90
config.macos_window_background_blur = 20
config.window_decorations = "RESIZE"
config.show_new_tab_button_in_tab_bar = false
config.initial_rows = 40
config.initial_cols = 120
config.window_frame = {
	inactive_titlebar_bg = "none",
	active_titlebar_bg = "none",
}
config.window_background_gradient = {
	colors = { "#111111" },
}

config.visual_bell = {
	fade_in_duration_ms = 75,
	fade_out_duration_ms = 75,
	target = "CursorColor",
}

wezterm.on("format-tab-title", function(tab, tabs, panes, config, hover, max_width)
	local background = "#5c6d74"
	local foreground = "#FFFFFF"

	if tab.is_active then
		background = "#7966CC"
		foreground = "#FFFFFF"
	end

	local title = "   " .. wezterm.truncate_right(tab.active_pane.title, max_width - 1) .. "   "

	return {
		{ Background = { Color = background } },
		{ Foreground = { Color = foreground } },
		{ Text = title },
	}
end)

-- ref: https://github.com/wez/wezterm/blob/abc92e56e0565b6221935762ee0856318dbc7a34/docs/config/lua/config/macos_forward_to_ime_modifier_mask.md
-- 日本語入力時Ctrlの挙動がおかしくなるのを修正
-- ただ、ほかのCtrlを組み合わせた挙動に影響がでるかも...
config.use_ime = true
config.macos_forward_to_ime_modifier_mask = "SHIFT|CTRL"

-- exit
config.exit_behavior = "CloseOnCleanExit"

-- キーバインド
config.send_composed_key_when_left_alt_is_pressed = true

config.keys = {
	-- ⌘ + でフォントサイズを大きくする
	{
		key = "+",
		mods = "CMD|SHIFT",
		action = wezterm.action.IncreaseFontSize,
	},
	-- ⌘ w でペインを閉じる（デフォルトではタブが閉じる）
	{
		key = "w",
		mods = "CMD",
		action = wezterm.action.CloseCurrentPane({ confirm = true }),
	},
	-- ⌘ Ctrl -で下方向にペイン分割
	{
		key = "-",
		mods = "CMD|CTRL",
		action = wezterm.action({ SplitVertical = { domain = "CurrentPaneDomain" } }),
	},
	-- ⌘ Ctrl .で右方向にペイン分割
	{
		key = "|",
		mods = "CMD|CTRL",
		action = wezterm.action({ SplitHorizontal = { domain = "CurrentPaneDomain" } }),
	},
	-- ⌘ Ctrl oでペインの中身を入れ替える
	{
		key = "o",
		mods = "CMD|CTRL",
		action = wezterm.action.RotatePanes("Clockwise"),
	},
	-- ⌘ Ctrl hjklでペインの移動
	{
		key = "h",
		mods = "CMD|CTRL",
		action = wezterm.action.ActivatePaneDirection("Left"),
	},
	{
		key = "j",
		mods = "CMD|CTRL",
		action = wezterm.action.ActivatePaneDirection("Down"),
	},
	{
		key = "k",
		mods = "CMD|CTRL",
		action = wezterm.action.ActivatePaneDirection("Up"),
	},
	{
		key = "l",
		mods = "CMD|CTRL",
		action = wezterm.action.ActivatePaneDirection("Right"),
	},
	-- ⌘ Ctrl Shift hjklでペイン境界の調整
	{
		key = "h",
		mods = "CMD|CTRL|SHIFT",
		action = wezterm.action.AdjustPaneSize({ "Left", 2 }),
	},
	{
		key = "j",
		mods = "CMD|CTRL|SHIFT",
		action = wezterm.action.AdjustPaneSize({ "Down", 2 }),
	},
	{
		key = "k",
		mods = "CMD|CTRL|SHIFT",
		action = wezterm.action.AdjustPaneSize({ "Up", 2 }),
	},
	{
		key = "l",
		mods = "CMD|CTRL|SHIFT",
		action = wezterm.action.AdjustPaneSize({ "Right", 2 }),
	},
	-- CMD Enter でフルスクリーン切り替え
	{
		key = "Enter",
		mods = "CMD",
		action = wezterm.action.ToggleFullScreen,
	},
}

-- マウス操作の挙動設定
config.mouse_bindings = {
	-- 右クリックでクリップボードから貼り付け
	{
		event = { Down = { streak = 1, button = "Right" } },
		mods = "NONE",
		action = wezterm.action.PasteFrom("Clipboard"),
	},
}
-- and finally, return the configuration to wezterm
return config
