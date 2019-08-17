var DOMAIN_UNKONWN = 'unknown';
var BTN_START = '#btn_start';
var BTN_STOP = '#btn_stop';

var PANEL_DOMAIN = '#panel_domain';
var PANEL_LOGS = '#panel_logs';

var CONTAINERS_LOGS = '#containers_log';

var CHART_REQUESTS = "chart_requests";

var logSynch = false;
var isRunning = false;

var pager = undefined;
var chartRequests = undefined;
var chartSites = undefined;
var settings = undefined;
var response = undefined;
var popup = undefined;

var filters = {};


$('#script_graphloader').ready(function () {

    $(BTN_START).on('click', runListener);
    $(BTN_STOP).on('click', stopListener);

    try
    {
        init();
    }
    catch(error) {
        console.log(error);
    }

});

function init() {
    google.charts.load('visualization', '1.0', { packages: ['corechart'] });

    google.charts.setOnLoadCallback(function (e) {
        console.log(e);

        $(buttons.BTN_SAVE_SETTINGS).on('click', saveSettings);
        $(buttons.BTN_CREATE_FILTER).on('click', loadFilter);
        $(buttons.BTN_FILTER_ADD).on('click', saveFilter);
        $(buttons.BTN_LOG_DELETE).on('click', deleteLog);
        $(buttons.BTN_LOG_DOWNLOAD).on('click', saveLog)
        $(buttons.BTN_FILTERS_LOG).on('click', loadFilterLog);
        $(buttons.BTN_PACKAGE_DOWNLOAD).on('click', loadPacakge);
        $(buttons.BTN_EVENTS_DELETE).on('click', deleteEvents);

        $(checkboxes.CHK_FILRER_BLOCK_ALL).on('change', blockAllChange);

        chrome.runtime.sendMessage({ type: MESSAGE_GET_SETTINGS }, function (response) {
            
            settings = response.settings;

            var monitor = monitorStatus.OFFLINE;
            if(settings.enableMonitor == true) {
                monitor = monitorStatus.ONLINE;
            }

            $(labels.LBL_DASHBOARD_STATUS).html(monitor);

            chrome.runtime.sendMessage({ type: MESSAGE_GET_FILTERS }, function (response) {
                delete filters;
                filters = response;
                loadTimer(true);
            });

            
        });
    });

    chrome.cookies.getAll({}, function callback(result) {

        console.log(result);

    })
}

function loadTimer(isFirstLoader) {


    setTimeout(() => {

        if (!logSynch && isRunning) {

            logSynch = true;

            try {
                callBackground(isFirstLoader);
            }
            catch {
                logSynch = true;
                console.error("Unable Call Background!");
            }


        }

        loadTimer(false);

    }, settings.refreshRate);

}


function callBackground(isFirstLoader) {

    chrome.runtime.sendMessage({ type: MESSAGE_GET_REQUESTS }, function (_response) {
        
        delete response;

        response = _response
        var previous = 0;
        if ($(labels.LBL_TOTAL_REQUESTS).html() != "...") {
            previous = parseInt($(labels.LBL_TOTAL_REQUESTS).html());
            var avg = response.counters.requests - previous;
            $(labels.LBL_AVG_REQUESTS).html(avg);
        }

        $(labels.LBL_TOTAL_REQUESTS).html(response.counters.requests);

        if (response.tabs != undefined && response.tabs.length != 0) {


            for (var key in response.tabs) {

                if ($("#d_" +  response.tabs[key].id).length == 0) {
                    $(CONTAINERS_LOGS).append(createLogTabRow(response.tabs[key]));

                    $('#d_' + response.tabs[key].id).on('click', displayHistoryRows)
                } else {
                    if ($('#a_' + response.tabs[key].id).html() != response.tabs[key].domain) {
                        $('#a_' + response.tabs[key].id).html(response.tabs[key].domain);
                    }
                }

                var src = "../assets/point.png";
                var title = "";

                if (settings.enableParanoid) {

                    if (response.tabs[key].counters.externalDomains < settings.paranoid.low) {
                        src = paranoidResources.low.img;
                        title = paranoidResources.low.title;
                    } else if (response.tabs[key].counters.externalDomains < settings.paranoid.medium) {
                        title = paranoidResources.medium.title;
                        src = paranoidResources.medium.img;
                    } else {
                        title = paranoidResources.high.title;
                        src = paranoidResources.high.img;
                    }
                }


                $('#i_' + response.tabs[key].id).attr('src', src).attr('title', title);
                $('#s_' + response.tabs[key].id).html(response.tabs[key].counters.requests);
            }

        }

        response.graph.unshift(["Pulse", "Requests"]);
        loadChart(google.visualization.arrayToDataTable(response.graph), CHART_REQUESTS, "Requests", chartRequests);

        if(response.events.length != 0) {
            events = response.events;
            displayEventsLogRows();
        }


        if (isFirstLoader) {
            pager = new Navigator();
            popup = new PopupHandler();
            pager.swipePanels(panels.loader, panels.home);
        }

        logSynch = false;
    });

}

