//Javascript function that manage charts and dashboards

/*
GLOBAL VARIABLES ###########################################
*/

//data grouped by chart, grouped by year, filled by every chart request
var allData = {};

//array of "dictionary", the list of label. Chart's name is used as key value to find related dictionary
//Assumption: it can contain data of deleted chart (no need to garbage collection and data can be reused)
var dizionario = {};

//array of true/false variabiable that match dicionary's labels, grouped by chart. true=label dsplayed, false=label not displayed
//Assumption: checked.length = dizionario.length (never controlled but created together with same length) 
//Assumption: every indexes of both array are related to same data
//Assumption: it can contain data of deleted chart
var checked = {};

//morris chart arrays, useful to modify chart
var chart = {};

//varieble useful for view_dashboard to get the right data, never modified in create_dashboard
var isCreate = true;
// END global variables ####################################

/*
FUNCTIONS ##################################################
*/

/* Parameter:
    name: chart name
    viewDashType: used only in view_dashboard, is the type needed (GET request return all type of chart data related to name)
    
Behavior:
    get chart data from server and call the functions to create chart
*/
function add_chart(name, viewDashType) {
    //ajax request for data
    console.log("chart request");
	$.ajax({
		url: '/chart/' + name,
		async: true,
	    type: "GET",
	    success: function(datasets) {
	        console.log("get chart data:");
	        console.log(datasets)
	        if(datasets.status === 'ok'){
	            //result = array of chart data
	        	var results = datasets.results
	        	 //map every chart
	        	 results.map(function(myDataset){
	        	     var name = myDataset.dataset_name
	        		 var title = myDataset.dataset_title
	                 var data = myDataset.result
	                 var chartType = myDataset.chart_type
	                 if (data.length != 0){
	                    //chartType: comunita_valle | comuni | bar_chart
	                	//se non esiste il div (premuta la x per cancellarlo oppure prima richiesta) disegno il grafico
	                	if($('#' + name + '_' + chartType + '_div').length===0) {
	                	    //create dashboard: always true, view dashboard: true if type=chartType
	                	    if(isCreate===true || chartType===viewDashType) {
	                           draw_chart(chartType, name + '_' + chartType + '_div', name+'_'+chartType, title, data);
	                	    }
	                	    //create dashboard: always true, view dashboard: false
	                	    if(isCreate===true) {
	                          $("#salva").show();
	                	        
	                	    }
	                	}
    	    		}
	    	   });//end map
	       }
		},
		error: function(data) {
			    console.log("error collecting data");
		}
	});
}
	
/* Parameter:
    chartType: chart type selected from 'comuni', 'comunita_valle', 'bar_chart'
    divID: name of div used to create the plot
    name: name of the chart, used as key in global variables
    title: title to display in html
    data: raw data get from server
Behavior:
    create plot and legend for chart
*/
function draw_chart(chartType, divID, name, title, data) {
    var pixel;
    var title_info;
    switch(chartType) {
		case 'comunita_valle': {
		    //variable set for html
		    pixel='400';
		    title_info = ' per Comunità di Valle';
		    createHTML(name, divID, pixel, title, title_info)
			//value formatted for morris.js
			if(dizionario[name]===undefined) groupValue(name, data);
            drawPlot(name,divID, chartType);
            //legend for chart
            createLegend(name, divID);
            break;
		}
		case 'comuni': {
			pixel='600';
		    title_info = ' per Comuni';
		    createHTML(name, divID, pixel, title, title_info)
			if(dizionario[name]===undefined) groupValue(name, data);
            drawPlot(name,divID, chartType);
            createLegend(name, divID);
            break;
		}
		//TODO
		case 'bar_chart': {
		    pixel='400';
		    title_info=''
    		createHTML(name, divID, pixel, title, title_info)
			break;
		}
		default: console.log("chartType error")
    }
}

/* Parameter:
    divID: name of div used to create the plot
    name: name of the chart
    pixel: number of pixel heigth of chart (as String)
    title_info: info to add to title in order to display it in html
Behavior:
    create html for a chart
*/
function createHTML(name, div, pixel, title, title_info) {
    //html to create chart with title and legend
    // tip: ` = Alt + 0180 on windows
    var html1 = '<div class="row"><div class="col-md-12"><section class="panel"><header class="panel-heading"><span id="';//+name
    var html2 = '_title"></span><span class="tools pull-right"> <a href="javascript:show_chart(`';//+name
    var html3 = '`);" class="fa fa-chevron-down"></a><a href="javascript:hide_chart(`';//+name
    var html4 = '`);" class="fa fa-chevron-up"></a><a href="javascript:delete_chart(`';//+name
    var html5 = '`);" class="fa fa-times"></a></span></header><div class="panel-body"><div id="';//+divID
    var html6 = '" style="width:100%; min-width:350px; height:';//+number of pixel
    var html7 = 'px; text-align: center; margin:0 auto;"></div></div></section></div></div>';
    $('#chart_div').append(html1 + name + html2 + name + html3 + name + html4 + name + html5 + div + html6 + pixel + html7)
	$('#'+name+'_title').html(title+title_info)
	console.log("html created");
}

