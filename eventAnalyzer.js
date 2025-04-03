/**
 * EventAnalyzer - Finds all events in a Scratch project
 */
const EventAnalyzer = {
  /**
   * Extract events from a project
   * @param {Object} project - The parsed SB3 project
   * @returns {Array} List of events
   */
  extractEvents: function(project) {
    const events = [];
    
    // Green flag events
    events.push({
      id: 'green-flag',
      name: 'When Green Flag Clicked',
      type: 'flag'
    });
    
    // Find all broadcast messages
    const broadcasts = new Set();
    
    // To track other event types
    const keyEvents = new Set();
    const backdropEvents = new Set();
    let hasSpriteClickedEvent = false;
    let hasStageClickedEvent = false;
    
    project.targets.forEach(target => {
      if (!target.blocks) return;
      
      Object.values(target.blocks).forEach(block => {
        // Check for broadcast blocks (sending)
        if (block.opcode === 'event_broadcast' || 
            block.opcode === 'event_broadcastandwait') {
          // Extract the broadcast message
          if (block.inputs && block.inputs.BROADCAST_INPUT) {
            const input = block.inputs.BROADCAST_INPUT;
            if (Array.isArray(input) && input.length > 1 && input[1]) {
              const valueBlockId = input[1];
              if (target.blocks[valueBlockId] && 
                  target.blocks[valueBlockId].fields && 
                  target.blocks[valueBlockId].fields.BROADCAST_OPTION) {
                broadcasts.add(target.blocks[valueBlockId].fields.BROADCAST_OPTION[0]);
              }
            }
          }
        }
        
        // Check "when I receive" blocks (receiving)
        if (block.opcode === 'event_whenbroadcastreceived' && 
            block.fields && block.fields.BROADCAST_OPTION) {
          broadcasts.add(block.fields.BROADCAST_OPTION[0]);
        }
        
        // When sprite/stage clicked events
        if (block.opcode === 'event_whenthisspriteclicked') {
          hasSpriteClickedEvent = true;
        }
        
        if (block.opcode === 'event_whenstageclicked') {
          hasStageClickedEvent = true;
        }
        
        // When key pressed events
        if (block.opcode === 'event_whenkeypressed' && 
            block.fields && block.fields.KEY_OPTION) {
          keyEvents.add(block.fields.KEY_OPTION[0]);
        }
        
        // When backdrop switches events
        if (block.opcode === 'event_whenbackdropswitchesto' && 
            block.fields && block.fields.BACKDROP) {
          backdropEvents.add(block.fields.BACKDROP[0]);
        }
      });
    });
    
    // Add broadcast events
    broadcasts.forEach(msg => {
      events.push({
        id: 'broadcast-' + msg,
        name: 'When I receive "' + msg + '"',
        type: 'broadcast',
        message: msg
      });
    });
    
    // Add sprite clicked event
    if (hasSpriteClickedEvent) {
      events.push({
        id: 'sprite-clicked',
        name: 'When This Sprite Clicked',
        type: 'sprite-clicked'
      });
    }
    
    // Add stage clicked event
    if (hasStageClickedEvent) {
      events.push({
        id: 'stage-clicked',
        name: 'When Stage Clicked',
        type: 'stage-clicked'
      });
    }
    
    // Add key pressed events
    keyEvents.forEach(key => {
      events.push({
        id: 'key-' + key,
        name: 'When Key [' + key + '] Pressed',
        type: 'key-pressed',
        key: key
      });
    });
    
    // Add backdrop events
    backdropEvents.forEach(backdrop => {
      events.push({
        id: 'backdrop-' + backdrop,
        name: 'When Backdrop Switches to [' + backdrop + ']',
        type: 'backdrop',
        backdrop: backdrop
      });
    });
    
    console.log("Found events:", events);
    return events;
  }
};