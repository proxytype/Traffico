function loadFilter(e) {

    chrome.runtime.sendMessage({ type: MESSAGE_GET_FILTERS }, function (response) { 
        console.log(response);
        filters = response.filters;
        $(wrappers.WRAPPER_FILTER_LIST).html('');
        displayFiltersRows();

        $(textboxes.TXB_PATTERN).val($(labels.LBL_INFO_REFERENCE).attr('domain'));
        $(HAMBURGER).fadeIn(10);
        $(BACK).fadeOut(10);
        pager.swipePanels(panels.information, panels.filters);
    });
}

function loadFilterLog(e) {

    $(HAMBURGER).fadeOut(10);
    $(BACK).attr('from',  panels.events);
    $(BACK).attr('to',  panels.filters);
    $(BACK).fadeIn(10);

    pager.swipePanels( panels.filters, panels.events);
}

function displayFilterTypeRows(e) {

    if(filters[e.currentTarget.attributes.key.value] != undefined) {
        
        var filter = filters[e.currentTarget.attributes.key.value];

        if($('#bfl_'+ filter.hash).css('display') == 'none') {
            
            var srcEnabled = paranoidResources.low.img;
            var activeTitle = "active";
            if(!filter.enable) {
                srcEnabled = paranoidResources.high.img;
                activeTitle = "disabled"
            } 

            var ele = "<div style='width:100%'>";
            
            ele = ele + "<div style='width:100%; color:#484848'>" 
            
            if (filter.blockAll) {
                ele = ele + "<div style='display:inline-block; margin-left:12px; margin-top:2px'>block: ALL</div>"
            } else {
                var lst = "<div style='width:214px;margin-left:12px; display:inline-block'>";
                for (var i = 0; i < filter.filters.length; i++) {
                    lst = lst + "<div style='margin-right:3px; float:left'>" + filter.filters[i] + "</div>";
                }
                lst = lst + "</div>";
                ele = ele + lst;
            }

            ele = ele + "</div>" 
                + "<div style='width:228px; margin-left:12px; display:inline-block; margin-top:3px; color:#484848'>"
                    + "<div><span style='color:#0066ff'>+</span> delete cookie: " + filter.deleteCookie + "</div>"
                    + "<div><span style='color:#0066ff'>+</span> destroy window: " + filter.destroyTab + "</div>"

                +"</div>"
                    ;

            $('#bfl_' + filter.hash).html(ele);
            $('#bfl_' + filter.hash).css('display', 'inline-block');
        } else {
            $('#bfl_' + filter.hash).css('display', 'none');
        }
        
    }

    console.log(e);
}

function displayFiltersRows() {
    var html = '';
    for(var key in filters) {

        var srcEnabled = paranoidResources.low.img;
            var activeTitle = "Active";
            if(!filters[key].enable) {
                srcEnabled = paranoidResources.high.img;
                activeTitle = "Disabled"
            } 

        var ele = "<div key='" + key + "' id='p_" + filters[key].hash + "' class='ex-log-row'>"
            + "<div style='width:100%; display:inline-block; font-size:12px'>"
                + "<div style='float:left; padding-right:5px; margin-top:4px'><img src='../assets/arrow_normal.png' width='8' /></div>"
                    + "<div style='float:left' title='" + key + "'>" + fixLength(key, REFERENCE_MAX_LENGTH, "...") +"</div>"
                    + "<div style='float:right'><div key='" + key + "' id='bfd_" + filters[key].hash + "' style='float:left' class='ex-ui-icon-delete-filter' title='Delete'></div></div>"
                    + "<div style='float:right'><div hash='" + filters[key].hash + "' key='" + key + "' id='bfe_" + filters[key].hash + "' style='float:left; margin-right:3px' class='ex-ui-icon-edit-filter' title='Edit'></div></div>"
                    + "<div key='" + key + "'  hash='" + filters[key].hash + "' id='pcs_" + filters[key].hash + "' style='float:right; margin-top:2px; margin-right:5px' title='" + activeTitle + "'><img src='"+ srcEnabled +"' width='12' /></div>"
                + "</div>"
            + "<div hash='" + filters[key].hash + "' id='bfl_" + filters[key].hash + "' style='width:100%; display:none; font-size:12px'>"
            + "</div>"
        + "</div>"

        $(wrappers.WRAPPER_FILTER_LIST).append(ele);

        $('#p_' + filters[key].hash).on('click', displayFilterTypeRows);
        $('#pcs_' + filters[key].hash).on('click', changeFilterStatus);
        $('#bfd_' + filters[key].hash).on('click', deleteFilter);
        $('#bfe_' + filters[key].hash).on('click', editFilter);
    }
}

