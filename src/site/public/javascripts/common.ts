function initDateTimeValue() {
    $(".date-time-value").each(() => {
        const date = new Date(this.getAttribute("data-value"));
        if (date) {
            this.appendChild (document.createTextNode(moment(date).format("DD-MM-YYYY HH:mm")));
        }
    });
}

$(document).ready(() => {
    initDateTimeValue();
});
