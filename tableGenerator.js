/**
 * TableGenerator - Creates a table visualization for CodeOrama
 */
const TableGenerator = {
  /**
   * Create a table for CodeOrama
   * @param {Array} sprites - List of sprites
   * @param {Array} events - List of events
   * @param {Array} connections - List of connections
   * @returns {HTMLElement} The generated table
   */
  createTable: function(sprites, events, connections) {
    const table = document.createElement('table');
    table.className = 'codeOrama-table';
    
    // Create header row with sprite names
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.textContent = 'Events / Sprites';
    headerRow.appendChild(cornerCell);
    
    sprites.forEach(sprite => {
      const th = document.createElement('th');
      th.textContent = sprite.name || 'Unnamed';
      th.dataset.spriteId = sprite.id;
      headerRow.appendChild(th);
    });
    
    table.appendChild(headerRow);
    
    // Create a row for each event
    events.forEach(event => {
      const row = document.createElement('tr');
      
      // Event name cell
      const eventCell = document.createElement('td');
      eventCell.textContent = event.name;
      eventCell.dataset.eventId = event.id;
      row.appendChild(eventCell);
      
      // Create cells for each sprite
      sprites.forEach(sprite => {
        const cell = document.createElement('td');
        cell.dataset.spriteId = sprite.id;
        cell.dataset.eventId = event.id;
        
        // Find blocks that respond to this event
        const eventBlocks = this.findBlocksForEvent(sprite, event);
        
        if (eventBlocks.length > 0) {
          const blockList = document.createElement('ul');
          blockList.className = 'block-list';
          
          eventBlocks.forEach(blockInfo => {
            const item = document.createElement('li');
            item.textContent = blockInfo.opcode.replace(/_/g, ' ');
            item.dataset.blockId = blockInfo.id;
            blockList.appendChild(item);
          });
          
          cell.appendChild(blockList);
        }
        
        row.appendChild(cell);
      });
      
      table.appendChild(row);
    });
    
    return table;
  },
  
  /**
   * Find blocks that respond to a specific event
   * @param {Object} sprite - The sprite object
   * @param {Object} event - The event object 
   * @returns {Array} List of blocks that respond to the event
   */
  findBlocksForEvent: function(sprite, event) {
    const blocks = [];
    
    if (!sprite.blocks) return blocks;
    
    Object.entries(sprite.blocks).forEach(([id, block]) => {
      if (block.topLevel) {
        if (event.type === 'flag' && block.opcode === 'event_whenflagclicked') {
          blocks.push({ id, opcode: block.opcode });
        } else if (event.type === 'broadcast' && 
                  block.opcode === 'event_whenbroadcastreceived' && 
                  block.fields && 
                  block.fields.BROADCAST_OPTION && 
                  block.fields.BROADCAST_OPTION[0] === event.message) {
          blocks.push({ id, opcode: block.opcode });
        }
      }
    });
    
    return blocks;
  }
};