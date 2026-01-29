% The Encyclopædia LaTeX Class (v1)
% Conservative, durable layout for A4 hardbound volumes
% Supports two-column canonical text with outer-margin marginalia

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{encyclopaedia}[2026/01/29 The Encyclopædia v1]

% Base class: book, 11pt, two-column, openany (chapters can start on any page)
\LoadClass[11pt,twocolumn,openany]{book}

% Required packages
% Britannica-style margins: generous outer margin for marginalia
\RequirePackage[a4paper,
  inner=25mm,        % binding + thumb space (slightly tighter)
  outer=45mm,        % marginalia lives here (more space)
  top=20mm,          % tighter top for more content
  bottom=25mm,       % adequate bottom margin
  columnsep=10mm     % clear column separation
]{geometry}

\RequirePackage{libertinus}
\RequirePackage{libertinus-otf}

% Line spacing and paragraph formatting (Britannica-style: dense, readable)
\linespread{1.0}
\setlength{\parindent}{1em}
\setlength{\parskip}{0pt}
\setlength{\baselineskip}{1.1em}

% Marginalia system
\RequirePackage{marginnote}
\reversemarginpar  % places notes in outer margin
\renewcommand{\marginfont}{\footnotesize}

% Entry headings (Britannica-style: bold, uppercase, centered)
\RequirePackage{titlesec}

% Entry titles span both columns
\titleformat{\section}
  {\normalfont\Large\bfseries}
  {}
  {0pt}
  {\centering\MakeUppercase}

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

% Entry command for spanning both columns (Britannica-style)
% Usage: \entry{Title}
\newcommand{\entry}[1]{%
  \onecolumn
  \vspace*{0.3\baselineskip}
  \begin{center}
    \Large\bfseries\MakeUppercase{#1}
  \end{center}
  \vspace*{0.2\baselineskip}
  \markboth{#1}{#1}  % Set running header
  \twocolumn
}

% End of class
\endinput
