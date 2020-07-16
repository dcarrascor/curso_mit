$('#elegir_info').change(function(){
    document.getElementById("actualizador").disabled = false;
    document.getElementById("select_all").disabled = false;
    var valor_elegido = $('#elegir_info').val();
    var util=[]
    $.get('./divisiones.csv', function(csvString) {
        var data = Papa.parse(csvString,{header:true}).data;
        if (valor_elegido=="todas"){
            for (var i = 0; i < data.length; i++){
                if (data[i]['GLOSA']!=''){
                    util.push(data[i]['GLOSA']);
                }
            }
        }
        else {
            for (var i = 0; i < data.length; i++){
                if (data[i]['DIVISION']==valor_elegido){
                    util.push(data[i]['GLOSA']);
                }
            }
        }
        
    }).done( function(){
        var elemento = document.getElementById("wrapper2");
        elemento.innerHTML = '';
        document.getElementById("wrapper2").remove();
        var contenedor = document.createElement("div");
        contenedor.id = "wrapper2";
        contenedor.style.height = "200px";
        for (var i = 0; i < util.length; i++) {
            var opcion = document.createElement("li");
            var checkbox = document.createElement("input");
            checkbox.name = util[i];
            checkbox.type = "checkbox";
            var label = document.createElement("label");
            label.for="checkbox"+i.toString();
            label.innerHTML = util[i];
            label.style.fontSize = "xx-medium";
            opcion.appendChild(checkbox);
            opcion.appendChild(label);
            contenedor.append(opcion)
            };
        $('#elegir_modo').after(contenedor);
        }
    )

});