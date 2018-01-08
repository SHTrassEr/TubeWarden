function initDateTimeValue() {
    var elList = document.getElementsByClassName("date-time-value");
    
    for(var i = 0; i < elList.length; i++) {
        var el = elList[i];
        var date = new Date(el.getAttribute("data-value"));
        if(date) {
            el.innerText = moment(date).format("DD-MM-YYYY HH:mm");
        }
    }
}

$(document).ready(function() {
    initDateTimeValue();
});