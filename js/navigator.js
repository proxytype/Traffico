var Navigator = function() {

    var CLASS_EX_UI_PANEL = ".ex-ui-panel";

    $(buttons.BTN_MENU_HOME).on('click', menuClick);
    $(buttons.BTN_MENU_FILTERS).on('click', menuClick);
    $(buttons.BTN_MENU_SETTINGS).on('click', menuClick);
    $(buttons.BTN_MENU_ABOUT).on('click', menuClick);
    $(HAMBURGER).on('click', swipeMenu);
    $(BACK).on('click', back);


    this.swipePanel = function(displayPanel) {
       
    }

    function swipeMenu() {

        if($(JTAG + panels.menu).css("display", "none")) {
            $(CLASS_EX_UI_PANEL).fadeOut();
            $(JTAG + panels.menu).fadeIn();
        } 
        $(JTAG + panels.menu).css('display', 'inline-block');
    }

    function menuClick(e) {

        $(JTAG + panels.menu).fadeOut();
        var panelToDisplay = JTAG + $(e.currentTarget).attr("to");

        if(panelToDisplay == JTAG + panels.settings) {
            loadSettings();
        }
        else if (panelToDisplay == JTAG + panels.about) {
            loadAbout();
        }

        else if(panelToDisplay == JTAG + panels.filters) {
            loadFilter();
        }
        
        var title = $(panelToDisplay).attr("menu");
        $(HEADER_TITLE_SPAN).html(title);
        $(panelToDisplay).fadeIn();

    }

    this.swipePanels = function(fromPanel, toPanel) {       
        $('#' + fromPanel).fadeOut();
        var title = $("#" + toPanel).attr("menu");
        $(HEADER_TITLE_SPAN).html(title);
        $('#' + toPanel).fadeIn();
    }

    function back() {

        var fromPanel = JTAG + $(BACK).attr("from");
        var toPanel = JTAG + $(BACK).attr("to");

        $(fromPanel).fadeOut();
        $(HAMBURGER).fadeIn(10);
        $(BACK).fadeOut(10);
        var title = $(toPanel).attr("menu");
        $(HEADER_TITLE_SPAN).html(title);
        $(toPanel).fadeIn();
    }



}