/* Parameter:
    name: name of the chart, used as key
    data: raw data from server
Behavior:
    format raw data to store it grouped by year and create its dizionario and its cheched 
*/
function groupValue(nome, data) {
    //for every instance in raw data
    for(var i=0; i<data.length; i++) {
        // extract year, label, value
        var anno = data[i].anno;
        var descriz = data[i].descriz;
        var valore = data[i].valore;
        //create arrays if they don't exist
        if(chart[nome]===undefined) {
            chart[nome] = [nome];
            chart[nome] = [];
        }
        if(dizionario[nome]===undefined) {
            dizionario[nome] = [nome];
            dizionario[nome] = [];
        }
        if(checked[nome]===undefined) {
            checked[nome] = [nome];
            checked[nome] = [];
        }
        if(allData[nome]===undefined) {
            allData[nome] = [nome];
            allData[nome] = [];
        }

        //search if name is already in dizionario
        var index = findInDictionary(nome, descriz);
        //if not, adds it
        if(index===-1) {
            //add to dizionario
            dizionario[nome].push(descriz);
            //add to checked (needed only in create_dashboard)
            if(isCreate===true)checked[nome].push(true);
        }
        //if it's first "year" instance, create array for it
        if(allData[nome][anno]===undefined) {
            allData[nome][anno] = [anno];
            allData[nome][anno] = [];
        }
        //store data in array with chart as key
        allData[nome][anno].push(data[i]);
    }
}

/* Parameter:
    nome: name of the chart, used as key
    campo: label to find
Behavior:
    search for the label in dizionario
Return: 
    the index of the label (or -1 if it's not in dizionario)
*/
function findInDictionary(nome, campo) {
    for(var j=0; j<dizionario[nome].length; j++) {
        if(campo === dizionario[nome][j]) return j; 
    }
    return -1;
}

/* Parameter:
    nome: name of the chart, used as key
    divId: id of div where morris.js will create the plot
Behavior:
    call morris.js function to create plot without
*/
function drawPlot(nome, divID, tipo) {
    var hideHoverLegend = true; //show legend when cursor is on chart
    if(tipo ==='comuni') hideHoverLegend='always'; //hide legend
    max = dizionario[nome].length;
    var colorList = []
    for(var i=0; i<max; i++) {
            //random color in 3 digits exa (in decimal notation)
            //floor = toInt
            colorNumber1 = Math.floor(Math.random()*255);
            colorNumber2 = Math.floor(Math.random()*255);
            colorNumber3 = Math.floor(Math.random()*255);
            color = "rgb("+colorNumber1+","+colorNumber2+","+colorNumber3+")"
            console.log(color);
            colorList.push(color)
    }
    chart[nome] = Morris.Line({
        element: divID,
        data: createDataToPlot(nome), //filter function based on checked
        xkey: 'anno',
        ykeys: dizionario[nome],
        lineColors: colorList,
        labels: dizionario[nome],
        hideHover: hideHoverLegend
    });
    console.log("morris.js chart created")
}

/* Parameter:
    nome: name of the chart, used as key
Behavior:
    given all data for a chart, filter only data checked and create morris.js formatted data
    (in first run on create_dashboard, only format data, data are all checked)
Return: 
    the array of formatted data
*/
function createDataToPlot(nome) {
    //output value to create
    var list = [];
    //for every year array of the chart
    for(var anno in allData[nome]) {
        //took data for selected year
        var listAnno=allData[nome][anno];
        //variable to store data for selected year
        var point = {};
        //create field year
        point['anno'] = ['anno'];
        point['anno'] = listAnno[0].anno;
        //for every data in selected year, add it if it's checked
        for(var i=0; i<listAnno.length; i++) {
            var titolo = listAnno[i].descriz;
            //find checked index using dizionario
            var index = findInDictionary(nome, titolo);       
            if(checked[nome][index]) {
                point[titolo] = [titolo]
                point[titolo] = parseInt(listAnno[i].valore);
            }
            
        }
        //console.log('point created:');
        //console.log(point);
        list.push(point);
    }
    return list
}

