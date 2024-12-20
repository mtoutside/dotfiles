return {
  "nvim-telescope/telescope.nvim",
  keys = {
    -- disable the keymap to grep files
    { "<Leader>/", false },
    { "<Leader><space>", false },
    -- change a keymap
    -- add a keymap to browse plugin files
    {
      "<Leader>fp",
      function()
        require("telescope.builtin").find_files({ cwd = require("lazy.core.config").options.root })
      end,
      desc = "Find Plugin File",
    },
  },
}
