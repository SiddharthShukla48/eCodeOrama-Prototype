/**
 * ArrowGenerator - Draws connection arrows between blocks
 */
const ArrowGenerator = {
  /**
   * Draw arrows between connected blocks
   * @param {Array} connections - List of connections
   * @param {SVGElement} svg - SVG element to draw arrows in
   */
  drawArrows: function(connections, svg) {
    // Clear existing arrows
    svg.innerHTML = '';
    
    // Add arrow marker definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#ff8c00');
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // Draw each connection arrow
    connections.forEach(conn => {
      try {
        // Find source and target elements
        const sourceCells = document.querySelectorAll(`td[data-sprite-id="${conn.from.spriteId}"]`);
        const targetCells = document.querySelectorAll(`td[data-sprite-id="${conn.to.spriteId}"]`);
        
        if (sourceCells.length && targetCells.length) {
          // Find the appropriate cells
          let sourceCell = null;
          let targetCell = null;
          
          for (const cell of sourceCells) {
            const blockElements = cell.querySelectorAll(`li[data-block-id="${conn.from.blockId}"]`);
            if (blockElements.length) {
              sourceCell = blockElements[0];
              break;
            }
          }
          
          for (const cell of targetCells) {
            const blockElements = cell.querySelectorAll(`li[data-block-id="${conn.to.blockId}"]`);
            if (blockElements.length) {
              targetCell = blockElements[0];
              break;
            }
          }
          
          if (sourceCell && targetCell) {
            // Calculate positions
            const sourceRect = sourceCell.getBoundingClientRect();
            const targetRect = targetCell.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();
            
            // Create path coordinates
            const startX = sourceRect.right - svgRect.left;
            const startY = sourceRect.top + sourceRect.height/2 - svgRect.top;
            const endX = targetRect.left - svgRect.left;
            const endY = targetRect.top + targetRect.height/2 - svgRect.top;
            
            // Create curved path
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Control points for the curve
            const dx = Math.abs(endX - startX) * 0.5;
            path.setAttribute('d', `M${startX},${startY} C${startX+dx},${startY} ${endX-dx},${endY} ${endX},${endY}`);
            path.setAttribute('stroke', '#ff8c00');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#arrowhead)');
            
            svg.appendChild(path);
            
            // Add message label if present
            if (conn.message) {
              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2 - 10;
              
              text.setAttribute('x', midX);
              text.setAttribute('y', midY);
              text.setAttribute('text-anchor', 'middle');
              text.setAttribute('font-size', '12px');
              text.textContent = conn.message;
              
              svg.appendChild(text);
            }
          }
        }
      } catch (e) {
        console.warn('Error drawing arrow:', e);
      }
    });
  }
};