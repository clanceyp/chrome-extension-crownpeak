var manifest = chrome.runtime.getManifest();
var cp = {
    lastError: "",
    isInDate: function(date, dif) {
        var dt1 = new Date(+ date);
        var dt2 = new Date();
        var gap = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
        return gap < dif;
    },
    apiKey: options.getLocalStore("apikey"),
    pageReports: [],
    disableIcon: function(tab) {
        try {
            chrome.browserAction.disable(tab.id);
            cp.updateBrowserActionStatus(null);
        } catch (e) {
            console.log(e);
        }
    },
    setTabStatus: function(tab, html){
        if (!tab) {
            return;
        }
        cp.disableIcon(tab);
        if (!tab.url || tab.url.indexOf("http") !== 0) {
            return;
        }
        var websiteId = cp.getWebsiteId(tab);
        if (websiteId){
            chrome.browserAction.enable(tab.id);
            cp.updateBrowserActionStatus({errors: '?'});
            cp.requestReport(tab);
        }
    },
    processReport: function(report) {
        console.log("Processing report", report);
        var failed = _.where(report.checkpoints, {failed: true});
        var blockers = _.where(failed, {category: "Blocker"}) ;
        var priority = _.where(failed, {priority: true}) ;
        cp.updateBrowserActionStatus({
            errors: report.totalErrors,
            blockers: blockers.length,
            priority: priority.length
        });
    },
    getWebsiteId: function(tab) {
        var tabUrl = new URL(tab.url);
        var domainOps =  options.getLocalStore("domain-key-value-pair", "[]");
        var domains = JSON.parse(domainOps);
        var match = _.findWhere(domains, {key: tabUrl.host});
        var websiteId = match ? match.value : false;

        return websiteId;
    },
    requestReport: function(tab, pageSource) {
        var tabUrl = new URL(tab.url);
        var websiteId = cp.getWebsiteId(tab);
        var pageHref = tabUrl.href;
        var existingReport = _.findWhere(cp.pageReports, {tabUrl: tab.url});
        var cacheReports = options.getLocalStore("cacheReports", 1, "boolean");
        var cacheExpire = options.getLocalStore("cacheExpire", 3, "number");

        if (cacheReports && existingReport && existingReport.data && cp.isInDate(existingReport.requested, cacheExpire)) {
            console.log("Report exists for this website page");
            cp.processReport(existingReport.data);
        } else if (!pageSource) {
            // no existing report and no HTML to validate
            chrome.tabs.executeScript(tab.id, {'file':'lib/content.js'});
        } else {
            console.log("Fetching report for ", tabUrl.pathname);
            if (existingReport) {
                existingReport.requested = + new Date();
            } else {
                cp.pageReports.push({
                    websiteId: websiteId,
                    path: tabUrl.pathname,
                    requested: + new Date(),
                    tabUrl: tab.url
                });
            }
            const params = {
                dqmApiUrl: 'https://api.crownpeak.net/dqm-cms/v1/',
                bookmarkletVersion:"2.2",
                dqmUrl: options.getLocalStore("contextURL"),
                websiteId: websiteId,
                apiKey: options.getLocalStore("apikey"),
                debug: false,
                postCharset : 'text/html; charset=UTF-8',
                postCtHeader : 'application/x-www-form-urlencoded',
                clientName: 'Page Checker',
                clientVersion: '2.2'
            };
            const data = {
                'contentType' : params.postCharset,
                'upsert' : true,
                'clientName' :  params.clientName,
                'clientVersion' :  params.clientVersion,
                'websiteId' :  websiteId,
                'url' :  pageHref,
                'content' :  pageSource
            };
            let maxCount = 0;
            $.ajax({
                url: params.dqmApiUrl + 'assets?apiKey=' + params.apiKey,
                type: "POST",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('x-api-key', params.apiKey);
                    xhr.setRequestHeader('Content-Type', params.postCtHeader);
                },
                data: data,
                success: function(json) {
                    requestPagechecker(json);
                },
                error: function(text) {
                    cp.lastError = text || "Ajax error getting assets";
                }
            });
            function requestLinkStatusCheck(assetId) {
                var linksUrl = `${params.dqmApiUrl}assets/${assetId}/links/status?apiKey=${params.apiKey}`;
                $.ajax({
                    url: linksUrl,
                    headers: {
                        'x-api-key': params.apiKey
                    },
                    success: function (data) {
                        if (data.completed) {
                            requestReportStatusDetail(assetId);
                        } else if (maxCount < 12) {
                            setTimeout(function() {
                                maxCount++;
                                requestLinkStatusCheck(assetId);
                            }, 1000);
                        } else {
                            console.log(maxCount, 'max count exceeded', 'trying to proceed regardless');
                            cp.lastError = 'max count exceeded';
                            maxCount = 0;
                            requestReportStatusDetail(assetId);
                        }

                    },
                    error: function (text) {
                        console.log(text);
                        cp.lastError = text || "Ajax error on link status";
                    }
                });
            }
            function requestPagechecker(json) {
                var report = _.findWhere(cp.pageReports, {tabUrl: tab.url});
                report.pageCheckerAssetId = json.id;
                $.ajax({
                    url: `${params.dqmUrl}pagechecker`,
                    type: "POST",
                    data: {
                        assetId: report.pageCheckerAssetId,
                        apiKey: params.apiKey
                    },
                    success: function(html) {
                        var assetId = cp.getAssetId(html);
                        requestLinkStatusCheck(assetId);
                    },
                    error: function(text) {
                        cp.lastError = text || "Ajax error getting pagechecker";
                    }
                });
            }
            function requestReportStatusDetail(assetId) {
                var stausUrl = `${params.dqmApiUrl}assets/${assetId}/status?apiKey=${params.apiKey}&recordUsage=true`;
                $.ajax({
                    url: stausUrl,
                    headers: {
                        'x-api-key': params.apiKey
                    },
                    success: function (data) {
                        var report = _.findWhere(cp.pageReports, {tabUrl: tab.url});
                        report.data = data;
                        cp.processReport(report.data);
                    },
                    error: function (text) {
                        console.log(text);
                        cp.lastError = text || "Ajax error getting report status detail";
                    }
                });
            }
        }
    },
    clear: function() {
        this.pageReports = [];
    },
    logFirstReport: function() {
        console.log(this.pageReports[0]);
    },
    /**
     * Method, sets the browser icon text
     * @id updateBrowserActionStatus
     * @memberOf cp
     * @param {number} status The current status
     * @return void
     */
    updateBrowserActionStatus:function(data) {
        clearTimeout(cp.statusTimer);
        var color = [100, 100, 100, 255] ; // grey
        var title = manifest.name +" v"+ manifest.version;
        var delay = 0.3;
        var status = "?";
        var path = "lib/options/i/cp-128.png";

        if (data === null) {
            path = "lib/options/i/cp-128-disabled.png";
            status = "";
            delay = 0;
        } else {

            if (data.errors){ // error count
                status = data.errors;
            } else if (data.errors === 0) {
                color = [0, 180, 0, 255] ; // green
                status = "✓";
            }

            if (data.blockers) {
                color = [180, 0, 0, 255] ; // red
                title = title + " Blockers";
            } else if (data.priority) {
                color = [255, 160, 0, 255] ; // orange
                title = title + " Priority issues";
            } else if (data.errors > 0) {
                color = [0, 0, 180, 255] ; // blue
                title = title + " minor issues";
            }

        }

        chrome.browserAction.setIcon( { path: path } );
        cp.statusTimer = setTimeout(function(){
            if (!window.chrome){ return }
            window.chrome.browserAction.setBadgeBackgroundColor( { color: color } );
            window.chrome.browserAction.setBadgeText( { text: status.toString() });
            window.chrome.browserAction.setTitle( { title: title } );
        }, delay*1000);
    },
    getAssetId: function(html) {
        var assetId = /.*(?:assetId\s:\s')(.*)?'/gm.exec(html).pop();
        return assetId;
    },
    getCurrentReport: function(callback) {
        window.chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
            var tabUrl = tab[0].url;
            var report = _.findWhere(cp.pageReports, {tabUrl: tabUrl});
            if (report){
                cp.currentReport = report;
                callback( report );
            } else {
                callback( {error: (cp.lastError || "No report found")} );
            }
        });

    },
    goToDQM: function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            if (!tabs || !tabs[0] || !tabs[0].id) {
                return;
            }
            var tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, {
                action: "go-to-dqm",
                apiKey: options.getLocalStore("apikey"),
                websiteId: cp.getWebsiteId(tab),
                contextURL: options.getLocalStore("contextURL")
            }, function(response) {});
        });
    }
};






