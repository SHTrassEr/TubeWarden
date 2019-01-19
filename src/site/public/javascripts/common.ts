const chartColors = {
    red: "rgb(255, 69, 102)",
    orange: "rgb(255, 159, 64)",
    yellow: "rgb(255, 205, 86)",
    green: "rgb(30, 173, 30)",
    blue: "rgb(54, 162, 235)",
    purple: "rgb(153, 102, 255)",
    grey: "rgb(201, 203, 207)",
};

function formatDateTime(date: Date) {
    return moment(date).format("DD.MM.YYYY HH:mm");
}

function formatDate(date: Date) {
    return moment(date).format("DD.MM.YYYY");
}

function initDateTimeValue() {
    const date = new Date(this.getAttribute("data-value"));
    if (date) {
        this.appendChild(document.createTextNode(formatDateTime(date)));
    }
}

function initDateTimeListValue() {
    $(".date-time-value").each(initDateTimeValue);
}

function initDateRangeList() {

    function setDate($element, start, end) {
        const startDate = moment(start);
        const endDate = moment(end);
        const prevStart = moment($element.children("input.start").val());
        const prevEnd = moment($element.children("input.end").val());

        if (startDate.isValid() && endDate.isValid()) {
            $element.children("span").html(formatDate(start) + " - " + formatDate(end));
            $element.children("input.start").val(moment(start).toISOString());
            $element.children("input.end").val(moment(end).toISOString());
            if (!startDate.isSame(prevStart) || !endDate.isSame(prevEnd)) {
                $element.closest("form").submit();
            }
        } else {
            $element.children("span").html("за все время");
            $element.children("input.start").val("");
            $element.children("input.end").val("");
        }
    }

    $(".date-range").each((index, element) => {
        const $element = $(element);
        const startDate = moment($element.children("input.start").val());
        const endDate = moment($element.children("input.end").val());
        const options: daterangepicker.Options = {
            autoUpdateInput: false,
            ranges: {
                "Сегодня": [moment(), moment()],
                "Вчера": [moment().subtract(1, "days"), moment().subtract(1, "days")],
                "Последние 7 дней": [moment().subtract(6, "days"), moment()],
                "Последние 30 дней": [moment().subtract(29, "days"), moment()],
                "Этот месяц": [moment().startOf("month"), moment().endOf("month")],
                "Предыдущий месяц": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
                "Этот год": [moment().startOf("year"), moment().endOf("year")],
                "Предыдущий год": [moment().subtract(1, "year").startOf("year"), moment().subtract(1, "year").endOf("year")],
             },
            locale: {
                cancelLabel: "Очистить",
                applyLabel: "Применить",
                fromLabel: "Начало",
                toLabel: "Окончание",
                customRangeLabel: "Выбрать",
            },
        };

        if (startDate.isValid() && endDate.isValid()) {
            options.startDate = startDate;
            options.endDate = endDate;
        }

        setDate($element, startDate, endDate);

        $element.daterangepicker(options, (start, end) => { setDate($element, start, end); });
    });

    $(".date-range").on("cancel.daterangepicker", function(ev, picker) {
        setDate($(this), null, null);
    });

}

$(document).ready(() => {
    initDateTimeListValue();
    initDateRangeList();
});
