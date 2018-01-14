const chartColors = {
    red: "rgb(255, 99, 132)",
    orange: "rgb(255, 159, 64)",
    yellow: "rgb(255, 205, 86)",
    green: "rgb(75, 192, 192)",
    blue: "rgb(54, 162, 235)",
    purple: "rgb(153, 102, 255)",
    grey: "rgb(201, 203, 207)",
};

function formatDateTime(date: Date) {
    return moment(date).format("DD-MM-YYYY HH:mm");
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

$(document).ready(() => {
    initDateTimeListValue();
});
