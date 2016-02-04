export default (divisions, scale) => {
  var labelPositions = [];
  var shifted = {};
  var requiredLabelHeight = 12;
  // Calculate initial position for all team labels.
  divisions.forEach(function(d) {
    var positions = d.values.map(function(v) {
      var team = {
        name: v.abbreviation,
        pos: scale(v.results[v.results.length-1]),
        shifted: false
      };
      return team;
    });
    // Sort ascending, y=0 is top of svg, sorting from top to bottom.
    positions.sort(function(a, b) {
      return a.pos - b.pos;
    });
    labelPositions.push(positions);
  });

  labelPositions.forEach(function(d) {
    // Loop through each set of labels.
    d.forEach(function(p, i) {
      shifted[p.name] = p.pos;
      // Make sure we don't go past of the end of the array.
      if ( i < d.length-1 ) {
        // Positions for two labels.
        var p1 = p.pos;
        var p2 = d[i+1].pos;
        // Calculate the difference between the two.
        var delta = p2 - p1;
        // Lables within 10px overlap.
        if ( delta < requiredLabelHeight ) {
          // Figure out how much to shift labels.
          var shift = (requiredLabelHeight - delta) / 2;
          // console.log('shifting', p.name, p1, d[i+1].name, p2, shift);
          // If the current position for the first label is smaller than the 
          // shift, or if the first label has already been moved once, 
          // move only the second label down.
          if ( p.pos < shift || p.shifted ) {
            // console.log('\tonly moving bottom label', d[i+1].name);
            d[i+1].pos += shift * 2;
            d[i+1].shifted = true;
          // Otherwise, shift the first label up a little and the other down.
          } else {
            p.pos -= shift;
            d[i+1].pos += shift;
            d[i+1].shifted = true;
          }
          // console.log('\tafter shift', p.pos, d[i+1].pos);
          shifted[p.name] = p.pos;
          shifted[d[i+1].name] = d[i+1].pos;
        }
      }
    });
  });
  // console.log('shifted, all: ', shifted);
  divisions.forEach(function(d) {
    d.values.forEach(function(v) {
      v.labelPosition = shifted[v.abbreviation];
    });
  });
  return divisions;
}