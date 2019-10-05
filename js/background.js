var requestsCounter = 0;
var requestsFilterCounter = 0;
var tempRequests = 0;
var callbackCounter = 0;
var settings = undefined;
var worker = undefined;
var filtersPatternRegex = '';
var filters = {};

var counters = {
    requests: 0,
    callbacks: 0,
    average: 0,
    sameDomains: 0,
    externalDomains: 0
};

var stack = [];
var graph = [];
var events = [];

var tabs = {};

var nextRemoteDate = undefined;

console.log("Extenstion Start");

init();

function init() {

    worker = new Worker(chrome.runtime.getURL('js/utilities/worker.js'));

    handleMessageGetSettings(function (result) {

        if (result.settings == undefined) {
            settings = new TrafficoSettings();
            handleMessageSetSettings(function (e) { }, settings)
        } else {
            settings = result.settings;
        }

        handleMessageGetFilters(function (result) {
            filters = result.filters;
            createFilterRegex();

            handleMessageGetEvents(function (result) {
                events = result.events;
                //get all tabs
                chrome.windows.getAll({ populate: true }, function (windows) {

                    windows.forEach(function (window) {

                        window.tabs.forEach(function (tab) {
                            tabs[tab.id] = { id: tab.id, title: tab.title, url: tab.url.toLowerCase(), domain: cleanDomain(tab.url).toLowerCase(), history: {}, counters: { externalDomains: 0, sameDomains: 0, requests: 0 } };
                        });

                        infintiyLoop();
                    });
                });

            });


        })

    });

}

function infintiyLoop() {
    
        if (settings.enableMonitor) {
            counters.callbacks = counters.callbacks + 1;
            counters.requests = counters.requests + tempRequests;

            graph.push([counters.callbacks, tempRequests])

            tempRequests = 0;


            if (stack.length != 0) {
                for (var i = 0; i < stack.length; i++) {
                    processList(stack[i]);
                }

                stack = [];
            }

            chrome.runtime.sendMessage({ type: MESSAGE_GET_REQUESTS, data: { tabs: tabs, counters: counters, graph: graph, events: events } });

            if (graph.length > settings.graphRequestRowsCount) {
                graph.shift();
            }

            if (events.length > settings.maximumEventsRows) {
                events.length = settings.maximumEventsRows;
            }

            if (counters.callbacks % CALLBACK_TO_REMOTE == 0) {
                if (settings.enableRemote) {
                    sendDataRemote({ "tabs": tabs, "events": events, "filters": filters, "counters": counters });
                }
            }

        }
    
    setTimeout(() => {
        infintiyLoop();

    }, parseInt(settings.refreshRate));

}

chrome.runtime.onMessage.addListener(function (message, sender, handler) {


    if (message.type == MESSAGE_GET_SETTINGS) {
        handleMessageGetSettings(handler);
    }

    else if (message.type == MESSAGE_SET_SETTINGS) {
        handleMessageSetSettings(handler, message.settings);
    }

    else if (message.type == MESSAGE_GET_FILTERS) {
        handleMessageGetFilters(handler);
    }

    else if (message.type == MESSAGE_SET_FILTERS) {
        handleMessageSetFilters(handler, message.filters);
    }

    else if (message.type == MESSAGE_CLEAR_LOG) {
        handleClearLog(handler);
    }

    else if (message.type == MESSAGE_CLEAR_EVENTS) {
        handleClearEvents(handler);
    }
});

chrome.webRequest.onCompleted.addListener(function (details) {

}, { urls: ["<all_urls>"] });

chrome.webRequest.onErrorOccurred.addListener(function (details) {

}, { urls: ["<all_urls>"] });


chrome.webRequest.onBeforeRequest.addListener(function (details) {

    var isCancel = { cancel: false };
    if (details.type != undefined) {

        tempRequests = tempRequests + 1;

        if (settings.enableMonitor) {
            stack.push(details);
        }

        if (settings.enableFilters) {

            if (filters != undefined && Object.keys(filters).length != 0) {
                isCancel = processFilterRquest(details.url.toLowerCase(), details.type);

                if(isCancel.cancel) {
                       isCancel = {"redirectUrl": chrome.extension.getURL(REDIRECT_URL)}
                }
            }
        }


        return isCancel;

    }
},
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (tabs[tabId] == undefined || tabs[tabId].domain != cleanDomain(tab.url)) {
        tabs[tabId] = { id: tabId, title: tab.title, url: tab.url.toLowerCase(), domain: cleanDomain(tab.url).toLowerCase(), filters: [], history: {}, counters: { externalDomains: 0, sameDomains: 0, requests: 0 } };
    } else {
        if (tabs[tabId].url != tab.url) {
            tabs[tabId].url = tab.url;
        }
    }

    processFilterDestroyWindow(tab.url, tabId);

    console.log('tab updated');
});



chrome.tabs.onRemoved.addListener(function (tabId, changeInfo, tab) {
    delete tabs[tabId];
});

