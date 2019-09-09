var REMOTE_PACKAGES = 'https://rudenetworks.com/traffico/api.aspx';
var REQUEST_PACKAGES = '?method=packages';
var packages = undefined;

function loadPacakge() {

    $(HAMBURGER).fadeOut(10);
    $(BACK).attr('from',  panels.packages);
    $(BACK).attr('to',  panels.filters);
    $(BACK).fadeIn(10);

    pager.swipePanels( panels.filters, panels.loader);
    ajax(REMOTE_PACKAGES + REQUEST_PACKAGES, function(data){
        pager.swipePanels( panels.loader, panels.packages);

        $(wrappers.WRAPPER_PACKAGES_LIST).html('');

        var response = JSON.parse(data.responseText);
        if(response.isValid) {

            packages = response.payload;

            if(packages != undefined && packages.length != 0) {
                for(var i = 0; i < packages.length; i++) {
                    createPackageRow(packages[i], i);
                }
            }
        }
    })
}

function createPackageRow(package, index) {
    var ele = "<div class='ex-log-row'>"
                + "<div style='width:100%; display:inline-block; font-size:12px'>"
                        + "<div style='width:100%; display:inline-block'>"
                            + "<div title='" + package.title + "' style='float:left; margin-right:5px; margin-top:3px'>" + fixLength(package.title, EVENT_MAX_LENGTH, "...") +"</div>"
                            + "<div style='float:right;'><div id='btn_pkg_" + package.package +"' class='ex-ui-icon-download' index='" + index + "' title='Download'></div></div>"   
                        + "</div>"
                        + "<div title='" + package.description + "' style='font-size:10px; color:#484848; margin-top:2px'>" + package.description.toLowerCase() + "</div>"
                + "</div>"
            + "</div>";
    $(wrappers.WRAPPER_PACKAGES_LIST).append(ele);
    $('#btn_pkg_' + package.package).on('click', installPackage);
}

function installPackage(e) {
    var index = e.currentTarget.attributes.index.value;
    var package = packages[index];
    popup.displayDialog('Install Package', package.title + '<br/>Exists pattern will be overwrite.', true, function() {
        if(packages != undefined && packages[index] != undefined) {
            var package = packages[index];
            if(package.filters != undefined && package.filters.length != 0) {
                for(var i = 0; i < package.filters.length; i++) {
                    filters[package.filters[i].pattern] = package.filters[i]; 
                }

                chrome.runtime.sendMessage({ type: MESSAGE_SET_FILTERS, filters: filters }, function(){
                    console.log("update complete!")
                });
            }
        }
    }, undefined)
}