var data;
var tempChart;
var tempData = [];
var umChart;
var umData = [];
var dirVChart;
var dirVData = [];
var velVChart;
var velVData = [];
var potChart;
var potData = [];
var airChart;
var airData = [];
var chart = {};

$(document).ready(function () {
    loadData();
    console.log(data);
    makeAllPlot();
    var intervalId = setInterval(function() {updateAll();}, 120000);
});

function loadData() {
    var json = httpGet("http://allow-any-origin.appspot.com/http://campodenno.taslab.eu/stazioni/json?id=CMD001");
    //console.log(json);
    data = JSON.parse(json);
    //console.log(data);
    data=data.Response.result.measures.sensor;
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function timestampFormatter(string) {
    //31/12/2015 14.29
    //2015-12-31 14:29
    string = string.split(" ");
    var date = string[0].split("/");
    var time = string[1].split(".");
    return date[2]+"-"+date[1]+"-"+date[0]+" "+time[0]+":"+time[1];
}

function makePoint(dataList) {
    var point = {};
    point['timestamp'] = ["timestamp"];
    point['timestamp'] = timestampFormatter(dataList[0].timestamp);
    for(var i=0; i<dataList.length; i++) {
        var sensor = dataList[i];
        point[sensor.name] = [sensor.name];
        point[sensor.name] = sensor.value;
    }
    return point;
}

function makePlot(divId, dataIn, dataset) {
    var labels = [];
    for(var i=0; i<dataIn.length; i++) {
        labels.push(dataIn[i].name);
    }
    
    return Morris.Line({
        element: divId,
        data: dataset,
        xkey: 'timestamp',
        ykeys: labels,
        labels: labels,
        postUnits: dataIn[0].um,
        resize: true
    });
}

function createHTML(name, pixel, title) {
    //html to create chart with title and legend
    // tip: ` = Alt + 0180 on windows
    var html1 = '<div class="row"><div class="col-md-12"><section class="panel"><header class="panel-heading"><span id="';//+name
    var html2 = '_title"></span><span class="tools pull-right"> <a href="javascript:show_chart(`';//+name
    var html3 = '`);" class="fa fa-chevron-down"></a><a href="javascript:hide_chart(`';//+name
    var html4 = '`);" class="fa fa-chevron-up"></a></span></header><div class="panel-body"><div id="';//+name as div
    var html5 = '" style="width:100%;height:';//+number of pixel
    var html6 = 'px; text-align: center; margin:0 auto;"></div></div></section></div></div>';
    $('#chart_div').append(html1 + name + html2 + name + html3 + name + html4 + name + html5 + pixel + html6)
	$('#'+name+'_title').html(title)
	console.log("html created");
}

function makeAllPlot() {
    tempData.push(makePoint([data[0].measure[0]]));
    createHTML("temperatura", "300", "Temperatura rilevata")
    tempChart = makePlot("temperatura", [data[0].measure[0]],tempData);
    chart["temperatura"] = ["temperatura"];
    chart["temperatura"] = tempChart;
    
    umData.push(makePoint([data[0].measure[1]]));
    createHTML("umidita", "300", "Umidità rilevata")
    umChart = makePlot("umidita", [data[0].measure[1]],umData);
    chart["umidita"] = ["umidita"];
    chart["umidita"] = umChart;
    
    dirVData.push(makePoint([data[0].measure[2]]));
    createHTML("dir_vento", "300", "Direzione del vento")
    dirVChart = makePlot("dir_vento", [data[0].measure[2]],dirVData);
    chart["dir_vento"] = ["dir_vento"];
    chart["dir_vento"] = dirVChart;
    
    velVData.push(makePoint([data[0].measure[3]]));
    createHTML("vel_vento", "300", "Velocità del vento")
    velVChart = makePlot("vel_vento", [data[0].measure[3]],velVData);
    chart["vel_vento"] = ["vel_vento"];
    chart["vel_vento"] = velVChart;
    
    potData.push(makePoint([data[1].measure]));
    createHTML("potenza", "300", "Potenza energetica impegnata dal sistema illuminazione intelligente")
    potChart = makePlot("potenza", [data[1].measure],potData);
    chart["potenza"] = ["potenza"];
    chart["potenza"] = potChart;
    
    airData.push(makePoint([data[2].measure, data[3].measure, data[4].measure, data[5].measure]));
    createHTML("aria", "400", "Qualità dell'aria")
    airChart = makePlot("aria", [data[2].measure, data[3].measure, data[4].measure, data[5].measure],airData);
    chart["aria"] = ["aria"];
    chart["aria"] = airChart;
}

function updateAll() {
    console.log("update");
    loadData();
    
    var max = 20;
    
    var point = makePoint([data[0].measure[0]]);
    tempData.push(point);
    if(tempData.length>max) tempData.shift();
    tempChart.setData(tempData);
    
    point = makePoint([data[0].measure[1]]);
    umData.push(point);
    if(umData.length>max) umData.shift();
    umChart.setData(umData);
    
    point = makePoint([data[0].measure[2]]);
    dirVData.push(point);
    if(dirVData.length>max) dirVData.shift();
    dirVChart.setData(dirVData);
    
    point = makePoint([data[0].measure[3]]);
    velVData.push(point);
    if(velVData.length>max) velVData.shift();
    velVChart.setData(velVData);
    
    point = makePoint([data[1].measure]);
    potData.push(point);
    if(potData.length>max) potData.shift();
    potChart.setData(potData);
    
    point = makePoint([data[2].measure, data[3].measure, data[4].measure, data[5].measure]);
    airData.push(point);
    if(airData.length>max) airData.shift();
    airChart.setData(airData);
}

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
    chart[element].redraw();
}