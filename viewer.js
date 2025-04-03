// A simple SB3 project loader and block viewer
async function loadSB3(file) {
  try {
    console.log('Selected file:', file.name, 'size:', file.size);
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const projectJSON = await zip.file("project.json").async("text");
    return JSON.parse(projectJSON);
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('file-input');
  const errorMessageEl = document.getElementById('error-message');
  
  // Initialize the block workspace without a toolbox
  const workspace = Blockly.inject('blocks-workspace', {
    media: 'scratch-blocks/media/',
    zoom: { controls: true, wheel: true, startScale: 0.75 },
    scrollbars: true,
    toolbox: null, // Remove the toolbox by setting to null
    colours: {
      workspace: '#F9F9F9',
      flyout: '#F9F9F9',
      toolbox: '#FFFFFF',
      toolboxSelected: '#E9EEF2',
      scrollbar: '#CECDCE',
      scrollbarHover: '#CECDCE'
    }
  });

  // Hide toolbox elements after initialization
  setTimeout(() => {
    // Hide toolbox and category menu
    const toolboxDiv = document.querySelector('.blocklyToolboxDiv');
    if (toolboxDiv) toolboxDiv.style.display = 'none';
    
    const categoryMenu = document.querySelector('.scratchCategoryMenu');
    if (categoryMenu) categoryMenu.style.display = 'none';
    
    // Hide flyout panel and its background
    const flyout = document.querySelector('.blocklyFlyout');
    if (flyout) flyout.style.display = 'none';
    
    const flyoutBackground = document.querySelector('.blocklyFlyoutBackground');
    if (flyoutBackground) flyoutBackground.style.display = 'none';
    
    const flyoutScrollbar = document.querySelector('.blocklyFlyoutScrollbar');
    if (flyoutScrollbar) flyoutScrollbar.style.display = 'none';
    
    // Adjust workspace size to fill the space
    workspace.resize();
  }, 100);
  
  // Add required block definitions that might be missing
  registerMissingBlockDefinitions();
  
  fileInput.addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("Starting file processing for:", file.name);
    errorMessageEl.textContent = '';
    errorMessageEl.style.display = 'none';
    
    try {
      // Show loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.id = 'loading-indicator';
      loadingIndicator.textContent = 'Loading project...';
      loadingIndicator.style.padding = '10px';
      loadingIndicator.style.backgroundColor = '#f0f0f0';
      loadingIndicator.style.border = '1px solid #ccc';
      loadingIndicator.style.margin = '10px 0';
      document.querySelector('.upload-section').appendChild(loadingIndicator);
      
      console.time('File Load');
      // Phase 1: Convert file to buffer
      const buffer = await file.arrayBuffer();
      console.log("File converted to buffer, size:", buffer.byteLength);
      
      // Phase 2: Load with JSZip
      console.time('JSZip Load');
      const zip = await JSZip.loadAsync(buffer);
      console.timeEnd('JSZip Load');
      console.log("ZIP loaded, files:", Object.keys(zip.files).length);
      
      // Phase 3: Extract project.json
      console.time('JSON Extract');
      const projectFile = zip.file("project.json");
      if (!projectFile) {
        throw new Error("project.json not found in the SB3 file");
      }
      const projectJSON = await projectFile.async("text");
      console.timeEnd('JSON Extract');
      console.log("Project JSON extracted, length:", projectJSON.length);
      
      // Phase 4: Parse JSON
      console.time('JSON Parse');
      const project = JSON.parse(projectJSON);
      console.timeEnd('JSON Parse');
      console.log("Project parsed, targets:", project.targets ? project.targets.length : 0);
      
      // Clear workspace before rendering
      workspace.clear();
      
      // Phase 5: Render blocks
      console.time('Render Blocks');
      let yOffset = 0;
      for (const target of (project.targets || [])) {
        console.log(`Rendering target: ${target.name || "Unnamed"}`);
        if (!target.blocks) continue;
        
        const blockCount = renderSpriteBlocks(target.blocks, workspace, yOffset, target.name);
        console.log(`Rendered ${blockCount} blocks for target ${target.name}`);
        yOffset += blockCount * 120 + 50;
      }
      console.timeEnd('Render Blocks');
      
      workspace.scrollCenter();
      
      // Phase 6: Initialize views
      console.time('Initialize Views');
      console.log("Initializing CodeOrama...");
      window.codeOrama.init(project);
      
      // Enable view buttons
      document.getElementById('codeOrama-view-btn').disabled = false;
      document.getElementById('text-report-btn').disabled = false;
      console.timeEnd('Initialize Views');
      
      console.timeEnd('File Load');
      console.log("File loading complete!");
      
      // Remove loading indicator
      document.getElementById('loading-indicator').remove();
      
    } catch (error) {
      console.error('Error processing file:', error);
      console.error('Error stack:', error.stack);
      showError('Error: ' + error.message);
      
      // Remove loading indicator if it exists
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) loadingIndicator.remove();
    }
  });

  // Set up view switching
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      console.log("View button clicked:", this.id);
      
      // Don't switch if button is disabled
      if (this.disabled) return;

      // Remove active class from all buttons
      viewButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Map button IDs to view IDs
      const viewMap = {
        'blocks-view-btn': 'blocks-workspace',
        'codeOrama-view-btn': 'codeOrama-container',
        'text-report-btn': 'text-report-container'
      };
      
      // Get the target view ID
      const targetViewId = viewMap[this.id];
      
      // Hide all views
      const views = document.querySelectorAll('.view');
      views.forEach(view => {
        view.classList.remove('active');
      });
      
      // Show the target view
      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });

  // Initially disable CodeOrama and Text Report buttons until a file is loaded
  document.getElementById('codeOrama-view-btn').disabled = true;
  document.getElementById('text-report-btn').disabled = true;
  
  // Render blocks for a single sprite/target
  function renderSpriteBlocks(blocks, workspace, yOffset, targetName) {
    // Find top-level blocks to render (beginning of stacks)
    const topBlocks = [];
    Object.entries(blocks).forEach(([id, block]) => {
      if (block.topLevel) {
        topBlocks.push({id, block});
      }
    });
    
    // Create each script with full block structure
    topBlocks.forEach((item, index) => {
      try {
        const x = (index % 3) * 200 + 20;
        const y = Math.floor(index / 3) * 150 + yOffset;
        
        // Create the first block in the script
        createCompleteBlockStack(item.id, blocks, workspace, x, y, targetName);
      } catch (e) {
        console.error(`Error rendering block stack:`, e);
      }
    });
    
    return topBlocks.length;
  }
  
  // Recursively create blocks with all connections
  function createCompleteBlockStack(blockId, allBlocks, workspace, x, y, targetName) {
    if (!blockId || !allBlocks[blockId]) return null;
    
    const blockData = allBlocks[blockId];
    try {
      // Create the base block
      const block = workspace.newBlock(blockData.opcode);
      
      // Add comment showing which sprite this is from
      block.setCommentText(`From: ${targetName || 'Unknown'}`);
      
      // Set fields (parameters) on the block
      if (blockData.fields) {
        Object.entries(blockData.fields).forEach(([name, field]) => {
          if (Array.isArray(field) && field.length > 0) {
            try {
              const blockField = block.getField(name);
              if (blockField) {
                blockField.setValue(field[0]);
              }
            } catch (e) {
              // Ignore field setting errors
            }
          }
        });
      }
      
      // First render to initialize SVG
      block.initSvg();
      
      // Only position the top-level block
      if (blockData.topLevel) {
        block.moveBy(x, y);
      }
      
      // Now process inputs (child blocks) - must be done after SVG exists
      if (blockData.inputs) {
        Object.entries(blockData.inputs).forEach(([name, input]) => {
          try {
            // Format is usually [inputType, blockId]
            if (Array.isArray(input) && input.length > 1 && input[1]) {
              const childBlockId = input[1];
              const childBlock = createCompleteBlockStack(
                childBlockId, allBlocks, workspace, 0, 0, targetName
              );
              
              if (childBlock) {
                // Connect inputs to the right connection type
                const inputConnection = block.getInput(name)?.connection;
                if (inputConnection) {
                  const childConnection = childBlock.outputConnection || childBlock.previousConnection;
                  if (childConnection) {
                    inputConnection.connect(childConnection);
                  }
                }
              }
            }
          } catch (e) {
            console.warn(`Error connecting block to input ${name}:`, e);
          }
        });
      }
      
      // Connect the next block in the stack
      if (blockData.next) {
        try {
          const nextBlock = createCompleteBlockStack(
            blockData.next, allBlocks, workspace, 0, 0, targetName
          );
          
          if (nextBlock && block.nextConnection && nextBlock.previousConnection) {
            block.nextConnection.connect(nextBlock.previousConnection);
          }
        } catch (e) {
          console.warn(`Error connecting next block:`, e);
        }
      }
      
      // Final render pass to show the block and its children
      block.render();
      
      return block;
      
    } catch (error) {
      console.error(`Failed to create block ${blockData.opcode}:`, error);
      return null;
    }
  }
  
  // Register missing block definitions that might be needed
  function registerMissingBlockDefinitions() {
    // Register any common block types that might be missing
    if (!Blockly.Blocks['control_repeat']) {
      Blockly.Blocks['control_repeat'] = {
        init: function() {
          this.appendValueInput("TIMES")
            .setCheck("Number")
            .appendField("repeat");
          this.appendStatementInput("SUBSTACK");
          this.setPreviousStatement(true);
          this.setNextStatement(true);
          this.setColour(120);
        }
      };
    }
    
    // Add other missing block definitions as needed
    const commonBlocks = ['control_wait', 'motion_movesteps', 'motion_turnright', 
                         'looks_sayforsecs', 'motion_goto', 'motion_goto_menu'];
                         
    commonBlocks.forEach(blockType => {
      if (!Blockly.Blocks[blockType]) {
        Blockly.Blocks[blockType] = {
          init: function() {
            this.appendDummyInput()
              .appendField(blockType.replace(/_/g, ' '));
            if (blockType.includes('motion_') || blockType.includes('looks_') || 
                blockType.includes('control_')) {
              this.setPreviousStatement(true);
              this.setNextStatement(true);
            }
            if (blockType.includes('_menu')) {
              this.setOutput(true);
            }
            this.setColour(blockType.includes('motion_') ? 170 : 
                          blockType.includes('looks_') ? 200 : 
                          blockType.includes('control_') ? 120 : 160);
          }
        };
      }
    });
  }
  
  function showError(message) {
    if (errorMessageEl) {
      errorMessageEl.textContent = message;
      errorMessageEl.style.display = 'block';
    }
  }
});

// View switching logic
function setupViewSwitching() {
  const viewButtons = document.querySelectorAll('.view-btn');
  
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      console.log("View button clicked:", this.id);
      
      // Map button IDs to view container IDs
      const viewMap = {
        'blocks-view-btn': 'blocks-workspace',
        'codeOrama-view-btn': 'codeOrama-container',
        'text-report-btn': 'text-report-container'
      };
      
      // Get target view ID
      const targetViewId = viewMap[this.id];
      
      // Update active button
      viewButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Show the target view, hide others
      const views = document.querySelectorAll('.view');
      views.forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
      });
      
      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.add('active');
        console.log(`Displaying view: ${targetViewId}`);
      } else {
        console.error(`Target view not found: ${targetViewId}`);
      }
    });
  });

  // Add at the end of setupViewSwitching()
  console.log("View containers in DOM:", {
    blocksWorkspace: document.getElementById('blocks-workspace') ? "exists" : "missing",
    codeOramaContainer: document.getElementById('codeOrama-container') ? "exists" : "missing",
    textReportContainer: document.getElementById('text-report-container') ? "exists" : "missing"
  });
}
