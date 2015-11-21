//custom load function for show_dashboard
//get code and drw dashboard
$(document).ready(function() {
    //when html is ready
	$( window ).load(function() {
        var url_path = window.location.pathname.split( '/' );
        var dash_code = url_path[url_path.length-1];
        if( /[^a-zA-Z0-9]/.test(dash_code)) {
            alert("Codice non valido");
        }
        else {
            show_dashboard(dash_code); 
        }
    });
})