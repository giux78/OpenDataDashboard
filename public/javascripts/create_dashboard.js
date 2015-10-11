/**
 * JQUERY FUNCTION $(document).ready() at the end of file
 */
 
 //funzione principale, dal nome prende il dataset e chiama le funzioni per creare html e grafico
    function add_chart(name) {
        console.log("chart");
		$.ajax({
			url: '/chart/' + name,
			async: true,
		    type: "GET",
			success: function(datasets) {
	           console.log(datasets)
	           if(datasets.status === 'ok'){
	        	   var results = datasets.results
	        	   results.map(function(myDataset){
	        		   var name = myDataset.dataset_name
	        		   var title = myDataset.dataset_title
	                   var data = myDataset.result
	                   var chartType = myDataset.chart_type
	                   if (data.length != 0){
	                	   //chartType: comunita_valle | comuni | bar_chart
	                	   //se non esiste il div (premuta la x per cancellarlo oppure prima richiesta) disegno il grafico
	                	   if($('#' + name + '_' + chartType + '_div').length===0) {
	                	       //setto se è la prima visita, se è già stato disegnato cancello il primo chart
	                	       first_click=true;
	                	       if(chart[name+'_'+chartType]!=undefined) {
	                	           first_click=false;
	                	           delete chart[name+'_'+chartType]
	                	       }
	                	        draw_chart(chartType, name + '_' + chartType + '_div', name+'_'+chartType, title, data, first_click);
	                	   }
	       	    		}
	        	   })
	           }
			},
			error: function(data) {

			}
		});
	}
	
	//funzione che  prende tutti i dati e, in base al tipo, li processa
	function draw_chart(chartType, divID, name, title, data, first) {
		if(chartType == 'comunita_valle') {
		    //crea div
            $('#chart_div').append('<div class="row"><div class="col-md-12"><section class="panel"><header class="panel-heading"><span id="'+name+'_title"></span><span class="tools pull-right"> <a href="javascript:;" class="fa fa-chevron-down"></a><a href="javascript:;" class="fa fa-cog"></a><a href="javascript:delete_chart(`'+name+'_title`);" class="fa fa-times"></a></span></header><div class="panel-body"><div id="'+ divID + '" style="width:100%;height:400px; text-align: center; margin:0 auto;"></div></div></section></div></div>')
			$('#'+name+'_title').html(title+" per Comunità di Valle")
			//raggruppa i valori secondo specifiche di morris.js
			if(first) groupValue(name, data);
			//disegna grafico
            drawPlot(name,divID);
            //crea html e logica della legenda a checkbox
            createLegend(name, divID);
		}
		//come sopra ma grafico di 800px
		else if(chartType == 'comuni') {
			$('#chart_div').append('<div class="row"><div class="col-md-12"><section class="panel"><header class="panel-heading"><span id="'+name+'_title"></span><span class="tools pull-right"> <a href="javascript:;" class="fa fa-chevron-down"></a><a href="javascript:;" class="fa fa-cog"></a><a href="javascript:delete_chart(`'+name+'_title`);" class="fa fa-times"></a></span></header><div class="panel-body"><div id="'+ divID + '" style="width:100%;height:800px; text-align: center; margin:0 auto;"></div></div></section></div></div>')
			$('#'+name+'_title').html(title+" per Comuni")
			groupValue(name, data);
            drawComuniPlot(name,divID);
            createLegend(name, divID);
		}
		//TODO
		else if(chartType == 'bar_chart') {
    		$('#chart_div').append('<div class="row"><div class="col-md-12"><section class="panel"><header class="panel-heading"><span id="'+name+'_title"></span><span class="tools pull-right"> <a href="javascript:;" class="fa fa-chevron-down"></a><a href="javascript:;" class="fa fa-cog"></a><a href="javascript:delete_chart(`'+name+'_title`);" class="fa fa-times"></a></span></header><div class="panel-body"><div id="'+ divID + '" style="width:100%;height:400px; text-align: center; margin:0 auto;"></div></div></section></div></div>')
			$('#'+name+'_title').html(title)
		}
	}
	
	
//dati suddivisi per chart, a sua volta suddivisi per anno
var allData = {};

//array dei dizionari, chart usato come parola chiave per singolo dizionario
var dizionario = {};
var checked = {};
//array degli oggetti morris, usati per modificare il grafico
var chart = {};

