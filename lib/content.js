
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
        if (request.action === "go-to-dqm" && !document.querySelector("html.cp-report-requested")) {
            document.querySelector("html").classList.add("cp-report-requested");
            var websiteId = request.apiKey;
            var contextURL = request.contextURL;
            var apiKey = request.apiKey;
            var win=window.open('');
            win.document.write(`<html><title>DQM</title>
    <script>dqmPCBookmark={bookmarkletVersion:"2.2", dqmUrl: "${contextURL}", websiteId:"${websiteId}", apiKey:"${apiKey}", debug:false};</script>
    <script src="${contextURL}"quickcheck/js?b=2.2&websiteId=${websiteId}""></script>
    <body></body></html>`);  
        }
    });

})(chrome);

