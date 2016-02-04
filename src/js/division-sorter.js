export default (divisions, constants) => {
  if ( divisions.length === 2 ) {
    if ( divisions[0].key === 'AL' ) {
      divisions.reverse();
    }
  }
  if ( divisions.length === 4 ) {
    var order = divisions.map((d) => d.key);
    var reorder = order.map((d) => constants.divisionEra[d]);
    var reordered = [];
    divisions.forEach((d, i) => {
      reordered[reorder[i]] = d;
    });
    divisions = reordered;
  }
  if ( divisions.length === 6 ) {
    var order = divisions.map((d) => d.key);
    var reorder = order.map((d) => constants.wildCardEra[d]);
    var reordered = [];
    divisions.forEach((d, i) => {
      reordered[reorder[i]] = d;
    });
    divisions = reordered;
  }
  return divisions;
}