var REMOTE_PACKAGES = 'https://rudenetworks.com/traffico/packages.aspx';
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

            }
        }
    })
}

function createPackageRow() {
    
}