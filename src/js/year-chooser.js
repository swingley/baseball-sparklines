export default (years, body) => {
  var selectYear = body.append("div").attr("class", "year-button").text("Change Year");
  var container = body.append('div').attr('class', 'year-container hidden');
  container.selectAll('.year')
    .data(years)
    .enter()
    .append('div')
    .attr('class', 'year')
    .append('a')
    .attr('href', (d) => '?year=' + d)
    .html((d) => d);

  selectYear.on("click", function(e) {
    container.classed("hidden") ? 
      container.classed("hidden", false) : 
      container.classed("hidden", true);
  });
}