function deleteFilter(e) {
    e.stopPropagation();
    var key = e.currentTarget.attributes.key.value;
    popup.displayDialog("Delete Filter?", "Delete: " + fixLength(key, URL_MAX_LENGTH, '...') + "<br />This will be irreversible",true, function(){
        delete filters[key];
        chrome.runtime.sendMessage({ type: MESSAGE_SET_FILTERS, filters: filters }, storageFilter);
    }, undefined);
}

function editFilter(e) {
    e.stopPropagation();
    var key = e.currentTarget.attributes.key.value;
    if(filters[key] != undefined) {
        $(textboxes.TXB_PATTERN).val(filters[key].pattern);
        
        if(filters[key].blockAll) {
            $(checkboxes.CHK_FILRER_BLOCK_ALL).attr('checked', 'checked');
        } else {
            $(checkboxes.CHK_FILRER_BLOCK_ALL).removeAttr('checked');

            for(var fkey in filters[key].filters) {
                $('#chk_' + fkey).attr('checked', 'checked');
            }
        }


        if(filters[key].destroyTab) {
            $(checkboxes.CHK_FILTER_DESTROY_TAB).attr('checked', 'checked');
        } else {
            $(checkboxes.CHK_FILTER_DESTROY_TAB).removeAttr('checked');
        }

        if(filters[key].deleteCookie) {
            $(checkboxes.CHK_FILTER_DELETE_COOKIE).attr('checked', 'checked');
        } else {
            $(checkboxes.CHK_FILTER_DELETE_COOKIE).removeAttr('checked');
        }

        blockAllChange();

    }
}

function storageFilter(response) {
    if(response.status == "success") {
        $(wrappers.WRAPPER_FILTER_LIST).html('');
        displayFiltersRows();
    } else {
        //TODO: display error
    }
}

function changeFilterStatus(e) {
    e.stopPropagation();
    var key = e.currentTarget.attributes.key.value;
    if(filters[key] != undefined) {
        var fromStatus = filterStatus.ACTIVE;
        var toStatus = filterStatus.DISABLED;

        if(!filters[key].enable) {
            fromStatus = filterStatus.DISABLED;
            toStatus = filterStatus.ACTIVE;
        }

        popup.displayDialog("Change Filter Status?","Change: " + fixLength(filters[key].pattern, URL_MAX_LENGTH, "...") + "<br />From: " + fromStatus + " to " + toStatus, true, 
        function() {
            if(toStatus == filterStatus.ACTIVE) {
                filters[key].enable = true;
            } else {
                filters[key].enable = false;
            }

            chrome.runtime.sendMessage({ type: MESSAGE_SET_FILTERS, filters: filters }, function (response) {
                storageFilter(response);
            });
            
        }
        , undefined);

    }

   
}

