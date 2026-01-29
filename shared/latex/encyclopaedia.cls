% The Encyclopædia LaTeX Class (v1)
% Conservative, durable layout for A4 hardbound volumes
% Supports two-column canonical text with outer-margin marginalia

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{encyclopaedia}[2026/01/29 The Encyclopædia v1]

% Base class: book, 11pt, two-column, openany (chapters can start on any page)
\LoadClass[11pt,twocolumn,openany]{book}

% Required packages
\RequirePackage[a4paper,
  inner=30mm,        % binding + thumb space
  outer=40mm,        % marginalia lives here
  top=25mm,
  bottom=30mm,
  columnsep=8mm
]{geometry}

\RequirePackage{libertinus}
\RequirePackage{libertinus-otf}

% Line spacing and paragraph formatting
\linespread{1.05}
\setlength{\parindent}{1em}
\setlength{\parskip}{0pt}

% Marginalia system
\RequirePackage{marginnote}
\reversemarginpar  % places notes in outer margin
\renewcommand{\marginfont}{\footnotesize}

% Entry headings
\RequirePackage{titlesec}

% Entry titles span both columns
\titleformat{\section}
  {\normalfont\Large\bfseries}
  {}
  {0pt}
  {\centering}

% Footnotes (sparing use)
\RequirePackage[hang,flushmargin]{footmisc}

% Figures (future-proofed)
\RequirePackage{graphicx}

% Page numbers and running heads
\RequirePackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[C]{\thepage}
\fancyhead[LE]{\leftmark}
\fancyhead[RO]{\rightmark}

% Marginalia command
% Usage: \marginalia{Author}{Type (Year)}{Body text}
\newcommand{\marginalia}[3]{%
  \marginnote{%
    \footnotesize
    \textit{#1} \\
    \textbf{#2} \\
    #3
  }%
}

% Entry command for spanning both columns
% Usage: \entry{Title}
\newcommand{\entry}[1]{%
  \onecolumn
  \vspace*{0.5\baselineskip}
  \begin{center}
    \Large\bfseries #1
  \end{center}
  \vspace*{0.5\baselineskip}
  \twocolumn
}

% End of class
\endinput
