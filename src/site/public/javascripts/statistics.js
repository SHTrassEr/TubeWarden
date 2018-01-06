$(document).ready(function() {

    $.getJSON("/api/statistics/" + videoId, function(data) 
    {
        var ctxLike = document.getElementById('statisticsLikeChart').getContext('2d');
        var chartLike = new Chart(ctxLike, {
            type: 'line',
            data: {
                datasets: [{
                    label: "Лайков",
                    backgroundColor: '#268808',
                    borderColor: '#268808',
                    fill: false,
                    lineTension: 0,
                    data: data.map((d) => {return {x: new Date (d.createdAt), y:d.likeCount } })
                },
                {
                    label: "Дизлайков",
                    fill: false,
                    backgroundColor: '#de1616',
                    borderColor: '#de1616',
                    lineTension: 0,
                    data: data.map((d) => {return {x: new Date (d.createdAt), y:d.dislikeCount } })
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
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
                    label: "Просмотров",
                    fill: false,
                    backgroundColor: '#1664de',
                    borderColor: '#1664de',
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
                animation: {
                    duration: 0
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
