var REMOTE_PACKAGES = 'https://rudenetworks.com/traffico/packages.aspx';
var REQUEST_PACKAGES = '?method=packages';

function loadPacakge() {

    $(HAMBURGER).fadeOut(10);
    $(BACK).attr('from',  panels.packages);
    $(BACK).attr('to',  panels.filters);
    $(BACK).fadeIn(10);

    pager.swipePanels( panels.filters, panels.loader);
}