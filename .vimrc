call plug#begin()
	Plug 'tomasr/molokai'
	Plug 'jacoborus/tender.vim'
	Plug 'itchyny/lightline.vim'
	Plug 'mattn/emmet-vim'
	Plug 'lambdalisue/vim-unified-diff' "vimdiffをhistogramアルゴリズムに変更
	Plug 'pangloss/vim-javascript', { 'for': ['javascript', 'javascript.jsx'] }
call plug#end()

set title "編集中ファイル名の表示
set showmatch "括弧入力時に対応する括弧を示す
set list "タブ、空白、改行を可視化
set visualbell "ビープ音を視覚表示
set laststatus=2 "ステータスを表示
syntax on
set nu
set hidden

"===== 文字、カーソル設定 =====
set fileencodings=utf-8,cp932,euc-jp,sjis "ファイルを読み込む時の、文字コード自動判別の順番
set fenc=utf-8 "文字コードを指定
set virtualedit=onemore "カーソルを行末の一つ先まで移動可能にする
set autoindent "自動インデント
set smartindent "オートインデント
set tabstop=2 "インデントをスペース2つ分に設定
set shiftwidth=2 "自動的に入力されたインデントの空白を2つ分に設定
"set listchars=tab:▸\ ,eol:↲,extends:❯,precedes:❮ "不可視文字の指定
set listchars=tab:▸\ ,eol:$,extends:❯,precedes:❮ "不可視文字の指定
set whichwrap=b,s,h,l,<,>,[,],~ "行頭、行末で行のカーソル移動を可能にする
set backspace=indent,eol,start "バックスペースでの行移動を可能にする
"let &t_ti.="\e[5 q" "カーソルの形状を変更
"ヤンクをクリップボードに連携
set clipboard=unnamed,autoselect
"===== 検索設定 =====
set ignorecase "大文字、小文字の区別をしない
set smartcase "大文字が含まれている場合は区別する
set wrapscan "検索時に最後まで行ったら最初に戻る
set hlsearch "検索した文字を強調
set incsearch "インクリメンタルサーチを有効にする
 

"===== マウス設定 =====
set mouse=a
set ttymouse=xterm2

"===== キー入力 =====
"方向キーの無効化 
noremap <Up> <Nop>
noremap <Down> <Nop>
noremap <Left> <Nop>
noremap <Right> <Nop>
inoremap <Up> <Nop>
inoremap <Down> <Nop>
inoremap <Left> <Nop>
inoremap <Right> <Nop>

"入力モード時のカーソル移動
inoremap <C-j> <Down>
inoremap <C-k> <Up>
inoremap <C-h> <Left>
inoremap <C-l> <Right>
"行頭へ移動
inoremap <C-a> <C-o>^
"行末へ移動
inoremap <C-e> <C-o>$
"jキーを二度押しでESCキー
"inoremap <silent> jj <Esc>
"inoremap <silent> っj <ESC>

"ノーマルモードでshift+oで空行追加
"nnoremap O :<C-u>call append(expand('.'), '')<Cr>j
"ノーマルモードでspace+enterで空行追加
nnoremap <Space><CR> :<C-u>call append(expand('.'), '')<Cr>j

"space+cで新規タブ,<C-n>で次、<C-p>で前のタブ
nnoremap <Space>c  :tabnew<CR> 
nnoremap <C-n> gt
nnoremap <C-p> gT
"===== その他 =====
"履歴を10000件保存
set history=10000

" 全角スペースの背景を白に変更
autocmd Colorscheme * highlight FullWidthSpace ctermbg=white
autocmd VimEnter * match FullWidthSpace /　/
"カラースキーマの適用
"colorscheme molokai
colorscheme tender
" set lighline theme inside lightline config
if !has('gui_running')
  set t_Co=256
endif

let g:lightline = { 'colorscheme': 'tender' }

"########### backup作らせない
set noswapfile
set nobackup
set noundofile


