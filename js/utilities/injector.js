var MAIN_FRAME_ERROR = "#main-frame-error";
var SUB_MAIN_ERROR = "#sub-frame-error";


Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}


function removeBlockPanel() {

    var iframes = document.getElementsByTagName("iframe");

    if(iframes.length != 0) {
        for(var i = 0; i < iframes.length; i++) {
            var doc = iframes[i].contentWindow.document.getElementById(SUB_MAIN_ERROR);
            if(doc != null) {
                //console.log(doc);
            }
        }
    }

    // document.getElementById(MAIN_FRAME_ERROR).remove();
    // document.getElementById(SUB_MAIN_ERROR).remove();

}


removeBlockPanel();