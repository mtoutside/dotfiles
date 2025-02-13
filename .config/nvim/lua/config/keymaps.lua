-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- 入力モード時のカーソル移動
vim.api.nvim_set_keymap("i", "<C-j>", "<Down>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("i", "<C-k>", "<Up>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("i", "<C-b>", "<Left>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("i", "<C-f>", "<Right>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("i", "<C-h>", "<BS>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("i", "<C-d>", "<Del>", { noremap = true, silent = true })

-- 行頭へ移動
vim.api.nvim_set_keymap("i", "<C-a>", "<C-o>^", { noremap = true, silent = true })

-- 行末へ移動
vim.api.nvim_set_keymap("i", "<C-e>", "<C-o>$", { noremap = true, silent = true })

-- jキーを二度押しでESCキー
vim.api.nvim_set_keymap("i", "jj", "<Esc>", { noremap = true, silent = true })
vim.api.nvim_set_keymap("i", "っj", "<Esc>", { noremap = true, silent = true })

-- ノーマルモードでspace+enterで空行追加
vim.api.nvim_set_keymap(
  "n",
  "<Space><CR>",
  ':<C-u>call append(expand("."), "")<CR>j',
  { noremap = true, silent = true }
)

-- <Leader>w で保存
vim.api.nvim_set_keymap("n", "<Leader>w", ":w<CR>", { noremap = true, silent = true })

-- <C-j>でJsDoc展開
vim.api.nvim_set_keymap("n", "<C-j>", "<Plug>(jsdoc)", { noremap = true, silent = true })

-- Use <tab> for jump to next placeholder.
-- vim.g.coc_snippet_next = "<tab>"

-- Use <C-k> for jump to previous placeholder, it's default of coc.nvim
-- vim.g.coc_snippet_prev = "<C-k>"

-- Use <C-j> for both expand and jump (make expand higher priority.)
-- vim.api.nvim_set_keymap("i", "<C-j>", "<Plug>(coc-snippets-expand-jump)", { noremap = true, silent = true })

-- でレジスタ上書きしない
vim.api.nvim_set_keymap("n", "X", '"_X', { noremap = true, silent = true })
vim.api.nvim_set_keymap("v", "X", '"_X', { noremap = true, silent = true })
vim.api.nvim_set_keymap("n", "s", '"_s', { noremap = true, silent = true })
vim.api.nvim_set_keymap("v", "s", '"_s', { noremap = true, silent = true })
vim.api.nvim_set_keymap("n", "S", '"_S', { noremap = true, silent = true })
vim.api.nvim_set_keymap("v", "S", '"_S', { noremap = true, silent = true }) -- Add any additional keymaps here

-- telescope
-- local builtin = require("telescope.builtin")
-- vim.keymap.set("n", "<leader>fg", builtin.live_grep, { desc = "Telescope live grep" })
-- vim.keymap.set("n", "<leader>fb", builtin.buffers, { desc = "Telescope buffers" })
-- vim.keymap.set("n", "<leader>fh", builtin.help_tags, { desc = "Telescope help tags" })
