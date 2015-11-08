/**
 * Global Variables 
 */
//list of id of div
var ids = ["prodOra","prodTot","CO2","alberi","impianti","potenza"];
//list of title for html spans
var titoli = ["Produzione Giornaliera", "Produzione Totale dall'accensione dell'impianto", "CO2 risparmiata", "Alberi equivalenti al valore di CO2 non immesso", "Numero impianti", "Potenza"];
//list of units of measure
var udm = [" kWh", " MWh", " tonnellate", "", "", " kW"];

//on document load and every hour, load data
$(document).ready(function() {
    var idInterval = setInterval(loadData(), 3600000);
});

//load xml and reload html
function loadData() {
    //load xml from PAT
    var xml = httpGet("http://allow-any-origin.appspot.com/http://fotovoltaico.provincia.tn.it/solar.xml");
    //parse xml to get readable data
    xml = parseXml(xml);
    //get root of xml tree
    var root = xml.documentElement;
    //get all ordered node that have tag valore
    var nodes = root.getElementsByTagName('valore');
    for (i=0; i < nodes.length; i++) {
        //get value of node
        var value = nodes[i].childNodes[0].nodeValue;
        //set text of html span with new value
        $('#'+ids[i]).text(titoli[i] + ': ' + value + udm[i]);
    }
}

//GET with empty request
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

//search for an available parser and parse the xml
function parseXml(xmlStr) {
    if (typeof window.DOMParser !== "undefined") {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
        }
    else if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
       var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
       }
    else {
            throw new Error("No XML parser found");
    }   
}