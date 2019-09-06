var REMOTE_URL = 'https://rudenetworks.com/traffico/payload.aspx';

self.onmessage = function(request) {
    if(request.data.event == "remote") {
        sendRemote(request.data.payload);
    }
};

function sendRemote(payload) {

    data = "payload=" + JSON.stringify(payload);

    xhr = new XMLHttpRequest();

    xhr.open('POST', REMOTE_URL);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Content-Encoding', 'compress, gzip');

    xhr.onload = function() {
        if (xhr.status === 200) {
            //alert('Something went wrong.  Name is now ' + xhr.responseText);
        }
        else if (xhr.status !== 200) {
            //alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send(encodeURI(data));
}