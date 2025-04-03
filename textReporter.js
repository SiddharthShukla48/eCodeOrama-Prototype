/**
 * TextReporter - Generates text reports of the Scratch project structure
 */
const TextReporter = {
  /**
   * Generate a text report of the project
   * @param {Array} sprites - List of sprites
   * @param {Array} events - List of events
   * @param {Array} connections - List of connections
   * @returns {string} Text report
   */
  generateReport: function(sprites, events, connections) {
    let report = '=== eCodeOrama Project Report ===\n\n';
    
    // Basic project info
    report += `Project contains:\n`;
    report += `- ${sprites.length} sprites\n`;
    report += `- ${events.length} event types\n`;
    report += `- ${connections.length} message connections\n\n`;
    
    // Sprite details
    report += "--- Sprites ---\n";
    sprites.forEach(sprite => {
      const blockCount = sprite.blocks ? Object.keys(sprite.blocks).length : 0;
      report += `${sprite.name || "Unnamed"} (${sprite.isStage ? 'Stage' : 'Sprite'}): ${blockCount} blocks\n`;
    });
    
    // Events
    report += "\n--- Events ---\n";
    events.forEach(event => {
      report += `${event.name}\n`;
    });
    
    // Connection details
    if (connections.length > 0) {
      report += "\n--- Message Connections ---\n";
      connections.forEach(conn => {
        report += `"${conn.message}" from ${conn.from.spriteName} to ${conn.to.spriteName}\n`;
      });
    } else {
      report += "\n--- Message Connections ---\nNo message connections found.\n";
    }
    
    // Update the report element
    const reportElement = document.getElementById('text-report');
    if (reportElement) {
      reportElement.textContent = report;
    } else {
      console.error("Cannot find text-report element");
    }
    
    return report;
  }
};