/* Parameter:
    nome: name of the chart, used as key
    divID: id of the chart div
Behavior:
    create html to show a checkbox legend after the chart div (a section that is in the div that contain all the info for this chart)
*/
function createLegend(nome, divID) {
    //take element by its ID
    var div = document.getElementById(divID);
    //for every label, starting from the last one because 'afterend' invert the order 
    //backquote: Alt + 0180
    //creation of html string
    var html_leg_0 = '<span class="label label-default" style="display: inline-block; margin:1px; background-color:';//+color
    var html_leg_1 = '">'; //+label
    var html_leg_2 = '<input name="'; //+nome*label
    var html_leg_3 = '" type="checkbox" value="html" ';//+value checked
    var html_leg_4 = ' onChange="changeData(`';//+name
    var html_leg_5 = '`,this)"/></span>';
    console.log("colori")
    //for every label, take label name and index
    chart[nome].options.labels.forEach(function(label, i){
        //find the label in dizionario
        var index = findInDictionary(nome, label);
        var isOn = "";
        //if is checked, add checked attribute
        if(checked[nome][index]) isOn = "checked";
        //create and add html
        if(checked[nome][i] || isCreate===true) {
            div.insertAdjacentHTML('afterend', html_leg_0 + chart[nome].options.lineColors[i] + html_leg_1 + label + html_leg_2 + dizionario[nome][i]+'*'+nome + html_leg_3 + isOn + html_leg_4 + nome + html_leg_5);
        }
    });
    //create button disable/enable all only in create_dashboard
    if(isCreate) {
		//DON'T change 'ALL', is needed to match on changeData function
        div.insertAdjacentHTML('afterend', html_leg_0 + html_leg_1 + 'DE/SELEZIONA TUTTO'+ html_leg_2 + 'ALL' +html_leg_3 + "checked" + html_leg_4 + nome + html_leg_5);
    }
}

/* Parameter:
    nome: name of the chart, used as key
    element: checkbox element that call this function
Behavior:
    change value in array checked using checkbox value and redraw the plot
*/
function changeData(nome, element) {
    //case: checkbox ALL
    if(element.name === 'ALL') {
        //set all element (on array checked and on html checkbox) to the value of checkbox ALL
        for(var i=0; i<checked[nome].length; i++) {
            checked[nome][i] = element.checked;
            $('input[name="'+dizionario[nome][i]+'*'+nome+'"]')[0].checked=element.checked;
        }
    }
    //case: checkbox with a name of a single label
    else {
        //split id in label and name, saving only label
        var campo = (element.name).split('*')[0];
        //find position of label in chcked using dizionario
        var index = findInDictionary(nome, campo);
        //set new value
        checked[nome][index] = element.checked;
    }
    //setData is a morris.js function to redraw the plot, need as aparameter the data to plot
    chart[nome].setData(createDataToPlot(nome)); 
}

/* Parameter: 
    element: the html element that call this function (the "X")
Behavior:
    delete the plot from html and morris.js instance
*/
function delete_chart(element) {
    //from the element that call function to the div that contain all chart info, then remove it
    // Hierarchy: div->div->section->header->SPAN
    $('#'+element+'_title').parent().parent().parent().parent().remove();
    //delete morris.js instance (no chart without div and in this way chart array can be used to create dashboard saved json)
	delete chart[element];
}

/* Parameter: 
    element: the html element that call this function (the "^")
Behavior:
    hide from and legend html, maintaining the title and buttons
*/
function hide_chart(element) {
    // Hierarchy: div with all chart info -> div with header and panel body with chart and legend->section->header->SPAN
    //from element that call the function to the div that contain all chart info
    //in the div that contain all, find the child (.panel.body) that contain chart and legend
    //it doesn't anything if chart is already hide
    $('#'+element+'_title').parent().parent().parent().parent().find( ".panel-body" ).hide(500); //500: hide in 0,5sec, only for cool animation
}

/* Parameter: 
    element: the html element that call this function (the "^")
Behavior:
    show the plot from html, maintaining the title and buttons
*/
function show_chart(element) {
    //from element to div that contain all, then show the div with chart and legend
    //see hide_chart() function for more details
    $('#'+element+'_title').parent().parent().parent().parent().find( ".panel-body" ).show();
}