function saveFilter(e) {
    var isValid = true;
    var pattern = $(textboxes.TXB_PATTERN).val();
    var hidFilterSelected = $(HD_FILTER_SELECTED).val();

    $(".ex-ui-error").css("display", "none");
    $(".ex-ui-error").html('');

    if (pattern.length < PATTERN_MINIMUM_LENGTH) {
        isValid = false;
        popup.displayDialog('Error...',errors[4] + PATTERN_MINIMUM_LENGTH, false, undefined, undefined)
        return isValid;
    }

    if(filters != undefined && filters[pattern] != undefined && hidFilterSelected == '') {
        isValid = false;
        popup.displayDialog('Error...', errors[6], false, undefined, undefined)
        return isValid;
    }

    var blockAll = false;
    if ($(checkboxes.CHK_FILRER_BLOCK_ALL).is(":checked")) {
        blockAll = true;
    }

    var deleteCookie = false;
    if ($(checkboxes.CHK_FILTER_DELETE_COOKIE).is(":checked")) {
        deleteCookie = true;
    }

    var destroyTab = false;
    if($(checkboxes.CHK_FILTER_DESTROY_TAB).is(":checked")) {
        destroyTab = true;
    }

    var filtersMedia = {};

    if (!blockAll) {
        var checks = $(wrappers.WRAPPER_ALL_FILTERS + ' input:checkbox:checked');
        if (checks.length == 0) {
            isValid = false;
            popup.displayDialog('Error...', errors[5], false, undefined, undefined)
            return isValid;
        } else {
            for (var i = 0; i < checks.length; i++) {
                var requestType = checks[i].id.replace('chk_', '');
                if(filtersMedia[requestType] == undefined) {
                    filtersMedia[requestType] = true;
                }
            }
        }
    }

    if(!blockAll && !deleteCookie && !destroyTab && filtersMedia.length == 0) {
        isValid = false;
        popup.displayDialog('Error...', errors[7], false, undefined, undefined)
        return isValid;
    }

    if (isValid) {

        var filter = { hash: createHash(pattern), pattern: pattern.toLowerCase(), blockAll: blockAll, deleteCookie: deleteCookie, destroyTab: destroyTab, filters: filtersMedia, enable: true, package: {type: "custom", version: "0"} };
        
        if(filters == null) {
            filters = {};
        }

        filters[pattern] = filter;
        $(textboxes.TXB_PATTERN).val('');
        chrome.runtime.sendMessage({ type: MESSAGE_SET_FILTERS, filters: filters }, storageFilter);
    } 

}

function blockAllChange() {

    if ($(checkboxes.CHK_FILRER_BLOCK_ALL).is(":checked")) {
        $(wrappers.WRAPPER_ALL_FILTERS).height(0);
        $(wrappers.WRAPPER_FILTER_LIST).height(282)
    } else {
        $(wrappers.WRAPPER_ALL_FILTERS).height(75);
        $(wrappers.WRAPPER_FILTER_LIST).height(207);
    }
}

function displayEventsLogRows() {

    if(events.length != 0) {
        $(wrappers.WRAPPER_EVENTS_LIST).html('');
        for (var i = 0; i < events.length; i++){
            if($('#eve_' + events[i].tick).length == 0) {
                var ele = "<div id='eve_" + events[i].tick + "' class='ex-log-row' index='" + i + "'>"
                    + "<div style='width:100%; display:inline-block; font-size:12px'>" 
                        + "<div style='float:left; padding-right:5px; margin-top:3px'><img src='../assets/arrow_normal.png' width='8' /></div>" 
                        + "<div style='float:left'>" + events[i].event + "</div>"
                        + "<div style='float:right; color:#484848; font-size:10px; margin-top:2px'>" + humanDate(events[i].date) + "</div>"  
                    + "</div>"
                    + "<div style='width:100%'>pattern: <span style='color:#484848' title='" + events[i].pattern + "'>" + fixLength(events[i].pattern, URL_MAX_LENGTH, "...") + "</span></div>"
                    + "<div style='width:100%' title='" + events[i].url + "'>url: <span style='color:#484848'>" + fixLength(events[i].url, EVENT_MAX_LENGTH, "...") + "</span></div>"
                + "</div>";

                $(wrappers.WRAPPER_EVENTS_LIST).append(ele); 
            }
        }

        $(labels.LBL_EVENTS_TOTAL_BLOCKS).html(events.length);
    }
}




function deleteEvents() {
    popup.displayDialog("Delete Events?", "Are you sure you want to delete?<br />This will be irreversible", true, function(){
        chrome.runtime.sendMessage({ type: MESSAGE_CLEAR_EVENTS }, function (response) {});
        $(wrappers.WRAPPER_EVENTS_LIST).html('');
        $(labels.LBL_EVENTS_TOTAL_BLOCKS).html('0');
    }, undefined);
}
