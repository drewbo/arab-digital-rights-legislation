d3.csv('data/adr.csv', function(error, data) {

  data.forEach(function (d) {
    d.Country = d.Country.trim();
  })

  var margin = {top: 10, right: 10, bottom: 40, left: 260},
    width = 1360 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom;

  // data processing
  var typeGrouped = _.groupBy(data, 'Type of Law')
  var doublyGrouped = {};
  _.each(typeGrouped, function (type, key) {
    doublyGrouped[key] = _.groupBy(type, 'Country');
  });

  var graphData = [];
  _.each(doublyGrouped, function(type, key) {
    var row = { name: key, values: []};
    _.each(type, function(country, k){
      row.values.push({name: k, info: country})
    });
    graphData.push(row);
  });

  graphData.sort(function (a, b) {
    return a.values.length - b.values.length
  });
  var types = _.pluck(graphData,'name');

  var xScale = d3.scale.ordinal()
                 .domain(_.pluck(data,'Country'))
                 .rangeBands([0, width - margin.left - margin.right]);

  var yScale = d3.scale.ordinal()
                 .domain(types)
                 .rangeBands([0, height - margin.top - margin.bottom]);

  var cScale = d3.scale.category20c()
                 .domain(types)

  var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var rows = svg.selectAll('.numrow')
                  .data(graphData)
                  .enter().append('g')
                  .attr('transform', function(d) {
                      return 'translate(0,' + yScale(d.name) + ')';
                  });

    var gg = rows.selectAll('.change')
        .data(function(d) {
          return d.values.map(function (m) {
            return {
              info: m.info,
              name: m.name,
              group: d.name
            };
          })
        })
        .enter().append('g')

        gg.append('rect')
        .attr('class', 'change')
        .attr('x', function(d) {
            return xScale(d.name);
        })
        .attr('height', yScale.rangeBand())
        .attr('width', xScale.rangeBand())
        .attr('opacity', 1)
        .style('fill', function(d) {
            return cScale(d.group);
        })
        .on('click', function(d) {
          d3.select('#prompt').remove();
          d3.select('#table').selectAll('*').remove();
          d.info.forEach(function (dd) {
            d3.select('#table').append('div')
            .attr('class','law-link')
            .append('a')
            .attr('href', dd['Original Law'])
            .attr('target','_blank')
            .html(function () {
              var amend = (dd['Most Recent Amendment']) ? ' (Amended: ' +
              dd['Most Recent Amendment'] + ')' : '';
              return dd['Country'] + ': ' + (dd['Law Name'] || 'Unnamed') +
              ' ' + dd['Promulgated'] + amend;
            });
          });
        })
        .on('mouseover', function(d){
          d3.select(this).attr('opacity', 0.5)
          d3.select('.' + d.name.split(' ').join('_')).style('font-weight','bold')
          d3.select('.' + d.group.split(' ').join('_').split('/').join('_')).style('font-weight','bold')
        })
        .on('mouseout', function(d){
          d3.select(this).attr('opacity', 1)
          d3.select('.' + d.name.split(' ').join('_')).style('font-weight','normal')
          d3.select('.' + d.group.split(' ').join('_').split('/').join('_')).style('font-weight','normal')
        })

      gg.append('text')
        .attr('class','text-change')
        .attr('x', function(d) {
            return xScale(d.name);
        })
        .attr('dy',yScale.rangeBand() / 2 + 3)
        .attr('dx',xScale.rangeBand() / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', 12)
        .style('fill','white')
        .text(function(d){
          return d.info.length
        })

        var xAxis = svg.selectAll('.xAxis')
                    .data(_.unique(_.pluck(data,'Country')))
                    .enter().append('text')
                    .attr('class', function(d){
                      return 'xAxis ' + d.split(' ').join('_');
                    })
                    .attr('x', function(d) {
                        return xScale(d);
                    })
                    .attr('y', height - margin.top)
                    .attr('dx', xScale.rangeBand() / 2)
                    .attr('dy', function(d, i) {
                        return (i % 2) ? -5 : -22;
                    })
                    .style('text-anchor', 'middle')
                    .style('font-size',12)
                    .style('fill','#555')
                    .text(function(d) {
                        return d;
                    })

        var yAxis = svg.selectAll('.yAxis')
            .data(_.unique(_.pluck(data,'Type of Law')))
            .enter().append('text')
            .attr('class', function(d){
              return 'yAxis ' + d.split(' ').join('_').split('/').join('_');
            })
            .attr('y', function(d) {
                return yScale(d);
            })
            .attr('dy', yScale.rangeBand() / 2 + 3)
            .attr('dx', -8)
            .style('text-anchor', 'end')
            .style('font-size',12)
            .style('fill','#555')
            .text(function(d) {
                return d;
            })

});
