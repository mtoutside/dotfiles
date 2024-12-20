return {
  "olrtg/nvim-emmet",
  keys = {
    {
      "<C-y>,",
      mode = { "n", "v" },
      function()
        require("nvim-emmet").wrap_with_abbreviation()
      end,
      desc = "emmet abbreviation",
    },
  },
}
