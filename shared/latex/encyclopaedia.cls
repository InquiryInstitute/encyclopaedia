% The Encyclopædia LaTeX Class (v1)
% Conservative, durable layout for A4 hardbound volumes
% Supports two-column canonical text with outer-margin marginalia

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{encyclopaedia}[2026/01/29 The Encyclopædia v1]

% Base class: book, 11pt, two-column, openany (chapters can start on any page)
% twocolumn option enables two-column mode globally
\LoadClass[11pt,twocolumn,openany]{book}

% Ensure two-column mode is the default after title page and TOC
% The twocolumn option should handle this, but we'll enforce it explicitly

% Required packages
% Britannica-style margins: generous outer margin for marginalia
\RequirePackage[a4paper,
  inner=25mm,        % binding + thumb space (slightly tighter)
  outer=45mm,        % marginalia lives here (more space)
  top=20mm,          % tighter top for more content
  bottom=25mm,       % adequate bottom margin
  columnsep=10mm     % clear column separation
]{geometry}

\RequirePackage[utf8]{inputenc}
\RequirePackage[T1]{fontenc}
% Use Type1 Libertinus fonts for pdflatex compatibility
% libertinus-otf requires XeLaTeX/LuaLaTeX, so we use libertinus (Type1) instead
\RequirePackage{libertinus}

% Line spacing and paragraph formatting (Britannica-style: dense, readable)
\linespread{1.0}
\setlength{\parindent}{1em}
\setlength{\parskip}{0pt}
\setlength{\baselineskip}{1.1em}

% Marginalia system
% Use marginnote package which handles stacking automatically
\RequirePackage{marginnote}
% Configure for outer margin placement
\reversemarginpar  % places notes in outer margin
\setlength{\marginparsep}{8mm}  % Space between text and margin note
\setlength{\marginparwidth}{35mm}  % Width of margin notes (fits in 45mm outer margin)
% Enable automatic stacking to prevent overlaps
% marginnote automatically stacks notes vertically
\makeatletter
% Ensure marginnote works in two-column mode
\@ifpackageloaded{marginnote}{%
  % marginnote handles stacking automatically
  % Set minimum vertical separation between stacked notes
  \setlength{\marginparpush}{0.3\baselineskip}
}{}
\makeatother
\renewcommand{\marginfont}{\footnotesize}

% Entry headings (Britannica-style: bold, uppercase, centered)
\RequirePackage{titlesec}

% Disable ALL section/chapter numbering (no labels at all)
\setcounter{secnumdepth}{-1}
\setcounter{tocdepth}{2}  % Still show in TOC, but unnumbered

% Make all sections unnumbered (no chapter/section labels)
\titleformat{\section}
  {\normalfont\Large\bfseries}
  {}
  {0pt}
  {\centering\MakeUppercase}

\titleformat{\chapter}
  {\normalfont\Large\bfseries}
  {}
  {0pt}
  {\centering\MakeUppercase}

% Ensure no chapter labels appear
\renewcommand{\@chapapp}{}
\renewcommand{\chaptername}{}

% Footnotes (sparing use)
\RequirePackage[hang,flushmargin]{footmisc}

% Figures (future-proofed)
\RequirePackage{graphicx}

% Page numbers and running heads (Britannica-style)
\RequirePackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
% Page numbers at bottom center
\fancyfoot[C]{\thepage}
% Running headers: Volume title on left, entry range on right
\fancyhead[LE]{\small\textsc{The Encyclopædia}}
\fancyhead[RO]{\small\textsc{Volume \volumenum: \volumetitle}}
\fancyhead[LO]{\small\leftmark}
\fancyhead[RE]{\small\rightmark}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Marginalia command (Britannica-style: compact, in outer margin)
% Usage: \marginalia{Author}{Type (Year)}{Body text}
% Use \marginnote which handles stacking automatically
\newcommand{\marginalia}[3]{%
  \marginnote{%
    \footnotesize
    \raggedright
    \textit{#1}\\
    \textbf{#2}\\
    \vspace*{0.1em}
    #3
  }%
}

% Author signature with frontal bust (Britannica-style: end of entry, restrained)
% Usage: \authorsignature{Author Name}{Image Path}
% If image path is empty, just shows name
\newcommand{\authorsignature}[2]{%
  \vspace*{0.5\baselineskip}
  \begin{center}
    \def\temp{#2}%
    \ifx\temp\empty
      % No image, just name
      \textsc{--- #1}
    \else
      % With frontal bust portrait
      \begin{minipage}{0.15\textwidth}
        \centering
        \includegraphics[width=\textwidth,height=2cm,keepaspectratio]{#2}
      \end{minipage}%
      \hspace{0.5em}%
      \begin{minipage}{0.8\textwidth}
        \centering
        \textsc{--- #1}
      \end{minipage}
    \fi
  \end{center}
  \vspace*{0.3\baselineskip}
}

% Entry command for spanning both columns (Britannica-style)
% Usage: \entry{Title}
% This temporarily switches to onecolumn for the title, then back to twocolumn
% Note: \twocolumn starts a new page, so we use \twocolumn[title] syntax
\newcommand{\entry}[1]{%
  \twocolumn[%
    \vspace*{0.3\baselineskip}%
    \begin{center}%
      \Large\bfseries\MakeUppercase{#1}%
    \end{center}%
    \vspace*{0.2\baselineskip}%
    \markboth{#1}{#1}%  Set running header
  ]%
  % Ensure two-column mode is active
  \setlength{\columnsep}{10mm}
  \@twocolumntrue
}

% Volume metadata for running headers (set in main .tex file)
\newcommand{\volumenum}{}
\newcommand{\volumetitle}{}
\newcommand{\subtitle}{} % For the main title page subtitle

% Custom maketitle for Britannica-style title page
\renewcommand{\maketitle}{%
  \thispagestyle{empty}
  \onecolumn
  \vspace*{\fill}
  \begin{center}
    {\Huge\bfseries THE ENCYCLOPÆDIA}\\[1.5\baselineskip]
    {\Large\bfseries \@title}\\[1\baselineskip]
    {\large\bfseries \subtitle}\\[2\baselineskip]
    {\Large\bfseries \@author}\\[1\baselineskip]
    {\large \@date}
  \end{center}
  \vspace*{\fill}
  \cleardoublepage
  % Force two-column mode for entries (after TOC)
  \twocolumn
  \setlength{\columnsep}{10mm}
  \@twocolumntrue
}

% End of class
\endinput
