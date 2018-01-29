declare const videoId: string;

(() => {
    function getX(st): number {
        return ((st.updatedAt.getTime() / 1000) );
    }

    function getAngle2(stl, stm, str, yf: string): [number, number] {
        if (getX(str) !== getX(stm) && getX(stm) !== getX(stl)) {

            if (stl[yf] === stm[yf] && stm[yf] === str[yf]) {
                return [0, 0];
            }

            if (!stl[yf] || !stm[yf] || !str[yf]) {
                return [0, 0];
            }

            if (str[yf] < 350) {
                return [0, 0];
            }

            const p1 =  {
                x: 0,
                y: 0,
            };

            const p2 =  {
                x: 0,
                y: 0,
            };

            p1.x = (getX(stl) - getX(stm)) * -1;
            p1.y = (stl[yf] - stm[yf]) * -1;

            p2.x = getX(str) - getX(stm);
            p2.y = str[yf] - stm[yf];

            const positiveAngle = getVectorAngle(p1, p2);
            let negativeAngle = 0;

            if (p2.y < 0) {
                p1.y = 0;
                negativeAngle = getVectorAngle(p1, p2);
            }

            return [positiveAngle, negativeAngle];
        }

        return [0, 0];
    }

    function getVectorAngle(p1, p2) {

        if ((p1.x > 60 * 60  || (p2.x > 60 * 60 ))) {
            return 0;
        }

        const cos = ((p1.x * p2.x + p1.y * p2.y) / Math.pow(p1.x * p1.x + p1.y * p1.y, 0.5)) / Math.pow(p2.x * p2.x + p2.y * p2.y, 0.5);
        if (cos >= 1) {
            return 0;
        }

        const angle = Math.acos(cos);
        return angle;
    }

    function createAnnotation(textColor, labelList) {
        return {
            labelOptions: {
                borderRadius: 2,
                padding: 2,
                backgroundColor: "rgba(252, 255, 197, 0.7)",
                borderWidth: 1,
                borderColor: "#AAA",
                style: {
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: textColor,
                },
            },
            labels: labelList,
        };
    }

    function createAnnotationLabel(x, y, angle, labelList) {
        let annotationText = null;
        if (angle && angle[1] >= 0.6) {
            annotationText = "?";
        } else if (angle && angle[0] >= 0.6) {
            annotationText = "!";
        }

        if (annotationText) {
            labelList.push({point: {
                x,
                y,
                xAxis: 0,
                yAxis: 0,
                },
                text: annotationText,
            });
        }
    }

    function initData(data, chart) {

        const likeViolationList = [];
        const dislikeViolationList = [];

        chart.series = [{
            color: chartColors.green,
            name: "Лайки",
            data: [],
        }, {
            color: chartColors.red,
            name: "Дизлайки",
            data: [],
        }, {
            color: chartColors.orange,
            name: "Просмотры",
            visible: false,
            data: [],
        }];

        chart.annotations = [
            createAnnotation(chartColors.green, likeViolationList),
            createAnnotation(chartColors.red, dislikeViolationList),
        ];

        let stl;
        let stm;
        let stmd;
        let date;
        let str;

        let likeAngle;
        let dislikeAngle;

        for (const d of data) {
            d.updatedAt = new Date(d.updatedAt);
            stl = stm;
            stm = str;
            str = d;

            if (stl != null)  {
                likeAngle = getAngle2(stl, stm, str, "likeCount");
                dislikeAngle = getAngle2(stl, stm, str, "dislikeCount");
            }
            stmd = date;
            date = d.updatedAt.getTime();

            createAnnotationLabel(stmd, d.likeCount, likeAngle, likeViolationList);
            createAnnotationLabel(stmd, d.dislikeCount, dislikeAngle, dislikeViolationList);

            chart.series[0].data.push([date, d.likeCount]);
            chart.series[1].data.push([date, d.dislikeCount]);
            chart.series[2].data.push([date, d.viewCount]);
        }
    }

    function initRatingChart(data, container) {

        const chart: any = {
            chart: {
                zoomType: "xy",
                panning: true,
                panKey: "shift",
            },
            tooltip: {
                crosshairs: true,
                shared: true,
            },
            title: {
                text: "",
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

    $(document).ready(() => {
        $.getJSON("/api/statistics/" + videoId, (data) => {
            initRatingChart(data, "statisticsLikeChart");
        });

    });
})();
