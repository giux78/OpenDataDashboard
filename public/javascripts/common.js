/**
 * 
 */
$(document).ready(function() {
	
    $.ajax({
		url: '/chart_titles',
		async: true,
	    type: "GET",
		success: function(datasets) {
			var results = _.uniq(datasets.results,'dataset_name')
			results.map(function(item){
				var name = item.dataset_name
				$('#trentino_chart').append('<li><a href="/dashboard_chart/'+ name+'" id="chart_'+name+'">' + item.dataset_title + '</a></li>')
			})
		},
	    error: function(data) {
        }
    })
    
})