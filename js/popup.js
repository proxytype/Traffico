var PopupHandler = function() {

    $(buttons.BTN_POPUP_CLOSE).on('click', btnClose);
    $(buttons.BTN_POPUP_CANCEL).on('click', btnCancel);
    $(buttons.BTN_POPUP_OK).on('click', btnOK);


    var okCallback = undefined;
    var cancelCallback = undefined;

    this.displayDialog = function(title, message, enableCancel, _okCallback,  _cancelCallback) {

        okCallback = _okCallback;
        cancelCallback = _cancelCallback;

        $(labels.LBL_POPUP_TITLE).html(title);
        $(labels.LBL_POPUP_MESSAGE).html(message);

        if(!enableCancel) {
            $(buttons.BTN_POPUP_CANCEL).css('display', 'none');
        } else {
            $(buttons.BTN_POPUP_CANCEL).css('display', 'inline-block')
        }

        $(JTAG + panels.popup).fadeIn();

    }


    function btnOK() {
        if(okCallback != undefined) {
            okCallback();
        }

        btnClose();
    }

    function btnCancel() {
        if(cancelCallback != undefined) {
            cancelCallback();
        }

        btnClose();
    }

    function btnClose() {
        $(JTAG + panels.popup).fadeOut();
    }
}