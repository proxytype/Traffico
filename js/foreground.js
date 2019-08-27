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
var settings = undefined;

var popup = undefined;

var response = undefined;
var filters = {};
var isloaded = false;

$('#script_graphloader').ready(function () {

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
        $(buttons.BTN_FILTER_ADD).on('click', saveFilter);
        $(buttons.BTN_LOG_DELETE).on('click', deleteLog);
        $(buttons.BTN_LOG_DOWNLOAD).on('click', saveLog)
        $(buttons.BTN_FILTERS_LOG).on('click', loadFilterLog);
        $(buttons.BTN_PACKAGE_DOWNLOAD).on('click', loadPacakge);
        $(buttons.BTN_EVENTS_DELETE).on('click', deleteEvents);
        $(buttons.BTN_EVENTS_REFRESH).on('click', eventRefresh);
        $(buttons.BTN_ABOUT_UPDATES).on('click', checkForUpdates);

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
                isRunning = true;
                pager = new Navigator();
                popup = new PopupHandler();
                
                chrome.runtime.onMessage.addListener(backgroundFeedback);
            });

            
        });
    });

}


function backgroundFeedback(message, sender, handler) {

    if(!isloaded) {
        isloaded = true;
        pager.swipePanels(panels.loader, panels.home);
    }

    if(message.type == MESSAGE_GET_REQUESTS) {

        if(message.data != undefined) {
            delete response;

            response = message.data;
            var previous = 0;

            $totalRequests = $(labels.LBL_TOTAL_REQUESTS);

            if ($totalRequests.html() != "...") {
                previous = parseInt($totalRequests.html());
                var avg = response.counters.requests - previous;
                $(labels.LBL_AVG_REQUESTS).html(avg);
            }

            $totalRequests.html(response.counters.requests);

            if (response.tabs != undefined && response.tabs.length != 0) {

                $containersLog = $(CONTAINERS_LOGS);

                for (var key in response.tabs) {

                    if ($("#d_" +  response.tabs[key].id).length == 0) {
                        $containersLog.append(createLogTabRow(response.tabs[key]));

                        $("#d_" +  response.tabs[key].id).on('click', displayHistoryRows)
                    } else {
                        $a = $('#a_' + response.tabs[key].id);
                        if ($a.html() != response.tabs[key].domain) {
                            $a.html(response.tabs[key].domain);
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
        }
    }    
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
                chartRequests.clearChart();
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

function eventRefresh() {

}

function checkForUpdates() {

}


