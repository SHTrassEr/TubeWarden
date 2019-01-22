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
                name: d.word + " (" + d.trends.total + ")",
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
        const end = moment($("#dEnd").val() as string);
        return {
            startDate: start.isValid() ? start.toISOString() : (new Date(2017, 11, 31)).toISOString(),
            endDate: end.isValid() ? end.toISOString() : null,
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

    function updateChart(updateHistory?: boolean) {
        const requestData = getApiRequestData();
        if (requestData.s) {
            if (updateHistory && window.history && window.history.pushState) {
                let params = "s=" + encodeURIComponent(requestData.s);
                const start = moment($("#dStart").val() as string);
                const end = moment($("#dEnd").val() as string);
                if (start.isValid()) {
                    params += "&start=" + start.toISOString();
                }
                if (end.isValid()) {
                    params += "&end=" + end.toISOString();
                }

                window.history.pushState("", "", "/trends?" + params);
            }

            $.getJSON("/api/trendsWordList", requestData, (data) => {
                initTrendsChart(data, "trendsChart");
            });
        }
    }

    $(document).ready(() => {
        $("#btnSubmit").click(() => updateChart(true));

        $(".date-range").on("date-range:changed", (e) => {
            updateChart(true);
        });

        $("#tbQuery").on("keypress", (e) => {
            if (e.which === 13) {
                updateChart(true);
            }
        });

        if (getQuery()) {
            updateChart(false);
        }
    });
})();
