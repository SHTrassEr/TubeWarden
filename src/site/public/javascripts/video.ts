declare const videoId: string;

(() => {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0,
        },
        tooltips: {
            mode: "label",
            callbacks: {
                title: (tooltipItem, data) => {
                    return moment(tooltipItem[0].xLabel).format("DD-MM-YYYY HH:mm");
                },
            },
        },
        elements: {
            point: {
                radius: 2 ,
                hitRadius: 3,
                hoverRadius: 3,
            },
        },
        scales: {
            xAxes: [{
                type: "time",
                time: {
                    displayFormats: {
                        millisecond: "HH:mm:ss",
                        second: "HH:mm:ss",
                        minute: "HH:mm",
                        hour: "HH:mm",
                        day: "MMM D",
                        week: "ll",
                        month: "MMM YYYY",
                        quarter: "[Q]Q - YYYY",
                        year: "YYYY",
                     },
                },
            }],
        },
    };

    function initRatingChart(data, ctx) {
        const chartData = {
            datasets: [{
                label: "Лайков",
                backgroundColor: chartColors.green,
                borderColor: chartColors.green,
                fill: false,
                lineTension: 0,
                data: data.map((d) => ( {x: new Date (d.updatedAt), y: d.likeCount } )),
            },
            {
                label: "Дизлайков",
                fill: false,
                backgroundColor: chartColors.red,
                borderColor: chartColors.red,
                lineTension: 0,
                data: data.map((d) => ({x: new Date (d.updatedAt), y: d.dislikeCount } )),
            }],
        };

        const chart = new Chart(ctx, { type: "line", data: chartData, options: chartOptions });
    }

    function initViewChart(data, ctx) {
        const chartData = {
            datasets: [{
                label: "Просмотров",
                fill: false,
                backgroundColor: chartColors.orange,
                borderColor: chartColors.orange,
                lineTension: 0,
                data: data.map((d) => ({x: new Date (d.updatedAt), y: d.viewCount } )),
            }],
        };

        const chart = new Chart(ctx, { type: "line", data: chartData, options: chartOptions });
    }

    $(document).ready(() => {
        $.getJSON("/api/statistics/" + videoId, (data) => {
            const ctxRating = (document.getElementById("statisticsLikeChart") as HTMLCanvasElement).getContext("2d");
            const ctxView = (document.getElementById("statisticsViewChart") as HTMLCanvasElement).getContext("2d");
            initRatingChart(data, ctxRating);
            initViewChart(data, ctxView);
        });

    });
})();
