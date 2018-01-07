$(document).ready(function() {


    var options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0
        },
        tooltips: {
            callbacks: {
                title: function(tooltipItem, data) {
                    return moment(tooltipItem[0].xLabel).format("DD-MM-YYYY HH:mm");
                }
            }
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
                type: "time",
                time: {
                    displayFormats: {
                        'millisecond': 'HH:mm:ss',
                        'second': 'HH:mm:ss',
                        'minute': 'HH:mm',
                        'hour': 'HH:mm',
                        'day': 'MMM D',
                        'week': 'll',
                        'month': 'MMM YYYY',
                        'quarter': '[Q]Q - YYYY',
                        'year': 'YYYY',
                     }
                }
            }]
        }
    };

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
                    data: data.map((d) => {return {x: new Date (d.updatedAt), y:d.likeCount } })
                },
                {
                    label: "Дизлайков",
                    fill: false,
                    backgroundColor: '#de1616',
                    borderColor: '#de1616',
                    lineTension: 0,
                    data: data.map((d) => {return {x: new Date (d.updatedAt), y:d.dislikeCount } })
                }]
            },
            options: options
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
                    data: data.map((d) => {return {x: new Date (d.updatedAt), y:d.viewCount } })
                }]
            },
            options: options
        });

    });
});