//raggruppa i valori secondo gli standard di morris.js, creando anche la struttura che li contiene
function groupValue(nome, data) {
    for(var i=0; i<data.length; i++) {
        var anno = data[i].anno;
        var descriz = data[i].descriz;
        var valore = data[i].valore;

        if(dizionario[nome]===undefined) {
            dizionario[nome] = [nome];
            dizionario[nome] = [];
        }
        if(checked[nome]===undefined) {
            checked[nome] = [nome];
            checked[nome] = [];
        }
        if(chart[nome]===undefined) {
            chart[nome] = [nome];
            chart[nome] = [];
        }
        if(allData[nome]===undefined) {
            allData[nome] = [nome];
            allData[nome] = [];
        }

        //creo l'array con tutti i campi
        var index = findInDictionary(nome, descriz);
        //se non è stato trovato, aggiungo il nuovo valore
        if(index===-1) {
            dizionario[nome].push(descriz);
            //dichiaro che questo array è visibile
            checked[nome].push(true);
            //metto index alla posizione del nuovo array
        }
        if(allData[nome][anno]===undefined) {
            allData[nome][anno] = [anno];
            allData[nome][anno] = [];
        }
        allData[nome][anno].push(data[i]);
    }
}

//dato il nome del chart e il campo, ritorna l'indice del campo nel dizionario, -1 se non viene trovato
function findInDictionary(nome, campo) {
    for(var j=0; j<dizionario[nome].length; j++) {
        if(campo === dizionario[nome][j]) return j; 
    }
    return -1;
    
}

//crea grafico senza legenda
function drawComuniPlot(nome, divID) {
    chart[nome] = Morris.Line({
        element: divID,
        data: createDataToPlot(nome),
        xkey: 'anno',
        ykeys: dizionario[nome],
        labels: dizionario[nome],
        hideHover: 'always'
    });
}

//crea grafico con legenda
function drawPlot(nome, divID) {
    chart[nome] = Morris.Line({
        element: divID,
        data: createDataToPlot(nome),
        xkey: 'anno',
        ykeys: dizionario[nome],
        labels: dizionario[nome],
    });
}

//prende i dati dall'insieme dei dataset e, filtrandoli in base alle checkbox(di default tutte positive), ritorna la lista dei punti per il grafo
function createDataToPlot(nome) {
    var list = [];
    //per ogni lista
    
    for(var anno in allData[nome]) {
        var listAnno=allData[nome][anno];//lista di tutti i dati di un singolo anno
        var point = {};
        point['anno'] = ['anno'];
        point['anno'] = listAnno[0].anno;
        for(var i=0; i<listAnno.length; i++) {
            var titolo = listAnno[i].descriz;
            var index = findInDictionary(nome, titolo);       
            if(checked[nome][index]) {
                point[titolo] = [titolo]
                point[titolo] = parseInt(listAnno[i].valore);
            }
            
        }
        //console.log(point);
        list.push(point);
    }
    return list
}

//appende appena dopo il div del chart tutti i checkbox del grafico
function createLegend(nome, divID) {
    var div = document.getElementById(divID);

    for(var i=dizionario[nome].length-1; i>=0; i--) {
        //backquote: Alt + 0180
        div.insertAdjacentHTML('afterend', '&nbsp;&nbsp;'+dizionario[nome][i]+'<input style="display: inline-block;"name="'+dizionario[nome][i]+'*'+nome+'" type="checkbox" value="html" checked="checked" onChange="changeData(`'+nome+'`,this)"/>');
    }
    
    div.insertAdjacentHTML('afterend', 'ALL<input style="display: inline-block;"name="ALL" type="checkbox" value="html" checked="checked" onChange="changeData(`'+nome+'`,this)"/>');

}

//funzione chiamata quando viene premuta una checkbox, modifica la legenda i il grafico
function changeData(nome, element) {
    
    //se viene premuta la checkbox ALL, tutti i dati (e gli altri checkbox) vengono settati a true (o false)
    if(element.name === 'ALL') {
        for(var i=0; i<checked[nome].length; i++) {
            checked[nome][i] = element.checked;
            //console.log(dizionario[nome][i]);
            $('input[name="'+dizionario[nome][i]+'*'+nome+'"]')[0].checked=element.checked;
        }
    }
    else {
        var index = findInDictionary(nome, campo);
        checked[nome][index] = element.checked;
    }
    chart[nome].setData(createDataToPlot(nome)); 
}

//funzione chiamata quando viene premuta la x blu, cancella quel grafico
//TODO: cosa fare dei dati
function delete_chart(element) {
    //ottengo il nome dello span
    // div->div->section->header->SPAN
        $('#'+element).parent().parent().parent().parent().remove();
}
	
	
//quando la pagina è caricata, carico la lista dei dataset disponibili	
$(document).ready(function() {

	//prendo tutti i titoli dei dataset e li metto nel menu
	//ogni grafico rimanda alla pagina stessa e attiva una funzione javascript
	$.ajax({
		url: '/chart_titles',
		async: true,
	    type: "GET",
		success: function(datasets) {
			var results = _.uniq(datasets.results,'dataset_name')
			results.map(function(item){
				var name = item.dataset_name
				$('#trentino_chart').append('<li><a href=# onclick="add_chart(`'+name+'`)" id="chart_'+name+'">' + item.dataset_title + '</a></li>')
			})
		},
	    error: function(data) {
        }
    })
})