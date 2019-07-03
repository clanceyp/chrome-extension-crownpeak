
var DEBUG = false;
var OPTIONS = {
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
};
