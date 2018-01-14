(() => {
    const doughnutOptions = {
        responsive: true,
        title: {
            display: false,
        },
    };

    function createSummaryHash(summaryList: any): Map<string, number> {
        return summaryList.reduce((map, obj) => {
            map[obj.id] = obj.value;
            return map;
        }, {});
    }

    function initTotalVideoRatingChart(summary: any, ctx) {
        const chartData = {
            datasets: [{
                data: [ summary.likeViolationCount, summary.dislikeViolationCount, summary.likeAndDislikeViolationCount ],
                backgroundColor: [chartColors.green, chartColors.red, chartColors.orange],
            }],
            labels: ["лайки", "дизлайки", "лайки и дизлайки"],
        };
        const chart = new Chart(ctx, { type: "doughnut", data: chartData, options: doughnutOptions });
    }

    function initTotalVideoChart(summary: any, ctx) {
        const chartData = {
            datasets: [{
                data: [ summary.violationVideoCount, (summary.videoCount - summary.violationVideoCount) ],
                backgroundColor: [chartColors.red, chartColors.grey],
            }],
            labels: ["подозрительные", "без нарушений"],
        };
        const chart = new Chart(ctx, { type: "doughnut", data: chartData, options: doughnutOptions });
    }

    $(document).ready(() => {
        $.getJSON("/api/summaryList", (data) => {
            const summary = createSummaryHash(data);
            const ctxTotalVideo = (document.getElementById("summaryTotalVideoChart") as HTMLCanvasElement).getContext("2d");
            initTotalVideoChart(summary, ctxTotalVideo);

            const ctxTotalVideoRating = (document.getElementById("summaryTotalVideoRatingChart") as HTMLCanvasElement).getContext("2d");
            initTotalVideoRatingChart(summary, ctxTotalVideoRating);
        });
    });
})();
