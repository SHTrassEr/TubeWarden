$(document).ready(function() {

    $.getJSON("/api/statistics/" + videoId, function(data) 
    {
        var ctxLike = document.getElementById('statisticsLikeChart').getContext('2d');
        var chartLike = new Chart(ctxLike, {
            type: 'line',
            data: {
                datasets: [{
                    label: "likesCount",
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false,
                    lineTension: 0,
                    data: data.map((d) => {return {x: new Date (d.createdAt), y:d.likeCount } })
                },
                {
                    label: "dislikeCount",
                    fill: false,
                    backgroundColor: 'rgb(255, 132, 99)',
                    borderColor: 'rgb(255, 132, 99)',
                    lineTension: 0,
                    data: data.map((d) => {return {x: new Date (d.createdAt), y:d.dislikeCount } })
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    point: { 
                        radius: 2 ,
                        hitRadius: 3, 
                        hoverRadius: 3
                    }
                },
                scales: {
					xAxes: [{
                        type: "time"
                    }]
                }
            }
        });


        var ctxView = document.getElementById('statisticsViewChart').getContext('2d');
        var chartView = new Chart(ctxView, {
            type: 'line',
            data: {
                datasets: [{
                    label: "viewCount",
                    fill: false,
                    backgroundColor: 'rgb(255, 80, 99)',
                    borderColor: 'rgb(255, 80, 99)',
                    lineTension: 0,
                    data: data.map((d) => {return {x: new Date (d.createdAt), y:d.viewCount } })
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    point: { 
                        radius: 2 ,
                        hitRadius: 3, 
                        hoverRadius: 3
                    }
                },
                scales: {
					xAxes: [{
                        type: "time"
                    }]
                }
            }
        });

    });
});
