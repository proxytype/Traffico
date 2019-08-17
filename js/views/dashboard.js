function createLogTabRow(tab) {

    var html = "<div id='d_" + tab.id + "' class='ex-log-row' initiator='" + tab.id + "'>"
                + "<div style='width:100%; display:inline-block'>"
                    + "<div style='float:left; margin-right:5px; margin-top:3px'><img id='i_" + tab.id + "' src='../assets/point.png' width='12' /></div>"
                    + "<div id='a_" + tab.id + "' style='float:left'>" + tab.domain + "</div>"
                    + "<div id='s_" + tab.id + "' class='ex-ui-log-row-requests'>0</div>"
                + "</div>"
            + "<div id='c_" + tab.id + "' style='width:100%; display:none' domain='" + tab.domain + "'></div>"
        + "</div>";

    return html;
}

function createHistoryRow(history, container, tabDomain, tabID) {
    var html = '';

    for (var key in history) {
        if ($('#h_' + key).length == 0) {
            var his = "<div id='h_" + key + "' initiator='" + key + "' tab='" + tabID + "' domain='" + history[key].domain + "' title='" + history[key].domain + "' style='padding-top:5px; padding-left:15px; width:90%; display:inline-block'>"
                    + "<div style='width:100%;'>"
                        + "<div style='float:left; padding-right:5px; margin-top:3px'><img src='../assets/arrow_normal.png' width='8' /></div>"
                        + "<div style='float:left'>" + fixLength(history[key].domain, STR_MAX_LENGTH, "...") + "</div>"
                        + "<div id='t_" + key + "' class='ex-ui-log-row-requests'>0</div>"
                    + "</div>"
                + "</div>";

            $(container).append(his);

            $('#h_' + key).on('click', loadInfo);

        }

        $('#t_' + key).html(history[key].counters.requests);
    }

}

function displayHistoryRows(e) {


    var key = e.currentTarget.attributes.initiator.value;
    var id = "#c_" + key;

    console.log(id);

    if ($(id).css('display') == 'none') {
        createHistoryRow(response.tabs[key].history, id, response.tabs[key].domain, response.tabs[key].id);
        $(id).css('display', 'inline-block');
    } else {
        $(id).css('display', 'none');
    }
}

function deleteLog() {

    popup.displayDialog("Delete Log?", "Are you sure you want to delete?<br />This will be irreversible", true, function(){
        chrome.runtime.sendMessage({ type: MESSAGE_CLEAR_LOG }, function (response) {});
    }, undefined);

}

function saveLog() {

    var d = new Date();
    var filename = humanDate(d.getTime()) + ".json";

    downloadFileFromText(filename, JSON.stringify(response.tabs));
}