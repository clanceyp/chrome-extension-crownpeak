
var DEBUG = true,
	OPTIONS = {
		FORMS : {
			"options" : [
				{"type":"fieldset", "label":"Settings", "id":"basicSettings", "defaultSection":"true"},
        	    {"name":"contextURL", "id":"contextURL", "label":"Context URL", "value": "http://dqm.crownpeak.com/", "type" : "text", parent:'basicSettings'},
        	    {"name":"apikey", "id":"apikey", "label":"API Key", "value": "", "type" : "text", parent:'basicSettings'},
		        {"name":"domain-key-value-pair", "id":"domain-key-value-pair", "label":"Key value pair", "type" : "key-value", tag:"div", parent:'basicSettings', data : [{cols:[{"title":"Domain name",initValue:"www.my-domain.com"},{"title":"Crownpeak website ID",initValue:""}]}]},
                {"name":"popupStyle", "label":"Popup, display type", "type":"select", "value": "normal", parent:'basicSettings', options:[{"normal":"Normal"},{"simple":"Simple"}] },
                {"name":"popupTheme", "label":"Popup Theme", "type":"select", "value":"light", parent:'basicSettings' , options:[{"dark":"Dark"},{"light":"Light"}]},
				{"name":"cacheReports", "label":"Cashe reports locally", "type":"checkbox", "value":"true", parent:'basicSettings'},
				{"name":"ClearCacheReports", "label": "", "type":"button", "value":"Cleare cashed reports", parent:'basicSettings', data:[{"display-only":""},{"custom-event":"clear-cache"}]},
            ]
		},

		// [name of element] : [default value]
		DEFAULT_VALUES : {
			"jasmine-test-001-key" : "jasmine-test-001-value",
			"contextURL": "http://dqm.crownpeak.com/",
			"popupStyle": "normal",
			"popupTheme": "dark",
			"cacheReports": "true"
		},

		// [name of element] : [help text]
		HELP : {
            "domain-key-value-pair": 'Login to Crownpeak to get your site IDs. Input domain name only, no protocol',
            "popupStyle": 'Simple layout, just list errors, no titles or headers'
		}
// javascript:var websiteId=location.href.match(/america|us/)? '9e28ec7d96a52751d6592557f27d4ad3' : 'b12f2ba3f1afdf8ccd7fce1897744687', dqmPCDebug=false,contextURL='http://dqm.crownpeak.com/';if(document.location.href.indexOf('https')===0)contextURL='https://'+contextURL.split('://')[1];win=window.open('');win.document.write('<html><head><script>dqmPCBookmark={bookmarkletVersion:"2.2",dqmUrl:"'+contextURL+'",websiteId:"'+ websiteId +'",apiKey:"Wh4ofobEv61PtbELMAtms533TIMxCb1E9plYDAiP",debug:'+dqmPCDebug+'};</script><script src="'+contextURL+'quickcheck/js?b=2.2&websiteId=8e075c0d260d57f12eb8607a6a634613"></script></head><body></body></html>');
};
