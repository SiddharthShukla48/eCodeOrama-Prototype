/**
 * RelationshipAnalyzer - Analyzes connections between blocks
 */
const RelationshipAnalyzer = {
  /**
   * Analyze connections between blocks
   * @param {Array} sprites - List of sprites
   * @param {Array} events - List of events
   * @param {Object} project - The project data
   * @returns {Array} List of connections
   */
  analyzeConnections: function(sprites, events, project) {
    const connections = [];
    
    // Find connections between blocks (broadcasts)
    sprites.forEach(sender => {
      if (!sender.blocks) return;
      
      Object.entries(sender.blocks).forEach(([blockId, block]) => {
        // Check for broadcast blocks
        if (block.opcode === 'event_broadcast' || 
            block.opcode === 'event_broadcastandwait') {
          
          let message = null;
          
          // Get the message being broadcast
          if (block.inputs && block.inputs.BROADCAST_INPUT) {
            const input = block.inputs.BROADCAST_INPUT;
            if (Array.isArray(input) && input.length > 1 && input[1]) {
              const msgBlockId = input[1];
              const valueBlock = sender.blocks[msgBlockId];
              if (valueBlock && valueBlock.fields && valueBlock.fields.BROADCAST_OPTION) {
                message = valueBlock.fields.BROADCAST_OPTION[0];
              }
            }
          }
          
          if (message) {
            // Find all blocks that receive this message
            sprites.forEach(receiver => {
              if (!receiver.blocks) return;
              
              Object.entries(receiver.blocks).forEach(([receiverId, receiverBlock]) => {
                if (receiverBlock.opcode === 'event_whenbroadcastreceived' && 
                    receiverBlock.fields && 
                    receiverBlock.fields.BROADCAST_OPTION && 
                    receiverBlock.fields.BROADCAST_OPTION[0] === message) {
                  
                  connections.push({
                    from: {
                      blockId: blockId,
                      spriteId: sender.id,
                      spriteName: sender.name || "Unknown"
                    },
                    to: {
                      blockId: receiverId,
                      spriteId: receiver.id,
                      spriteName: receiver.name || "Unknown"
                    },
                    type: 'broadcast',
                    message: message
                  });
                }
              });
            });
          }
        }
      });
    });
    
    console.log("Found connections:", connections);
    return connections;
  }
};