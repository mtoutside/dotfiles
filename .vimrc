call plug#begin()
	Plug 'tomasr/molokai'
	Plug 'jacoborus/tender.vim'
	Plug 'itchyny/lightline.vim'
	Plug 'mattn/emmet-vim'
	Plug 'lambdalisue/vim-unified-diff' "vimdiffをhistogramアルゴリズムに変更
	Plug 'editorconfig/editorconfig-vim'
	Plug 'nathanaelkane/vim-indent-guides'
	Plug 'mustache/vim-mustache-handlebars' " handlebarsシンタックス
	Plug 'tomlion/vim-solidity'
	Plug 'othree/yajs.vim'
	Plug 'othree/html5.vim'
	Plug 'sophacles/vim-processing'
	Plug 'tikhomirov/vim-glsl'
	Plug 'rust-lang/rust.vim'
	Plug 'posva/vim-vue'
	Plug 'SirVer/ultisnips'
	Plug 'mlaursen/vim-react-snippets'
	Plug 'scrooloose/nerdtree' "ツリー表示
	Plug 'tomtom/tcomment_vim' "コメントにする <C- _+ _>
	Plug 'airblade/vim-gitgutter'
	Plug 'tpope/vim-fugitive'
	Plug 'tmhedberg/matchit' " %機能の拡張
	Plug 'sheerun/vim-polyglot' " 構文解析
	Plug 'tpope/vim-surround' " サラウンド cs[変えるもの][変えたいもの], dsで削除, ysでも
  Plug '/usr/local/opt/fzf'
	if isdirectory("/usr/local/opt/fzf")
		Plug '/usr/local/opt/fzf'
	else
		Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --all' } " M1 macの場合fzfの場所が異なるので新たにインストール
	endif
  Plug 'junegunn/fzf.vim'
  Plug 'neoclide/coc.nvim', {'branch': 'release'}
  Plug 'antoinemadec/coc-fzf'
call plug#end()

set title "編集中ファイル名の表示
set showmatch "括弧入力時に対応する括弧を示す
set list "タブ、空白、改行を可視化
set visualbell "ビープ音を視覚表示
set laststatus=2 "ステータスを表示
syntax on
au BufNewFile,BufRead *.ejs set filetype=html "ejsの時にsyantax=htmlにする
autocmd! BufNewFile,BufRead *.vs,*.fs set ft=glsl "for GLSL
set nu
set hidden