/* Behavior:
    once save button is clicked, this function create the json that store dashboard data and send it to server, 
    returning to the user the code necessary to reuse the dashboard
*/
function save_dashboard(){
    //if chart number is lower than this value, dashboard will not be saved
    var grafici = 2;
    if(Object.keys(chart).length<grafici) {
        alert("Non puoi salvare un dashboard con meno di "+grafici+" grafici");
    }
    //dashboard will be saved
    else {
        //this variable will be filled with array of chart info
    	var board = [];
    	//for every chart. Instance = key for the chart, name + type
    	for(var instance in chart) {
    	    //variable with info of a single chart
    		var chartdata = {};
    		//key splitted by character '_', that divide name and type
    		var token = instance.split('_');
    		//first token is always a part of name
    		var name = token[0];
    		//var for type originally empty
    		var typevalue = '';
    		//if there are some '_' in the name, the for build the name
    		//length-2: comunita_valle has 2 token, so it can't be sure that length-1 is part of name
    		for(var i=1; i<token.length-2; i++) {
    			name+='_'+token[i];
    		}
    		//if type is not comunita_valle, add the length-1 element
    		if(token[token.length-1]!=='valle') {
    		    //if token.length=2, function have already store the name (name=token[0])
    		    if(token.length>2) {
    			    name+=token[token.length-2];
    		    }
    		    //type is a single token
    		    typevalue=token[token.length-1];
    		}
    		else{
    		    //type is 'comunita' + '_' + 'valle'
    			typevalue=token[token.length-2]+'_'+token[token.length-1];
    		}
    		//all data are ready to be inserted in chartdata
    		//before insert data, it's necessary to create fields
    		chartdata['name']=['name'];
    		chartdata['name']=name;
    		chartdata['chartType']=['chartType'];
    		chartdata['chartType']=typevalue;
    		chartdata['checked']=['checked'];
    		chartdata['checked']=checked[instance];
    		board.push(chartdata);
    	}
    	//encapsulate array in a single object
    	var fromArrayToOneJson = {"data":board}
		//from object to a json string
    	json_board = JSON.stringify(fromArrayToOneJson);   	
    	console.log("dashboard saved:");
    	console.log(json_board);
		//POST request to save dashboard
    	$.ajax({
            url: "/post_dashboard",
            type: "POST",
            data: json_board,
            contentType: "application/json",
            dataType: "json", //response
            success: function (result) {
                $("#salva").hide(); //it will re-appear after next "add_chart()"
				//append dashboard code after salva button
                document.getElementById("salva").insertAdjacentHTML('afterend', '<span class="label label-default" style="display: inline-block; margin:1px">'+result.code+'</span>');
                alert("Dashboard salvato con codice:\n\n"+result.code+ "\n\nSalvalo e riusalo quando vuoi!");
            },
            error: function(xhr, status, error) {
              var err = eval("(" + xhr.responseText + ")");
              alert(err.Message);
            }
        });
    }
}
	
/* #ONLY for view_dashboard 
Behavior:
	once send code button is clicked, send a get request to get data and draw the dashboard
*/
function visualize_dashboard(){
    //Very important! isCreate = true is for create_dashboard only 
    /*GET request give all kind of dashboard for a given name, even not necessary one. A uncessary dashboard with isCreate=true WILL BE draw (empty)*/
    isCreate = false;
	//get the code from textbox
    var id = $("#text_form").val()
	//check is textbox is empty or null
	if(id!=="" && id!==undefined) {
		$.ajax({
			url: '/dashboard/' + id,
		    type: "GET",
			success: function(json) {
				if(json.status==="ok") {
					//draw all chart
					draw_dashboard(json.results)
					//set text for the label that reload the page
					$("#span_reload").text("Clicca qui per usare un'altra dashboard al posto di quella in uso")
					//hide form -> for change the dashboard it's necessary to reload the page (possible using the reload label)
					$("#dashboard_form").hide()
				}
				else {
					//error message
					alert("Codice non riconosciuto o errore interno, riprova")
				}
			},
			error: function() {

			}
		});
     }
 }

/* #ONLY for view_dashboard 
Parameter:
	data: array of json
Behavior:
	for every array in the json, draw the related chart
*/
function draw_dashboard(data) {
	//for every object
    for (var chartdata in data) {
		//extract data
        var name = data[chartdata].name
        //overriding global variable
        chartDataType = data[chartdata].chartType
		//create cheched array using "checked" field
        checked[name + '_' + chartDataType] = [name + '_' + chartDataType]
        checked[name + '_' + chartDataType] = data[chartdata].checked
		//draw related chart
        add_chart(name, chartDataType)
     }
 }