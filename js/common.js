var JTAG = '#';
var HAMBURGER = "#hamburger";
var BACK = "#back"
var CALLBACK_TO_REMOTE = 50;

var DOMAIN_UNKONWN = "unkonwn";

var MESSAGE_GET_REQUESTS = "message_get_requests";
var MESSAGE_GET_LOGS = 'message_get_logs';
var MESSAGE_GET_SETTINGS = "message_get_settings";
var MESSAGE_SET_SETTINGS = "message_set_settings";
var MESSAGE_GET_FILTERS = "message_get_filters";
var MESSAGE_SET_FILTERS = "message_set_filters";
var MESSAGE_CLEAR_LOG = "message_clear_log";
var MESSAGE_CLEAR_EVENTS = "message_clear_events";
var MESSAGE_REFRESH_EVENTS = "message_refresh_events";

var STORAGE_KEY_SETTINGS = "settings";
var STORAGE_KEY_FILTERS = "filters";
var STORAGE_KEY_EVENTS = "events";

var STR_MAX_LENGTH = 25;
var URL_MAX_LENGTH = 27;
var REFERENCE_MAX_LENGTH = 27;
var EVENT_MAX_LENGTH = 32;
var PATTERN_MINIMUM_LENGTH = 2;

var HEADER_TITLE_SPAN = "#header_title_span";
var HD_FILTER_SELECTED = "#hid_filter_selected"
var REDIRECT_URL = "html/blank.html";
var monitorStatus = {
    ONLINE: "Online",
    OFFLINE: "Offline"
}

var filterStatus = {
    ACTIVE: "Active",
    DISABLED: "Disabled"
}

var errors = {
    0: 'insert numbers only',
    1: "Value is lower than minimum",
    2: "Value is higher than maximum",
    3: "Low value cannot be equal or bigger from medium value",
    4: "Pattern Minimum Length: ",
    5: "No filter selected",
    6: "Pattern already exists",
    7: "No filter selected"
}

var panels = {
    loader: 'loader',
    home: 'panel_home',
    information: 'panel_info',
    filters: 'panel_filters',
    settings: 'panel_settings',
    about: 'panel_about',
    events: 'panel_events',
    packages: 'panel_packages',
    menu: 'menu',
    popup: 'popup'
};

var buttons = {
    BTN_SAVE_SETTINGS: '#btn_save_settings',
    BTN_FILTER_ADD: '#btn_filter_add',
    BTN_SAVE_SETTINGS_TITLE: '#btn_save_settings_title',
    BTN_LOG_DOWNLOAD: "#btn_log_download",
    BTN_LOG_DELETE: "#btn_log_delete",
    BTN_MENU_HOME: "#btn_home",
    BTN_MENU_FILTERS: "#btn_filters",
    BTN_MENU_SETTINGS: "#btn_settings",
    BTN_MENU_ABOUT: "#btn_about",
    BTN_POPUP_CANCEL: "#btn_popup_cancel",
    BTN_POPUP_OK: "#btn_popup_ok",
    BTN_POPUP_CLOSE: "#btn_popup_close",
    BTN_FILTERS_LOG: "#btn_filters_log",
    BTN_PACKAGE_DOWNLOAD: "#btn_package_download",
    BTN_EVENTS_DELETE: "#btn_events_delete",
    BTN_EVENTS_REFRESH: "#btn_events_refresh",
    BTN_ABOUT_UPDATES: "#btn_updates"
 };
 
 var checkboxes = {
     CHK_FILRER_BLOCK_ALL: '#chk_filter_block_all',
     CHK_FILTER_DELETE_COOKIE: '#chk_filter_delete_cookie',
     CHK_FILTER_DESTROY_TAB: '#chk_filter_destroy_tab',
     CHK_SETTINGS_PARANOID: '#chk_settings_paranoid',
     CHK_SETTINGS_MONITOR: '#chk_settings_monitor',
     CHK_SETTINGS_FILTERS: '#chk_settings_filters',
     CHK_SETTINGS_REMOTE: '#chk_settings_remote',
 };

 var textboxes = {
     TXB_DOMAIN: '#txb_domain',
     TXB_PATTERN: '#txb_pattern',
     TXB_SETTINGS_REFRESH_RATE: '#txb_settings_refresh_rate',
     TXB_SETTINGS_MAX_GRAPH: '#txb_settings_max_graph',
     TXB_SETTINGS_PARANOID_LOW: '#txb_settings_paranoid_low',
     TXB_SETTINGS_PARANOID_MEDIUM:'#txb_settings_paranoid_medium',
     TXB_SETTINGS_PARANOID_HIGH: '#txb_settings_paranoid_high',
     TXB_SETTINGS_MAX_EVENTS: '#txb_settings_max_events'
 }

 var wrappers = {
     WRAPPER_ALL_FILTERS: '#wrapper_all_filters',
     WRAPPER_FILTER_LIST: '#wrapper_filters_list',
     WRAPPER_EVENTS_LIST: '#wrapper_events_list',
     WRAPPER_PACKAGES_LIST: '#wrapper_packages_list'
 }

 var labels = {
    LBL_INFO_DOMAIN: '#lbl_info_domain',
    LBL_INFO_REFERENCE: '#lbl_info_reference',
    LBL_INFO_TOTAL_REQUESTS: '#lbl_info_total_requests',
    LBL_ABOUT_TITLE: '#lbl_about_title',
    LBL_ABOUT_VERSION: '#lbl_about_version',
    LBL_TOTAL_REQUESTS: '#lbl_total_requests',
    LBL_AVG_REQUESTS: '#lbl_avg_requests',
    LBL_DASHBOARD_STATUS: '#lbl_dashboard_status',
    LBL_POPUP_TITLE: '#lbl_popup_title',
    LBL_POPUP_MESSAGE: '#lbl_popup_message',
    LBL_EVENTS_TOTAL_BLOCKS: '#lbl_events_total_blocks'
 };

 var paranoidResources = {
    low: {title: 'Paranoid: Low', img:'../assets/point_low.png'},
    medium: {title: 'Paranoid: Medium', img:'../assets/point_medium.png'},
    high: {title: 'Paranoid: High!', img:'../assets/point_high.png'},
 }

