var exportable =[];
function actualizar_grafico() {
    var TITLE = 'EVOLUCIÓN GLOSAS IPC';
    var X_AXIS = 'Mes';  // x-axis label and label in tooltip
    var BEGIN_AT_ZERO = false;  // Should x-axis start from 0? `true` or `false`
    var SHOW_GRID = true; 
    var fecha_inicio = new Date($('#inicio').val());
    var fecha_final = new Date($('#final').val());
    fecha_final.setDate(fecha_final.getDate()+1);
    var util = [];
    $('#wrapper2 input:checked').each(function() {
        util.push($(this).attr('name'));
    });
    if (util.length<11){
        var SHOW_LEGEND = true;
    }
    else {
        var SHOW_LEGEND = false; 
    };
    $.get('./planilla_ine.csv', function(csvString) {
        var separar = $('#separacion').val();
        if (separar=="compuesto"){
            SHOW_LEGEND = true;
            var data = Papa.parse(csvString).data;
            var data = generar_serie_parcial(util,data);
        }
        else{
            var data = Papa.parse(csvString).data; 
        };
        var modo = $('#elegir_modo').val();
        if (modo=="mensual") {
            data=pct_change(data,1);
            var Y_AXIS = 'Variación mensual'; // y-axis label and label in tooltip
        }
        else if (modo=="anual") {
            data=pct_change(data,12);
            var Y_AXIS = 'Variación anual'; // y-axis label and label in tooltip
        }
        else {
            var Y_AXIS = 'ÍNDICE'; // y-axis label and label in tooltip
        };
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
        if(modo=="indice_cero"){
            var cols = filtrada[0];
            var contenido = filtrada.slice(1);
            var nueva_base = contenido[0];
            var filtrada = [];
            filtrada.push(cols);
            for (var i=0; i<contenido.length;i++){
                var nueva_fila=[];
                nueva_fila.push(contenido[i][0]);
                for (var j=1; j<contenido[0].length;j++){
                    nueva_fila.push(100*contenido[i][j]/nueva_base[j]);
                };
                filtrada.push(nueva_fila);
            };
        }
        var timeLabels = filtrada.slice(1).map(function(row) { return row[0]; });
        var datasets = [];
        if (separar=="separado"){
            for (var i = 1; i < filtrada[0].length; i++) {
                if(util.includes(filtrada[0][i])){
                    datasets.push(
                        {
                        label: filtrada[0][i], // column name
                        data: filtrada.slice(1).map(function(row) {return row[i]}), // data in that column
                        fill: false // `true` for area charts, `false` for regular line charts
                        }
                    )
                }
            }
            var filt = [["FECHA"].concat(util)];
            for (var i = 1; i < filtrada.length;i++){
                var fila_aux=[]
                for (var j=0;j<filtrada[0].length;j++){
                    if (j==0){
                        fila_aux.push(filtrada[i][j]);
                    }
                    else{
                        if (util.includes(filtrada[0][j])){
                            fila_aux.push(filtrada[i][j]);
                        }
                    }
                }
                filt.push(fila_aux);
            }
            exportable=filt;
        }
        else{
            exportable=filtrada;
            for (var i = 1; i < filtrada[0].length; i++) {
                datasets.push(
                    {
                    label: filtrada[0][i], // column name
                    data: filtrada.slice(1).map(function(row) {return row[i]}), // data in that column
                    fill: false // `true` for area charts, `false` for regular line charts
                    }
                )
            };
        }
        var peso=calcular_peso(util);
        console.log(peso);
        document.all.vitrina_peso.innerHTML ="Las glosas en el gráfico corresponden al "+peso.toFixed(4)+ "% de la canasta.";
        // Get container for the chart
        try{
            document.getElementById('chart-container').remove();
        }
        catch (error){
            console.error(error)
        }

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
                    'millisecond': 'DD-MMM YY',
                    'second': 'DD-MMM YY',
                    'minute': 'DD-MMM YY',
                    'hour': 'DD-MMM YY',
                    'day': 'DD-MMM YY',
                    'week': 'DD-MMM YY',
                    'month': 'DD-MMM YY',
                    'quarter': 'DD-MMM YY',
                    'year': 'DD-MMM YY',
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
};

$("#actualizador").click(function(){
    actualizar_grafico();
    document.getElementById("boton_descargar").disabled = false;
});

function download_csv() {
    var csv = '';
    exportable.forEach(function(row) {
            csv += row.join(',');
            csv += "\n";
    });
 
    console.log(csv);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'ipc_custom_alm.csv';
    hiddenElement.click();
}