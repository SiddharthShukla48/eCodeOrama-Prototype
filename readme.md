# eCodeOrama

An interactive flow visualization tool for MIT Scratch programs that extracts, visualizes, and enhances the understanding of event relationships and code execution flow.

## Overview

eCodeOrama provides educators and students with a powerful tool to visualize the flow of Scratch programs, making it easier to understand complex event-driven applications. The tool follows the CodeOrama visualization specification while extending it with interactive capabilities and automated generation.

## Features

- **SB3 File Parsing**: Extract program structure from Scratch 3.0 files
- **Event Analysis**: Identify all event types (green flag clicks, broadcasts, key presses, etc.)
- **Relationship Visualization**: Show connections between event triggers and handlers
- **Interactive Layout**: Customize sprite order, event order, and visualization settings
- **Multiple Views**:
  - Block View: See original Scratch blocks rendered by official Scratch Repositories.
  - CodeOrama View: Table-based visualization of events and handlers
  - Text Report: Detailed text analysis of program structure

## Technical Stack

- **Core Technologies**:
  - HTML5/CSS3/JavaScript (ES6+)
  - Blockly (Google's visual programming library)
  - Scratch Parser - for parsing SB3 files.
  - Scratch VM - Official Scratch foundation's library for rendering scratch blocks.
  - JSZip (for extracting SB3 files)
  - SVG/Canvas (for visualizations)

- **Development Tools**:
  - Git version control
  - npm for package management
  - ESLint for code quality

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Node.js and npm (for development)

