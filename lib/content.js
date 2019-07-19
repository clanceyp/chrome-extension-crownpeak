
(function(chrome){
    const Http = new XMLHttpRequest();
    const url = location.href;
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4 && Http.status === 200) {
            chrome.runtime.sendMessage({ action:"requestReport", html: Http.responseText}, function(response) {});
            window.addEventListener("unload", function() {
                chrome.runtime.sendMessage({ action:"pageUnload" }, function(response) {});
            });
        }
    };


    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "go-to-dqm") {
            // TODO send user to Crownpeak report page
        }
    });

})(chrome);

