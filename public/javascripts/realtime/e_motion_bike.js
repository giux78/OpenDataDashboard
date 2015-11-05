var dataRovereto;
var dataPergine;
var dataTrento;
var map;
var markerLayer;

function clearData() {
    markerLayer.clearLayers();
}

function addPoints() {
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
    
function createMarker(station) {
    var color;
    var percentuale = station.bikes/station.totalSlots;
      
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
    var icon =    L.mapbox.marker.icon({
                   'marker-color': color, //'#ff8848'
                   'marker-symbol': 'bicycle',
                   'marker-size': 'large'
                 });
    var marker = L.marker(station.position, {
               'title': station.name + ' (' + station.bikes + '/'+ station.totalSlots + ' disponibili)'
        
               }).setIcon(icon); 
               
    marker.bindPopup(station.name+ ": "+station.bikes+" bici disponibili su "+station.totalSlots);
    markerLayer.addLayer(marker);
               
}

function loadData() {
    var jsonRovereto = httpGet("https://os.smartcommunitylab.it/core.mobility/bikesharing/rovereto");
    dataRovereto = JSON.parse(jsonRovereto);
    var jsonPergine = httpGet("https://os.smartcommunitylab.it/core.mobility/bikesharing/pergine_valsugana");
    dataPergine = JSON.parse(jsonPergine);
    var jsonTrento = httpGet("https://os.smartcommunitylab.it/core.mobility/bikesharing/trento");
    dataTrento = JSON.parse(jsonTrento);
    //console.log(dataTrento);
}

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
    markerLayer = new L.MarkerClusterGroup();
    map.addLayer(markerLayer);
    loadData();
    addPoints();
    var idInterval = setInterval(function(){loadData();clearData();addPoints();}, 5000);
});