var REMOTE_PACKAGES = 'https://rudenetworks.com/traffico/api.aspx';
var REQUEST_PACKAGES = '?method=packages';

function loadPacakge() {

    $(HAMBURGER).fadeOut(10);
    $(BACK).attr('from',  panels.packages);
    $(BACK).attr('to',  panels.filters);
    $(BACK).fadeIn(10);

    pager.swipePanels( panels.filters, panels.loader);
    ajax(REMOTE_PACKAGES + REQUEST_PACKAGES, function(data){
        pager.swipePanels( panels.loader, panels.packages);

        $(wrappers.WRAPPER_PACKAGES_LIST).html('');

        var packages = JSON.parse(data.responseText);
        if(packages.isValid) {
            if(packages.payload != undefined && packages.payload.length != 0) {
                for(var i = 0; i < packages.payload.length; i++) {
                    createPackageRow(packages.payload[i]);
                }
            }
        }
    })
}

function createPackageRow(package) {
    var ele = "<div class='ex-log-row'>"
                + "<div style='width:100%; display:inline-block; font-size:12px'>"
                        + "<div style='width:100%; display:inline-block'>"
                            + "<div title='" + package.title + "' style='float:left; margin-right:5px; margin-top:3px'>" + fixLength(package.title, EVENT_MAX_LENGTH, "...") +"</div>"
                            + "<div style='float:right;'><div id='btn_pkg_" + package.package +"' class='ex-ui-icon-download' ptitle='" + package.title + "' package='"+ package.package + "' title='Download'></div></div>"   
                        + "</div>"
                        + "<div title='" + package.description + "' style='font-size:10px; color:#484848; margin-top:2px'>" + package.description.toLowerCase() + "</div>"
                + "</div>"
            + "</div>";
    $(wrappers.WRAPPER_PACKAGES_LIST).append(ele);
    $('#btn_pkg_' + package.package).on('click', installPackage);
}

function installPackage(e) {
    var package = e.currentTarget.attributes.package.value;
    var packageTitle = e.currentTarget.attributes.ptitle.value;
    popup.displayDialog('Install Package', packageTitle + '<br/>Exists pattern will be overwrite.', true, function() {
        console.log("approved");
    }, undefined)
}