"===== 文字、カーソル設定 =====
set encoding=utf-8
set fileencodings=utf-8,cp932,euc-jp,sjis "ファイルを読み込む時の、文字コード自動判別の順番
set fenc=utf-8 "文字コードを指定
set virtualedit=onemore "カーソルを行末の一つ先まで移動可能にする
set autoindent "自動インデント
set smartindent "オートインデント
let g:indent_guides_enable_on_vim_startup = 1 "インデント可視化
set tabstop=2 "インデントをスペース2つ分に設定
set shiftwidth=2 "自動的に入力されたインデントの空白を1つ分に設定
set expandtab
"set listchars=tab:▸\ ,eol:↲,extends:❯,precedes:❮ "不可視文字の指定
set listchars=tab:▸\ ,eol:$,extends:❯,precedes:❮ "不可視文字の指定
set whichwrap=b,s,h,l,<,>,[,],~ "行頭、行末で行のカーソル移動を可能にする
set backspace=indent,eol,start "バックスペースでの行移動を可能にする
set cursorline " カーソルラインをハイライト
"let &t_ti.="\e[5 q" "カーソルの形状を変更
"ヤンクをクリップボードに連携
"クリップボードからペーストする時だけインデントしない
set clipboard=unnamed,autoselect
if &term =~ "xterm"
    let &t_SI .= "\e[?2004h"
    let &t_EI .= "\e[?2004l"
    let &pastetoggle = "\e[201~"

    function XTermPasteBegin(ret)
        set paste
        return a:ret
    endfunction

    inoremap <special> <expr> <Esc>[200~ XTermPasteBegin("")
endif

set wildmenu wildmode=list:full
"===== 検索設定 =====
set ignorecase "大文字、小文字の区別をしない
set smartcase "大文字が含まれている場合は区別する
set wrapscan "検索時に最後まで行ったら最初に戻る
set hlsearch "検索した文字を強調
nnoremap <F3> :noh<CR> "検索ハイライトをF3で切り替え
set incsearch "インクリメンタルサーチを有効にする

"===== マウス設定 =====
set mouse=a
set ttymouse=xterm2

"===== キー入力 =====
"<Leader>にスペースを設定
let mapleader = "\<Space>"
"入力モード時のカーソル移動
inoremap <C-j> <Down>
inoremap <C-k> <Up>
inoremap <C-b> <Left>
inoremap <C-f> <Right>
inoremap <C-h> <BS>
inoremap <C-d> <Del>
"行頭へ移動
inoremap <C-a> <C-o>^
"行末へ移動
inoremap <C-e> <C-o>$
"jキーを二度押しでESCキー
inoremap <silent> jj <Esc>
inoremap <silent> っj <ESC>

"ノーマルモードでspace+enterで空行追加
nnoremap <Space><CR> :<C-u>call append(expand('.'), '')<Cr>j

" <Leader>w で保存
nnoremap <silent> <Leader>w :w<CR>

" <Leader>b でfzfの :Buffers実行
nnoremap <silent> <Leader>b :Buffers<CR>

" <Leader> + n でNERDTreeの表示きりかえ
nnoremap <silent> <Leader>n :NERDTreeToggle<CR>
"スペース2回でCocList
nnoremap <silent> <Leader><Leader> :<C-u>CocList<CR>
"スペースhでhover
nnoremap <silent> <Leader>h :<C-u>call CocAction('doHover')<CR>
"スペースdfでDefinition
nnoremap <silent> <Leader>df <Plug>(coc-definition)
"スペースrfでReferences
nnoremap <silent> <Leader>rf <Plug>(coc-references)
"スペースrnでRename
nnoremap <silent> <Leader>rn <Plug>(coc-rename)
"スペースfmtでFormat
nnoremap <silent> <Leader>fmt <Plug>(coc-format)

" ====================
" coc-prettier 
" ====================
" :CocInstall coc-prettier を実行
" <Leader>p でprettier実行
nnoremap <silent> <Leader>p :CocCommand prettier.formatFile<CR>

" ====================
" coc-snippets 
" ====================
" :CocInstall coc-snippets を実行
" Use <C-l> for trigger snippet expand.
imap <C-l> <Plug>(coc-snippets-expand)

" Use <C-j> for select text for visual placeholder of snippet.
vmap <C-j> <Plug>(coc-snippets-select)

" Use <tab> for jump to next placeholder.
let g:coc_snippet_next = '<tab>'

" Use <C-k> for jump to previous placeholder, it's default of coc.nvim
let g:coc_snippet_prev = '<c-k>'

" Use <C-j> for both expand and jump (make expand higher priority.)
imap <C-j> <Plug>(coc-snippets-expand-jump)

" Use <leader>x for convert visual selected code to snippet
xmap <leader>x  <Plug>(coc-convert-snippet)

function! CheckBackSpace() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

inoremap <silent><expr> <TAB>
	\ coc#pum#visible() ? coc#_select_confirm() :
	\ coc#expandableOrJumpable() ? "\<C-r>=coc#rpc#request('doKeymap', ['snippets-expand-jump',''])\<CR>" :
	\ CheckBackSpace() ? "\<TAB>" :
	\ coc#refresh()

"でレジスタ上書きしない
nnoremap X "_X
vnoremap X "_X
nnoremap s "_s
vnoremap s "_s
nnoremap S "_S
vnoremap S "_S
"===== その他 =====
"履歴を10000件保存
set history=10000

"########### backup作らせない
set noswapfile
set nobackup
set noundofile

" 全角スペースの背景を白に変更
autocmd Colorscheme * highlight FullWidthSpace ctermbg=white
autocmd VimEnter * match FullWidthSpace /　/

" カラースキーマ
" scssのクラス名の色変更
autocmd Colorscheme * highlight scssSelectorName ctermfg=142 guifg=#9faa00
" テーマ適用
colorscheme tender

" ====================
" lightline.vim
" ====================
" set lighline theme inside lightline config
if !has('gui_running')
  set t_Co=256
endif

let g:lightline = { 
	\ 'colorscheme': 'tender',
	\ 'component_function': {
	\ 'gitgutter': 'MyGitGutter',
	\ 'gitbranch': 'fugitiveHead',
  \ 'coc': 'coc#status'
	\ },
	\ 'active': {
	\   'left': [ [ 'mode', 'paste' ],
	\             [ 'gitbranch', 'readonly', 'filename', 'modified' ] ],
	\   'right': [ ['coc'] ]
	\ },
	\ }

function! MyGitGutter()
  if ! exists('*GitGutterGetHunkSummary')
        \ || ! get(g:, 'gitgutter_enabled', 0)
        \ || winwidth('.') <= 90
    return ''
  endif
  let symbols = [
        \ g:gitgutter_sign_added . ' ',
        \ g:gitgutter_sign_modified . ' ',
        \ g:gitgutter_sign_removed . ' '
        \ ]
  let hunks = GitGutterGetHunkSummary()
  let ret = []
  for i in [0, 1, 2]
    if hunks[i] > 0
      call add(ret, symbols[i] . hunks[i])
    endif
  endfor
  return join(ret, ' ')
endfunction

" ====================
" NERDTree
" ====================
" 表示幅
let g:NERDTreeWinSize=20

" 隠しファイルを表示
let g:NERDTreeShowHidden=1

" 非表示ファイル
let g:NERDTreeIgnore=['\.git$', '\.clean$', '\.swp$', '\.bak$', '\~$']

augroup vimrc_nerdtree
  autocmd!
  " 他のバッファをすべて閉じた時にNERDTreeが開いていたらNERDTreeも一緒に閉じる。
  autocmd bufenter * if (winnr('$') == 1 && exists('b:NERDTree') && b:NERDTree.isTabTree()) | q | endif


" :SyntaxInfo でカーソル下のシンタックス名表示
function! s:get_syn_id(transparent)
  let synid = synID(line("."), col("."), 1)
  if a:transparent
    return synIDtrans(synid)
  else
    return synid
  endif
endfunction
function! s:get_syn_attr(synid)
  let name = synIDattr(a:synid, "name")
  let ctermfg = synIDattr(a:synid, "fg", "cterm")
  let ctermbg = synIDattr(a:synid, "bg", "cterm")
  let guifg = synIDattr(a:synid, "fg", "gui")
  let guibg = synIDattr(a:synid, "bg", "gui")
  return {
        \ "name": name,
        \ "ctermfg": ctermfg,
        \ "ctermbg": ctermbg,
        \ "guifg": guifg,
        \ "guibg": guibg}
endfunction
function! s:get_syn_info()
  let baseSyn = s:get_syn_attr(s:get_syn_id(0))
  echo "name: " . baseSyn.name .
        \ " ctermfg: " . baseSyn.ctermfg .
        \ " ctermbg: " . baseSyn.ctermbg .
        \ " guifg: " . baseSyn.guifg .
        \ " guibg: " . baseSyn.guibg
  let linkedSyn = s:get_syn_attr(s:get_syn_id(1))
  echo "link to"
  echo "name: " . linkedSyn.name .
        \ " ctermfg: " . linkedSyn.ctermfg .
        \ " ctermbg: " . linkedSyn.ctermbg .
        \ " guifg: " . linkedSyn.guifg .
        \ " guibg: " . linkedSyn.guibg
endfunction
command! SyntaxInfo call s:get_syn_info()

" emmet設定
let g:user_emmet_settings = {
\  'javascript' : {
\      'extends' : 'jsx',
\  },
\}
