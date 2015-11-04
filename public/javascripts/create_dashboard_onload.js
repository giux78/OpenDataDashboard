//when page is loaded, load all dataset title
$(document).ready(function() {
	$.ajax({
		url: '/chart_titles',
		async: true,
	    type: "GET",
		success: function(datasets) {
			//get unique dataset names from json
			var results = _.uniq(datasets.results,'dataset_name')
			//for every name
			results.map(function(item){
				var name = item.dataset_name
				//every name is added to menu as href to the page itself, with a onClick function that draw the related chart
				$('#trentino_chart').append('<li><a href=# onclick="add_chart(`'+name+'`)" id="chart_'+name+'">' + item.dataset_title + '</a></li>')
			})
		},
	    error: function(data) {
        }
    })
})