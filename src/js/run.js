import * as d3selection from 'd3-selection';
import * as d3array from 'd3-array';
import * as d3request from 'd3-request';
import * as d3collection from 'd3-collection';
import * as d3scale from 'd3-scale';
import * as d3shape from 'd3-shape';
import 'd3-transition';

import constants from './constants';
import addYears from './year-chooser';
import labeler from './label-shifter';
import divisionSorter from './division-sorter';

if (process.env.NODE_ENV !== 'production') {
  // Make webpack watch for changes to index.html.
  // http://stackoverflow.com/a/33995496/1934
  require('../../index.html');
}

let body = d3selection.select("body");
let fullWidth = 400,
    fullHeight = fullWidth / 2,
    margin = {top: 20, right: 175, bottom: 10, left: 10},
    width = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom;
// Various x coordinate starting points to lay out different pieces of text.
let winLossX = 51;
let homeX = 88;
let roadX = 120;
let pctX = 152;
let bigChart, hiddenChart;
let year = 2017;
let query = window.location.search.slice(1).split('=');
if ( query.length ) {
  let yearIndex = -1;
  query.forEach((p, i) => {
    if ( p === 'year' ) {
      yearIndex = i;
    }
  });
  if ( yearIndex > -1 ) {
    year = query[yearIndex+1];
  }
}
let availableYears = d3array.range(1919, 2020);
addYears(availableYears, body);
body.append("h1").text("MLB Sparklines:  " + year);

d3request.json('seasons-data/' + year + '.json', (error, data) => {
  if (error) { throw error; }

  // Group data by division.
  let divisions = d3collection.nest()
    .key((d) => d.league)
    .entries(data);

  // Sort divisions so that NL has priority.
  divisions = divisionSorter(divisions, constants);

  // Need some scales.
  let x = d3scale.scaleLinear()
    .domain([0, d3array.max(data, (d) => d.games)])
    .range([0, width]);
  let min = d3array.min(data, (d) => d3array.min(d.results));
  let max = d3array.max(data, (d) => d3array.max(d.results));
  let y = d3scale.scaleLinear()
    .domain([min, max])
    .range([height, 0]);

  // Path generator.
  let line = d3shape.line()
    .x((d, i) => x(i))
    .y((d, i) => y(d));

  // Make sure labels don't step on each other.
  divisions = labeler(divisions, y);

  // Make one chart (svg) per division.
  let charts = body.selectAll('svg')
    .data(divisions)
    .enter()
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', '0 0 400 200')
    .attr('preserveAspectRatio', 'none')
    .attr('data-division', (d) => d.key)
    .on('click', function() {
      console.log('chart click', this);
      console.log('...width...', parseInt(body.style("width").replace("px", "")))
      console.log('bigChart', bigChart);
      // Use a function expression because `this` is the svg element.
      // In an arrow function, `this` is undefined.

      // Only shrink when there are two charts per line.
      if ( parseInt(body.style("width").replace("px", "")) > 400 ) {
        ( this === bigChart ) ? shrink(this) : grow(this);
      }
    })
    .append('g')
    .attr('transform', 'translate(0, 0)');
  // Already have an appropriate selection, add each division name.
  charts.append('text')
    .attr('x', margin.left)
    .attr('y', 10)
    .text((d) => d.key);
  // Add labels for home record.
  charts.append('text')
    .attr('y', 10)
    .attr('x', width + homeX + margin.left)
    .text('home');
  // Add labels for road record.
  charts.append('text')
    .attr('y', 10)
    .attr('x', width + roadX + margin.left)
    .text('road');
  // Add labels for winning percentage.
  charts.append('text')
    .attr('y', 10)
    .attr('x', width + pctX + margin.left)
    .text('pct');
  // Another <g> for main chart areas.
  charts = charts.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  // Make one line for each team. Data is nested so need a new selection.
  charts.selectAll('.line')
    .data((d) => d.values)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('d', (d) => line(d.results))
    .style('stroke', (d) => constants.teamColors[d.abbreviation]);
  // Add labels for lines.
  let labels = charts.selectAll('g')
    .data((d) => d.values)
    .enter()
    .append('g')
    .attr('transform', 'translate(' + width + ',0)')
    .style('fill', (d) => constants.teamColors[d.abbreviation]);
  // Number of games above or below .500.
  labels.append('text')
    .attr('x', (d) => {
      // Right-align final result (number like -12, 2, 34, etc.).
      let result = d.results[d.results.length-1];
      let position = ( result <= -10 ) ? 0 :
        ( result < 0 ) ? 5 :
        ( result < 10 ) ? 10 : 5;
      return position;
    })
    .attr('y', (d) => d.labelPosition)
    .attr('class', 'team')
    .text((d) => d.results[d.results.length-1]);
  // Team labels.
  labels.append('text')
    .attr('x', 20)
    .attr('y', (d) => d.labelPosition)
    .attr('class', 'team')
    .text((d) => d.abbreviation);
  // W-L record.
  labels.append('text')
    .attr('x', (d) => {
      let pad = 0;
      if ( d.wins > 99 || d.losses > 99 ) {
        pad = -5;
      }
      return winLossX + pad;
    })
    .attr('y', (d) => d.labelPosition)
    .attr('class', 'team')
    .text((d) => d.wins + "–" + d.losses)
  // Home W-L record.
  labels.append('text')
    .attr('x', homeX)
    .attr('y', (d) => d.labelPosition)
    .attr('class', 'team')
    .text((d) => d.winsHome + "–" + d.lossesHome)
  // Road W-L record.
  labels.append('text')
    .attr('x', roadX)
    .attr('y', (d) => d.labelPosition)
    .attr('class', 'team')
    .text((d) => d.winsRoad + "–" + d.lossesRoad)
  // Winning percentage.
  labels.append('text')
    .attr('x', pctX)
    .attr('y', (d) => d.labelPosition)
    .attr('class', 'team')
    .text((d) => (d.wins / d.games).toFixed(3).slice(1));

  // See if charts needs to be scaled up or down.
  let bodyWidth = d3selection.select('body').style('width').replace('px', '');
  if ( bodyWidth % 400 !== 0 ) {
    // We are not on a wide screen.
    let scaledHeight = (200 * (bodyWidth / fullHeight)) / 2;
    // Scale svg's appropriately.
    d3selection.selectAll('svg').attr({
      width: bodyWidth,
      height: scaledHeight
    });
    // Take off the click handler that does zoom in/out.
    d3selection.selectAll('svg').on('click', null);
  }
  d3selection.selectAll('svg').style('opacity', 1);

  let shrink = (e, callback, next) => {
    if ( hiddenChart ) {
      d3selection.select(hiddenChart)
        .transition()
        .style('width', fullWidth)
        .style('height', fullHeight);
    }
    d3selection.select(e)
      .transition()
      .style('width', fullWidth)
      .style('height', fullHeight)
      .on('end', () => {
        bigChart = hiddenChart = null;
        if ( callback ) {
          callback(next);
        }
      });
  }

  let grow = (e) => {
    // Only allow one big chart.
    if ( bigChart ) {
      shrink(bigChart, grow, e);
      return;
    }
    if ( isAL(e) ) {
      hiddenChart = e.previousSibling;
    } else {
      hiddenChart = e.nextSibling;
    }
    bigChart = e;
    d3selection.select(e)
      .transition()
      .style('width', fullWidth * 2)
      .style('height', fullHeight * 2);
    if ( hiddenChart ) {
      d3selection.select(hiddenChart).transition().style('width', '0');
    }
  }

  let isAL = (n) => {
    return n.getAttribute('data-division').indexOf('AL') > -1;
  }
});