function cleanDomain(domain) {
    if (domain == undefined) {
        return DOMAIN_UNKONWN;
    }
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (domain.indexOf("//") > -1) {
        hostname = domain.split('/')[2];
    }
    else {
        hostname = domain.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function isExternal(url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (match != null && typeof match[1] === 'string' &&
        match[1].length > 0 && match[1].toLowerCase() !== location.protocol)
        return true;
    if (match != null && typeof match[2] === 'string' &&
        match[2].length > 0 &&
        match[2].replace(new RegExp(':('+{'http:':80,'https:':443}[location.protocol]+')?$'),'')
           !== location.host) {
        return true;
    }
    else {
        return false;
    }
}

function createHash(str) {
    
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            //hash |= 0; // Convert to 32bit integer
  }
  return hash;

}

function fixLength(str, MAX, pattern) {
    if(str.length < MAX) {
        return str;
    }

    return str.substring(0, MAX - pattern.length) + pattern;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function downloadFileFromText(filename, content) {
    var a = document.createElement('a');
    var blob = new Blob([ content ], {type : "text/plain;charset=UTF-8"});
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click(); //this is probably the key - simulating a click on a download link
    delete a;// we don't need this anymore
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function humanDate(noDate) {
    var d = new Date(noDate);

    return fixNumaricPrefix(d.getDate(), 10, "0") 
    + "-" + fixNumaricPrefix(d.getMonth(), 10, "0") 
    + "-" + d.getFullYear() 
    + " " + fixNumaricPrefix(d.getHours(), 10, "0") 
    + ":" + fixNumaricPrefix(d.getMinutes(), 10, "0") 
    + " " + fixNumaricPrefix(d.getSeconds(), 10, "0");
}

function fixNumaricPrefix(value, minValue, prefix) {
    if(value < minValue) {
        return prefix + value;
    }
    return value;
}

function checkNumaricLimits(id) {
    isValid = true;
    var value = $(id).val();
    if (!isNumber(value)) {
        isValid = false;
        popup.displayDialog("Error...", errors[0], false, undefined, undefined);
        return isValid; 
    }

    var min = parseInt($(id).attr('min'));
    var max = parseInt($(id).attr('max'));

    if (value < min) {
        isValid = false;
        popup.displayDialog("Error...", errors[1] + '<br />Limit:' + min, false, undefined, undefined);
        return isValid;
    }

    if (value > max ) {
        isValid = false;
        popup.displayDialog("Error...", errors[2] + '<br />Limit:' + max, false, undefined, undefined);
        return isValid;
    }

    return isValid;
}

function returnAreaChartOptions(title, color) {
    var options = {
        titleTextStyle: {
            color: '#ffffff',
            fontName: 'Open Sans',
            fontSize: '18',
        },
        colors: [color],
        width: '250px',
        height: '90',
        chartArea: {
            left: 30,
            right: 15,
            top: 30,
            right: 0,
            bottom: 15,
            width: '250px',
            height: '90',
        },
        backgroundColor: '#f1f1f1',
        title: "",
        hAxis: {
            title: '',
            titleTextStyle: { color: '#132031' },
            gridlines: {
                color: 'transparent'
            }
        },
        vAxis: {
            viewWindowMode: 'explicit',
            viewWindow: { min: 0 },
            minValue: 0,
            gridlines: {
                color: '#808080'
            },

        },
        legend: { position: "none" },
    };

    return options;
}


function ajax(url, callback) {
    $.ajax({
        url: url,
        method: 'POST',
        complete: function (data) {
            if (callback != undefined) {
                callback(data);
            }
        }
    });
}