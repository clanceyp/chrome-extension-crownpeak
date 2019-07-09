var backgroundPage = chrome.extension.getBackgroundPage();
var popupStyle = backgroundPage.options.getLocalStore("popupStyle", "normal");
var popupTheme = backgroundPage.options.getLocalStore("popupTheme", "dark");
var popupShowSiteName = backgroundPage.options.getLocalStore("popupShowSiteName", "false");

var init = function(json) {
    var data = json ? json.data : [];
    var template = $("#list-item").html();
    var errorMessage = data.error;
    var checkpoints;
    if (errorMessage) {
        $(".message").text(errorMessage);
        return;
    }

    checkpoints = insetHeadings(data.checkpoints);
    var text = Mustache.render(template, checkpoints);
    function insetHeadings(data) {
        var i = 0;
        var l = data.length;
        var newData = [];
        for (let sectionHeading;i<l; i++) {
            if (data[i].failed === false) {
                continue;
            }
            if (sectionHeading !== data[i].category) {
                sectionHeading = data[i].category;
                newData.push({sectionHeading: sectionHeading});
            }
            newData.push(data[i]);
        }
        return newData;
    }

    $("body").removeClass("loading").addClass(`body--${popupStyle} body--${popupTheme} body--showSiteName${popupShowSiteName}`);
    $("h1").html( Mustache.render($("h1").html(), data) );
    $(".error-list").html(text);
};



window.addEventListener('load', function() {
    backgroundPage.cp.getCurrentReport(init);
    $(".go-to-dqm").on('click', function() {
        backgroundPage.cp.goToDQM();
    });
    $(".go-to-options").on('click', function() {
        chrome.runtime.openOptionsPage();
    });
});