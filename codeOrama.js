/**
 * CodeOrama - Main module for generating the CodeOrama visualization
 */
window.codeOrama = (function() {
  // Store project data
  let projectData = null;
  let sprites = [];
  let events = [];
  let connections = [];

  return {
    /**
     * Initialize the CodeOrama with project data
     * @param {Object} project - The parsed SB3 project data
     */
    init: function(project) {
      console.log("Initializing CodeOrama with project:", project);
      projectData = project;
      
      // Extract sprites (targets)
      sprites = project.targets || [];
      
      // Get events from the analyzer
      events = EventAnalyzer.extractEvents(project);
      console.log("CodeOrama events:", events);
      
      // Analyze relationships between blocks (broadcasts, etc.)
      connections = RelationshipAnalyzer.analyzeConnections(sprites, events, project);
      console.log("CodeOrama connections:", connections);
      
      // Generate the CodeOrama visualization
      this.generateCodeOramaView();
      
      // Generate text report
      TextReporter.generateReport(sprites, events, connections);
    },
    
    /**
     * Generate CodeOrama visualization
     */
    generateCodeOramaView: function() {
      console.log("Generating CodeOrama visualization");
      const container = document.getElementById('codeOrama-container');
      if (!container) {
        console.error("Cannot find codeOrama-container element");
        return;
      }
      
      // Clear existing content
      container.innerHTML = '';
      
      // Create a table with inline styles for immediate visibility
      const table = document.createElement('table');
      table.setAttribute('border', '1');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      
      // Add header row
      const headerRow = document.createElement('tr');
      const headerCell = document.createElement('th');
      headerCell.textContent = 'Events / Sprites';
      headerCell.style.backgroundColor = '#f0f0f0';
      headerCell.style.padding = '8px';
      headerRow.appendChild(headerCell);
      
      // Add sprite names to header
      sprites.forEach(sprite => {
        const spriteHeader = document.createElement('th');
        spriteHeader.textContent = sprite.name || 'Unnamed Sprite';
        spriteHeader.style.backgroundColor = '#f0f0f0';
        spriteHeader.style.padding = '8px';
        headerRow.appendChild(spriteHeader);
      });
      
      table.appendChild(headerRow);
      
      // Add rows for each event
      events.forEach(event => {
        const row = document.createElement('tr');
        
        // Event cell - create a mini event block
        const eventCell = document.createElement('td');
        eventCell.style.padding = '8px';
        
        // Create mini representation of event block
        const eventBlock = document.createElement('div');
        eventBlock.className = 'mini-block event-block';
        
        if (event.type === 'flag') {
          eventBlock.innerHTML = `
            <div class="block-hat"></div>
            <div class="block-body">
              <img src="scratch-blocks/media/green-flag.svg" width="15" height="15">
              when green flag clicked
            </div>
          `;
        } else if (event.type === 'broadcast') {
          eventBlock.innerHTML = `
            <div class="block-hat"></div>
            <div class="block-body">
              when I receive "${event.message}"
            </div>
          `;
        } else if (event.type === 'sprite-clicked') {
          eventBlock.innerHTML = `
            <div class="block-hat"></div>
            <div class="block-body">
              when this sprite clicked
            </div>
          `;
        } else if (event.type === 'stage-clicked') {
          eventBlock.innerHTML = `
            <div class="block-hat"></div>
            <div class="block-body">
              when stage clicked
            </div>
          `;
        } else if (event.type === 'key-pressed') {
          eventBlock.innerHTML = `
            <div class="block-hat"></div>
            <div class="block-body">
              when key [${event.key}] pressed
            </div>
          `;
        } else if (event.type === 'backdrop') {
          eventBlock.innerHTML = `
            <div class="block-hat"></div>
            <div class="block-body">
              when backdrop switches to [${event.backdrop}]
            </div>
          `;
        }
        
        eventCell.appendChild(eventBlock);
        row.appendChild(eventCell);
        
        // Add cells for each sprite
        sprites.forEach(sprite => {
          const cell = document.createElement('td');
          cell.style.padding = '8px';
          
          // Find blocks that respond to this event
          let hasHandler = false;
          let handlerBlocks = [];
          
          if (sprite.blocks) {
            Object.entries(sprite.blocks).forEach(([id, block]) => {
              // Green flag handler
              if (event.type === 'flag' && block.opcode === 'event_whenflagclicked') {
                hasHandler = true;
                handlerBlocks.push(block);
              } 
              // Broadcast handler
              else if (event.type === 'broadcast' && 
                       block.opcode === 'event_whenbroadcastreceived' &&
                       block.fields && 
                       block.fields.BROADCAST_OPTION && 
                       block.fields.BROADCAST_OPTION[0] === event.message) {
                hasHandler = true;
                handlerBlocks.push(block);
              } 
              // Sprite clicked handler (only valid for sprites, not stage)
              else if (event.type === 'sprite-clicked' && 
                       block.opcode === 'event_whenthisspriteclicked' &&
                       !sprite.isStage) {
                hasHandler = true;
                handlerBlocks.push(block);
              } 
              // Stage clicked handler (only valid for stage)
              else if (event.type === 'stage-clicked' && 
                       block.opcode === 'event_whenstageclicked' &&
                       sprite.isStage) {
                hasHandler = true;
                handlerBlocks.push(block);
              }
              // Key pressed handler
              else if (event.type === 'key-pressed' && 
                       block.opcode === 'event_whenkeypressed' &&
                       block.fields && 
                       block.fields.KEY_OPTION && 
                       block.fields.KEY_OPTION[0] === event.key) {
                hasHandler = true;
                handlerBlocks.push(block);
              }
              // Backdrop handler
              else if (event.type === 'backdrop' && 
                       block.opcode === 'event_whenbackdropswitchesto' &&
                       block.fields && 
                       block.fields.BACKDROP && 
                       block.fields.BACKDROP[0] === event.backdrop) {
                hasHandler = true;
                handlerBlocks.push(block);
              }
            });
          }
          
          if (hasHandler) {
            // Create mini-block for each handler
            handlerBlocks.forEach(block => {
              const handlerBlock = document.createElement('div');
              handlerBlock.className = 'mini-block handler-block';
              
              if (block.opcode === 'event_whenflagclicked') {
                handlerBlock.innerHTML = `
                  <div class="block-hat"></div>
                  <div class="block-body">
                    <img src="scratch-blocks/media/green-flag.svg" width="15" height="15">
                    when green flag clicked
                  </div>
                `;
              } else if (block.opcode === 'event_whenbroadcastreceived') {
                handlerBlock.innerHTML = `
                  <div class="block-hat"></div>
                  <div class="block-body">
                    when I receive "${block.fields.BROADCAST_OPTION[0]}"
                  </div>
                `;
              } else if (block.opcode === 'event_whenthisspriteclicked') {
                handlerBlock.innerHTML = `
                  <div class="block-hat"></div>
                  <div class="block-body">
                    when this sprite clicked
                  </div>
                `;
              } else if (block.opcode === 'event_whenstageclicked') {
                handlerBlock.innerHTML = `
                  <div class="block-hat"></div>
                  <div class="block-body">
                    when stage clicked
                  </div>
                `;
              } else if (block.opcode === 'event_whenkeypressed') {
                handlerBlock.innerHTML = `
                  <div class="block-hat"></div>
                  <div class="block-body">
                    when key [${block.fields.KEY_OPTION[0]}] pressed
                  </div>
                `;
              } else if (block.opcode === 'event_whenbackdropswitchesto') {
                handlerBlock.innerHTML = `
                  <div class="block-hat"></div>
                  <div class="block-body">
                    when backdrop switches to [${block.fields.BACKDROP[0]}]
                  </div>
                `;
              }
              
              cell.appendChild(handlerBlock);
            });
            
            cell.style.backgroundColor = '#e6ffe6'; // Light green
          } else {
            cell.textContent = 'No handler';
            cell.style.backgroundColor = '#ffebeb'; // Light red
          }
          
          row.appendChild(cell);
        });
        
        table.appendChild(row);
      });
      
      container.appendChild(table);
      
      // Add CSS for mini-blocks
      const style = document.createElement('style');
      style.textContent = `
        .mini-block {
          margin: 5px 0;
          font-family: sans-serif;
          font-size: 12px;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .event-block {
          background-color: #FFBF00;
          color: white;
        }
        
        .handler-block {
          background-color: #FFBF00;
          color: white;
        }
        
        .block-hat {
          height: 6px;
          background-color: inherit;
          border-radius: 4px 4px 0 0;
        }
        
        .block-body {
          padding: 4px 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `;
      document.head.appendChild(style);
    }
  };
})();