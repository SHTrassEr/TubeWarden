(() => {

    function initData(data, chart) {

        const colors = [
            "#e41a1c",
            "#377eb8",
            "#4daf4a",
            "#984ea3",
            "#ff7f00",
            "#ffff33"];
        const series = [];
        for (const d of data) {
            const sr = {
                color: colors[series.length],
                name: d.word,
                step: "center",
                pointStart: (new Date(d.trends.startDate)).getTime(),
                pointInterval: d.trends.interval,
                data: d.trends.data,
            };

            series.push(sr);
        }

        chart.series = series;
    }

    function initTrendsChart(data, container) {

        const chart: any = {
            chart: {
                zoomType: "xy",
                panning: true,
                panKey: "shift",
                type: "spline",
            },
            tooltip: {
                crosshairs: true,
                shared: true,
            },
            title: {
                text: "",
            },
            time: {
                useUTC: false,
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: "",
                },
            },
            yAxis: {
                title: {
                    text: "",
                },
            },
            series: null,
            annotations: null,
        };
        initData(data, chart);
        return Highcharts.chart(container, chart);
    }

    function getQuery(): string {
        return $("#tbQuery").val() as string;
    }

    function getDateRange() {
        const start = moment($("#dStart").val() as string);
        const end = moment($("#dStart").val() as string);
        return {
            startDate: start.isValid() ? start.valueOf() : null,
            endDate: end.isValid() ? end.valueOf() : null,
        };
    }

    function getApiRequestData() {
        const dateRange = getDateRange();
        return {
            s: getQuery(),
            start: dateRange.startDate,
            end: dateRange.endDate,
        };
    }

    function updateChart() {
        $.getJSON("/api/trendsWordList", getApiRequestData(), (data) => {
            initTrendsChart(data, "trendsChart");
        });
    }

    $(document).ready(() => {
        $("#btnSubmit").click(updateChart);
    });
})();
