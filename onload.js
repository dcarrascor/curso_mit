$(document).ready(function(){
    var TITLE = 'EVOLUCIÓN IPC';
    var X_AXIS = 'Mes';  // x-axis label and label in tooltip
    var BEGIN_AT_ZERO = false;  // Should x-axis start from 0? `true` or `false`
    var SHOW_GRID = true; // `true` to show the grid, `false` to hide
    //extraer fechas
    var fecha_inicio = new Date($('#inicio').val());
    var fecha_final = new Date($('#final').val());
    fecha_final.setDate(fecha_final.getDate()+1);
    var SHOW_LEGEND = false; 
    $.get('./planilla_ine.csv', function(csvString) {
        var data = Papa.parse(csvString).data;
        var Y_AXIS = 'ÍNDICE'; // y-axis label and label in tooltip
        var columnas = data[0];
        var datos = data.slice(1);
        var filtrada = [];
        filtrada.push(columnas);
        for (var i=0;i < datos.length;i++) {
            var fecha_curr = Date.parse(datos[i][0]);
            if (fecha_curr>=fecha_inicio && fecha_curr<=fecha_final){
                filtrada.push(datos[i]);
            }
        }
        filtrada = generar_serie_parcial(filtrada[0].slice(1),filtrada);
        var timeLabels = filtrada.slice(1).map(function(row) { return row[0]; });
        var datasets = [];
        for (var i = 1; i < filtrada[0].length; i++) {
            datasets.push(
                {
                label: filtrada[0][i], // column name
                data: filtrada.slice(1).map(function(row) {return row[i]}), // data in that column
                fill: false // `true` for area charts, `false` for regular line charts
                }
            );
        };
      $("#wrapper").append('<canvas id="chart-container" height="400"></canvas>');
      var ctx = document.getElementById("chart-container").getContext("2d");
      new Chart(ctx, {
        type: 'line',

        data: {
            labels: timeLabels,
            datasets: datasets,
        },
        
        options: {
            title: {
            display: true,
            text: TITLE,
            fontSize: 14,
            },
            legend: {
            display: SHOW_LEGEND,
            },
            maintainAspectRatio: false,
            scales: {
            xAxes: [{
                type: 'time',
                time: {
                    displayFormats: {
                    'millisecond': 'MMM YY',
                    'second': 'MMM YY',
                    'minute': 'MMM YY',
                    'hour': 'MMM YY',
                    'day': 'MMM YY',
                    'week': 'MMM YY',
                    'month': 'MMM YY',
                    'quarter': 'MMM YY',
                    'year': 'MMM YY',
                    }},
                scaleLabel: {
                display: X_AXIS !== '',
                labelString: X_AXIS
                },
                gridLines: {
                display: SHOW_GRID,
                },
                ticks: {
                callback: function(value, index, values) {
                    return value.toLocaleString();
                }
                }
            }],
            yAxes: [{
                beginAtZero: true,
                scaleLabel: {
                display: Y_AXIS !== '',
                labelString: Y_AXIS
                },
                gridLines: {
                display: SHOW_GRID,
                },
                ticks: {
                beginAtZero: BEGIN_AT_ZERO,
                callback: function(value, index, values) {
                    return value.toLocaleString()
                }
                }
            }]
            },
            tooltips: {
            displayColors: false,
            callbacks: {
                label: function(tooltipItem, all) {
                return all.datasets[tooltipItem.datasetIndex].label
                    + ': ' + tooltipItem.yLabel.toLocaleString();
                }
            }
            },
            plugins: {
            colorschemes: {
                scheme: 'brewer.Paired12'
            }
            }
        }
        });
    })
});
