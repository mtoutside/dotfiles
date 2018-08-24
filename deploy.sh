#!/bin/bash
set -Ceu

DOT_DIRECTORY="${HOME}/dotfiles"

cd ${DOT_DIRECTORY}

  for f in .??*
  do
      # If you have ignore files, add file/directory name here
      [[ ${f} = ".git" ]] && continue
      [[ ${f} = ".gitignore" ]] && continue
      ln -snfv ${DOT_DIRECTORY}/${f} ${HOME}/${f}
  done
  echo $(tput setaf 2)Deploy dotfiles complete!. ✔︎$(tput sgr0)