function loadInfo(e) {

    e.stopPropagation();

    var domain = e.currentTarget.attributes.domain.value;
    var initiator = e.currentTarget.attributes.initiator.value;
    var tabID = e.currentTarget.attributes.tab.value;
    var el = response.tabs[e.currentTarget.attributes.tab.value].history[initiator]

    $(labels.LBL_INFO_DOMAIN).html(fixLength(e.currentTarget.parentElement.attributes.domain.value, URL_MAX_LENGTH, "...")).attr('title', e.currentTarget.parentElement.attributes.domain.value);

    $(labels.LBL_INFO_REFERENCE).html(fixLength(domain, REFERENCE_MAX_LENGTH, "...")).attr('title', domain);
    $(labels.LBL_INFO_REFERENCE).attr('domain', domain);

    $('.ex-ui-info-flag').html("0");
    $('#info_urls').html('');
    if (el.urls != undefined) {
        for (var key in el.urls) {
            var splitter = el.urls[key].url.split('/');
            $('#info_urls').append("<div title='" + el.urls[key].url + "' class='ex-log-row' style='font-size:12px;min-height:16px'>"
                + "<div style='float:left;' id='n_" + key + "'><img src='../assets/clipboard.png' width='16' /></div>"
                + "<div style='float:left; padding-left:5px'>" + fixLength(splitter[splitter.length - 1], URL_MAX_LENGTH, "...").toLowerCase() + "</div>"
                + "<div class='ex-ui-log-row-requests' style='min-height:17px'>" + el.urls[key].hits + "</div>"
                + "</div>");

            $('#n_' + key).on('click', loadNewTab);
        }


    }

    $(labels.LBL_INFO_TOTAL_REQUESTS).html(el.counters.requests);
   
    $(HAMBURGER).fadeOut(10);
    $(BACK).attr('from',  panels.information);
    $(BACK).attr('to',  panels.home);
    $(BACK).fadeIn(10);

    pager.swipePanels(panels.home, panels.information);

}

function loadSettings() {

    $(textboxes.TXB_SETTINGS_REFRESH_RATE).val(settings.refreshRate);
    $(textboxes.TXB_SETTINGS_MAX_GRAPH).val(settings.graphRequestRowsCount);
    $(textboxes.TXB_SETTINGS_PARANOID_LOW).val(settings.paranoid.low);
    $(textboxes.TXB_SETTINGS_PARANOID_MEDIUM).val(settings.paranoid.medium);
    $(textboxes.TXB_SETTINGS_PARANOID_HIGH).val(settings.paranoid.high);
    $(textboxes.TXB_SETTINGS_MAX_EVENTS).val(settings.maximumEventsRows);

    if (settings.enableParanoid) {
        $(checkboxes.CHK_SETTINGS_PARANOID).attr('checked', 'checked');
        $(textboxes.TXB_SETTINGS_PARANOID_LOW).removeAttr('disabled');
        $(textboxes.TXB_SETTINGS_PARANOID_MEDIUM).removeAttr('disabled');
        $(textboxes.TXB_SETTINGS_PARANOID_HIGH).removeAttr('disabled');

    } else {
        $(checkboxes.CHK_SETTINGS_PARANOID).removeAttr('checked');
        $(textboxes.TXB_SETTINGS_PARANOID_LOW).attr('disabled', 'disabled');
        $(textboxes.TXB_SETTINGS_PARANOID_MEDIUM).attr('disabled', 'disabled');
        $(textboxes.TXB_SETTINGS_PARANOID_HIGH).attr('disabled', 'disabled');
    }

    if (settings.enableMonitor) {
        $(checkboxes.CHK_SETTINGS_MONITOR).attr('checked', 'checked');
    } else {
        $(checkboxes.CHK_SETTINGS_MONITOR).removeAttr('checked');
    }

    if (settings.enableFilters) {
        $(checkboxes.CHK_SETTINGS_FILTERS).attr('checked', 'checked');
    } else {
        $(checkboxes.CHK_SETTINGS_FILTERS).removeAttr('checked');
    }


}