chrome.cookies.onChanged.addListener(function (info) {

    if (!info.removed) {

        var filter = findFilter(info.cookie.domain);
        if (filter != undefined && filter.enable) {

            var event = { event: 'delete-cookie', pattern: filters[res[0]].pattern, date: new Date(), url: url, status: "pass" };
            if (filter.deleteCookie) {
                chrome.cookies.remove({ url: "https://" + info.cookie.domain + info.cookie.path, name: info.cookie.name })
                event.status = "block";
            }

            setEvent(event);
        }

    }

});

function handleClearEvents(handler) {

    events = Array();
    handler({ status: "success" });
}

function handleClearLog(handler) {
    delete tabs;
    //get all tabs
    chrome.windows.getAll({ populate: true }, function (windows) {
        windows.forEach(function (window) {
            window.tabs.forEach(function (tab) {
                tabs[tab.id] = { id: tab.id, title: tab.title, url: tab.url, domain: cleanDomain(tab.url), filters: [], history: {}, counters: { externalDomains: 0, sameDomains: 0, requests: 0 } };
            });
        });


    });

    handler({ status: "success" });
}

function handleMessageGetEvents(handler) {
    handler({ events: events });
}

function handleMessageSetEvents(hander, newEvents) {
    events = newEvents;
    chrome.storage.local.set({ [STORAGE_KEY_EVENTS]: JSON.stringify(events) });

}

function handleMessageGetSettings(handler) {

    var e = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS));
    if (e == 'null') {
        e = {};
    }

    handler({ settings: e });
}

function handleMessageSetSettings(handler, newSettings) {
    settings = newSettings;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    handler({ status: "success" });
}

function handleMessageGetFilters(handler) {

    createFilterRegex();
    var e = JSON.parse(localStorage.getItem(STORAGE_KEY_FILTERS));
    if (e == 'null') {
        e = {};
    }

    console.log(e)
    handler({ filters: e });
}

function handleMessageSetFilters(handler, newfilters) {
    filters = newfilters;
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
    createFilterRegex();
    handler({ status: "success" })
}

function findFilter(url) {

    var selectedFilter = undefined;

    if (filtersPatternRegex != '') {

        var reg = RegExp(filtersPatternRegex, 'g');
        var res = url.match(reg);
        if (res != null) {
            selectedFilter = filters[res[0]];
        }
    }

    return selectedFilter;
}

function processFilterRquest(url, type) {

    var isCancel = { cancel: false };
    var filter = findFilter(url);

    if (filter != undefined && filter.enable) {
        var event = { event: 'webrequest', pattern: filter.pattern, date: new Date(), url: url, status: "pass" };

        if (filter.blockAll) {
            isCancel.cancel = true;
            event.status = "block";
        } else {

            if (filter.filters[type] != undefined) {
                isCancel.cancel = true;
                event.status = "block";
            }
        }

        setEvent(event);
    }

    return isCancel;
}

function processFilterDestroyWindow(url, tabId) {

    var filter = findFilter(url);

    if (filter != undefined && filter.enable) {
        var event = { event: 'destroy-window', pattern: filter.pattern, date: new Date(), url: url, status: "pass" };
        if (filter.destroyTab) {
            chrome.tabs.remove(tabId, function () {
                delete tabs[tabId];
            });

            event.status = "block";
        }
        setEvent(event);
    }
}

function processList(details) {

    if (tabs[details.tabId] != undefined) {

        var domain = cleanDomain(details.url);
        if (domain.trim() == '') {
            domain = "/";
        }
        var hash = tabs[details.tabId].id.toString() + createHash(domain).toString();
        var urlHash = tabs[details.tabId].id.toString() + createHash(details.url).toString();

        if (tabs[[details.tabId]].history[[hash]] == undefined) {

            //TODO: webassembly psl lib
            if (tabs[[details.tabId]].domain != domain) {
                counters.externalDomains = counters.externalDomains + 1;
                tabs[[details.tabId]].counters.externalDomains = tabs[[details.tabId]].counters.externalDomains + 1;
            } else {
                counters.sameDomains = counters.sameDomains + 1;
                tabs[[details.tabId]].counters.sameDomains = tabs[[details.tabId]].counters.sameDomains + 1;
            }

            tabs[[details.tabId]].history[[hash]] = { domain: domain, hash: hash, counters: { requests: 0 }, types: { [details.type]: 1 } };

        } else {
            if (tabs[[details.tabId]].history[[hash]].types[details.type] == undefined) {
                tabs[[details.tabId]].history[[hash]].types[details.type] = { [details.type]: 1 };
            } else {
                tabs[[details.tabId]].history[[hash]].types[details.type] = tabs[[details.tabId]].history[[hash]].types[details.type] + 1;
            }
        }

        tabs[[details.tabId]].history[[hash]].counters.requests = tabs[details.tabId].history[[hash]].counters.requests + 1;
        tabs[[details.tabId]].counters.requests = tabs[[details.tabId]].counters.requests + 1;
    }
}

function createFilterRegex() {
    if (filters != undefined) {
        filtersPatternRegex = '';
        for (var key in filters) {
            filtersPatternRegex = filtersPatternRegex + key + "|";
        }

        filtersPatternRegex = filtersPatternRegex.substring(0, filtersPatternRegex.length - 1);
    }
}

function setEvent(event) {
    event.tick = event.date.getTime();
    events.unshift(event);
}

function sendDataRemote(data) {
    worker.postMessage({ event: "remote", payload: data });
}



