var TrafficoSettings = function(){

    const DEFAULT_MAX_HISTORY_ROWS = 60;
    const DEFAULT_REFRESH_UI_RATE = 2000;
    const DEFAULT_MIN_PARANOID_LEVEL_LOW = 10;
    const DEFAULT_MIN_PARANOID_LEVEL_MEDIUM = 20;
    const DEFAULT_MIN_PARANOID_LELVEL_HIGH = 30; 
    const DEAFULT_MAX_REFERENCE_SITE_PER_TAB = 500;
    const DEFAULT_MAX_EVENTS_ROWS = 200;

    this.versionHash = undefined;
    this.refreshRate = DEFAULT_REFRESH_UI_RATE;
    this.graphRequestRowsCount = DEFAULT_MAX_HISTORY_ROWS;
    this.maximumReferencePerTab = DEAFULT_MAX_REFERENCE_SITE_PER_TAB;
    this.maximumEventsRows = DEFAULT_MAX_EVENTS_ROWS;
    this.enableRemote = false;
    this.enableParanoid = true;
    this.enableMonitor = true;
    this.enableFilters = true;
    this.enableRedirect = true;
    this.paranoid = {low: DEFAULT_MIN_PARANOID_LEVEL_LOW, medium: DEFAULT_MIN_PARANOID_LEVEL_MEDIUM, high: DEFAULT_MIN_PARANOID_LELVEL_HIGH}
    this.isRunning = true;
    
}


var Initiator = function() {
    this.id = undefined;
    this.domain = undefined;
    this.url = undefined;
    this.filters = [];
}