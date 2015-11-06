var ids = ["prodOra","prodTot","CO2","alberi","impianti","potenza"];
var titoli = ["Produzione Giornaliera", "Produzione Totale dall'accensione dell'impianto", "CO2 risparmiata", "Alberi equivalenti al valore di CO2 non immesso", "Numero impianti", "Potenza"];
var udm = [" kWh", " MWh", " tonnellate", "", "", " kW"];

$(document).ready(function() {
    var idInterval = setInterval(loadData(), 3600000);
});

function loadData() {
    var xml = httpGet("http://allow-any-origin.appspot.com/http://fotovoltaico.provincia.tn.it/solar.xml");   
    xml = parseXml(xml);
    var root = xml.documentElement;
    var nodes = root.getElementsByTagName('valore');
    for (i=0; i < nodes.length; i++) {
        var value = nodes[i].childNodes[0].nodeValue;
        $('#'+ids[i]).text(titoli[i] + ': ' + value + udm[i]);
    }
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

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