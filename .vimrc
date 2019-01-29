call plug#begin()
	Plug 'tomasr/molokai'
	Plug 'jacoborus/tender.vim'
	Plug 'itchyny/lightline.vim'
	Plug 'mattn/emmet-vim'
	Plug 'lambdalisue/vim-unified-diff' "vimdiffをhistogramアルゴリズムに変更
	Plug 'editorconfig/editorconfig-vim'
	Plug 'nathanaelkane/vim-indent-guides'
	Plug 'ternjs/tern_for_vim'
	Plug 'othree/yajs.vim'
	Plug 'othree/html5.vim'
	Plug 'sophacles/vim-processing'
	Plug 'tikhomirov/vim-glsl'
	Plug 'scrooloose/nerdtree' "ツリー表示
	Plug 'tomtom/tcomment_vim' "コメントにする <C- _+ _>
call plug#end()

set title "編集中ファイル名の表示
set showmatch "括弧入力時に対応する括弧を示す
set list "タブ、空白、改行を可視化
set visualbell "ビープ音を視覚表示
set laststatus=2 "ステータスを表示
syntax on
au BufNewFile,BufRead *.ejs set filetype=html "ejsの時にsyantax=htmlにする
autocmd! BufNewFile,BufRead *.vs,*.fs set ft=glsl "for GLSL
let g:deoplete#enable_at_startup = 1
set nu
set hidden

"===== 文字、カーソル設定 =====
set fileencodings=utf-8,cp932,euc-jp,sjis "ファイルを読み込む時の、文字コード自動判別の順番
set fenc=utf-8 "文字コードを指定
set virtualedit=onemore "カーソルを行末の一つ先まで移動可能にする
set autoindent "自動インデント
set smartindent "オートインデント
let g:indent_guides_enable_on_vim_startup = 1 "インデント可視化
set tabstop=2 "インデントをスペース2つ分に設定
set shiftwidth=2 "自動的に入力されたインデントの空白を2つ分に設定
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

"ノーマルモードでshift+oで空行追加
"nnoremap O :<C-u>call append(expand('.'), '')<Cr>j
"ノーマルモードでspace+enterで空行追加
nnoremap <Space><CR> :<C-u>call append(expand('.'), '')<Cr>j
"ノーマルモードでenterで改行追加
nnoremap <CR> i<Return><Esc>^k

"space+cで新規タブ,<C-n>で次、<C-p>で前のタブ
nnoremap <Space>c  :tabnew<CR> 
nnoremap <C-n> gt
nnoremap <C-p> gT
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