function loadAbout() {
    var manifestData = chrome.runtime.getManifest();
    var version = manifestData.version;
    $(labels.LBL_ABOUT_TITLE).html(manifestData.name)
    $(labels.LBL_ABOUT_VERSION).html(version);
}

function loadNewTab(e) {
    //e.stopPropagation();
    chrome.tabs.create({ url: e.currentTarget.parentElement.attributes.title.value, active: false });
}

function loadChart(data, id, title) {

    try {
        if (id == CHART_REQUESTS) {
            var options = returnAreaChartOptions(title, '#1d528c');
            if (chartRequests == undefined) {
                chartRequests = new google.visualization.AreaChart(document.getElementById(id));
            } else {
                //chartRequests.clearChart();
            }

            chartRequests.draw(data, options);
        }
    }
    catch {

    }
}

function saveSettings() {

    var isValid = true;
    var cpSettings = new TrafficoSettings();

    $(".ex-ui-error").css("display", "none");
    $(".ex-ui-error").html('');

    if(!checkNumaricLimits(textboxes.TXB_SETTINGS_REFRESH_RATE)) {
        return;
    }
    cpSettings.refreshRate = $(textboxes.TXB_SETTINGS_REFRESH_RATE).val();
    
    if(!checkNumaricLimits(textboxes.TXB_SETTINGS_MAX_GRAPH)) {
        return;
    }
    cpSettings.graphRequestRowsCount = $(textboxes.TXB_SETTINGS_MAX_GRAPH).val();
    
    if(!checkNumaricLimits(textboxes.TXB_SETTINGS_MAX_EVENTS)) {
        return;
    }
    cpSettings.maximumEventsRows = $(textboxes.TXB_SETTINGS_MAX_EVENTS).val();
   
    if ($(checkboxes.CHK_SETTINGS_PARANOID).is(":checked")) {
        cpSettings.paranoid.low = parseInt($(textboxes.TXB_SETTINGS_PARANOID_LOW).val());
        cpSettings.paranoid.medium = parseInt($(textboxes.TXB_SETTINGS_PARANOID_MEDIUM).val());

        if (!isNumber(cpSettings.paranoid.low) || !isNumber(cpSettings.paranoid.medium)) {
            isValid = false;
            popup.displayDialog("Error...", errors[0], false, undefined, undefined);
            return isValid;
        }

        if (cpSettings.paranoid.low >= cpSettings.paranoid.medium) {
            isValid = false;
            popup.displayDialog("Error...", errors[3], false, undefined, undefined);
            return isValid;
        }
    } else {
        cpSettings.enableParanoid = false;
    }

    if ($(checkboxes.CHK_SETTINGS_FILTERS).is(":checked")) {
        cpSettings.enableFilters = true;
    } else {
        cpSettings.enableFilters = false;
    }

    if ($(checkboxes.CHK_SETTINGS_MONITOR).is(":checked")) {
        cpSettings.enableMonitor = true;
    } else {
        cpSettings.enableMonitor = false;
    }

    if ($(checkboxes.CHK_SETTINGS_REMOTE).is(":checked")) {
        cpSettings.enableRemote = true;
    } else {
        cpSettings.enableRemote = false;
    }

    if (isValid) {


        $(buttons.BTN_SAVE_SETTINGS_TITLE).attr('disabled', 'disabled');
        $(buttons.BTN_SAVE_SETTINGS_TITLE).html("Updating...");

        settings = cpSettings;

        setTimeout(function () {
            chrome.runtime.sendMessage({ type: MESSAGE_SET_SETTINGS, settings: settings }, function (response) {
                $(buttons.BTN_SAVE_SETTINGS_TITLE).html("Save");
                $(buttons.BTN_SAVE_SETTINGS_TITLE).removeAttr('disabled');
            });
        }, 500);

    }

}



