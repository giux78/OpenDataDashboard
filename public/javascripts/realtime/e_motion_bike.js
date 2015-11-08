/**
Global variables
*/
//data of Rovereto station
var dataRovereto;
//data of Pergine stations
var dataPergine;
//data of Trento stations
var dataTrento;
//mapbox object
var map;
//layer with all marks of the map
var markerLayer;

/**
Function
*/
//delete all mark from the map
function clearData() {
	//mapbox function that delete layer's elements
    markerLayer.clearLayers();
}

//Create a marker for every station
function addPoints() {
	//for every station in the dataset, create a marker
    for(var i=0; i<dataTrento.length; i++) {
        var station=dataTrento[i];
        createMarker(station);
    }
    for(var i=0; i<dataPergine.length; i++) {
        var station=dataPergine[i];
        createMarker(station);
    }
    for(var i=0; i<dataRovereto.length; i++) {
        var station=dataRovereto[i];
        createMarker(station);
    }
}    
 
//create a single marker from a station 
function createMarker(station) {
    var color;
	//calculate the % of available bike
    var percentuale = station.bikes/station.totalSlots;
      
	//select the color based on %  
    if(percentuale>0.8) {
        color = '#347235'; //medium forest green
    }
    else if(percentuale>0.6) {
        color =	'#4AA02C'; //Spring Green     
    }
    else if(percentuale>0.4) {
        color = '#B1FB17'; //Green Yellow
    }
    else if(percentuale>0.2) {
        color = '#FBB917'; //Goldenrod1
    }
    else if(percentuale>0) {
        color = '#ff0000'; //Red
    }
    else {
        color = '#736F6E'; //Grey
    }
	
	//create marker icon, with size, symbol and color
    var icon =    L.mapbox.marker.icon({
                   'marker-color': color, //'#ff8848'
                   'marker-symbol': 'bicycle',
                   'marker-size': 'large'
                 });
	//create marker with icon and title
    var marker = L.marker(station.position, {
               'title': station.name + ' (' + station.bikes + '/'+ station.totalSlots + ' disponibili)'
        
               }).setIcon(icon); 
    //create an onClick popup for the marker           
    marker.bindPopup(station.name+ ": "+station.bikes+" bici disponibili su "+station.totalSlots);
	//add marker to array of marker
    markerLayer.addLayer(marker);
               
}

//make all get request to refresh data
function loadData() {
    var jsonRovereto = httpGet("https://os.smartcommunitylab.it/core.mobility/bikesharing/rovereto");
    dataRovereto = JSON.parse(jsonRovereto);
    var jsonPergine = httpGet("https://os.smartcommunitylab.it/core.mobility/bikesharing/pergine_valsugana");
    dataPergine = JSON.parse(jsonPergine);
    var jsonTrento = httpGet("https://os.smartcommunitylab.it/core.mobility/bikesharing/trento");
    dataTrento = JSON.parse(jsonTrento);
    //console.log(dataTrento);
}

//make a get request with a empty request body
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

$(document).ready(function(){
    // Provide your access token
    L.mapbox.accessToken = 'pk.eyJ1IjoiZ2FicnkxNDciLCJhIjoiZTBhOGQwM2JkN2M4ZTBlNTBiNDU5ZGRiMjQwMTRlYWUifQ.rW736_5MphumA7Per-w4uw';
    // Create a map in the div #bike_div
    map =  L.mapbox.map('bike_div', 'mapbox.streets')
        .setView([45.98749,11.120304],11);//.setView([46.0804614,11.1203557],13);
	//set markerLayer
    markerLayer = new L.MarkerClusterGroup();
	//add layer to map
    map.addLayer(markerLayer);
	//get jsons
    loadData();
	//make and add point
    addPoints();
    var idInterval = setInterval(function(){loadData();clearData();addPoints();}, 5000);
});