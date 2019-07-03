var dqmPCBookmark={
    bookmarkletVersion:"2.2",
    dqmUrl: "https://dqm.crownpeak.com/",
    websiteId: "9e28ec7d96a52751d6592557f27d4ad3",
    apiKey: "Wh4ofobEv61PtbELMAtms533TIMxCb1E9plYDAiP",
    debug: false
};

var pageHTML = document.querySelector("html").innerHTML
pageHTML = `<!DOCTYPE html>

<html lang="en">
<head>
    <title>hello</title>
    <script src="options/js/vendor/zepto.js"></script>
    <script src="cp/quickcheck.js?b=2.2&websiteId=8e075c0d260d57f12eb8607a6a634613"></script>
</head>
<body>

</body>
</html>`


var PageCheckerParams = function(b) {
	this.clientName = b.clientName || 'Page Checker';
	this.clientVersion = b.clientVersion || '2.2';
	this.dqmApiUrlDefault = 'https://api.crownpeak.net/dqm-cms/v1/';
	this.dqmApiUrl = this.dqmApiUrlDefault;
	this.bookmark = b;
	this.postCharset = b.postCharset || 'text/html; charset=UTF-8';
	this.postCtHeader = b.postCtHeader || 'application/x-www-form-urlencoded';
	this.userAgent = window.navigator.userAgent;
	this.documentLocation = undefined;
	this.assetId = undefined;
	this.asset = undefined;
	this.formError = undefined;
	this.testMode = b.test;
};

var convertOldContextUrl = function(url){
	var newUrl = {
		protocolSep : '://'
	};

	newUrl.parts = url.split(newUrl.protocolSep);

	if(newUrl.parts.length !== 2){
		return url;
	}

	newUrl.protocol = newUrl.parts[0];
	newUrl.domain = newUrl.parts[1].split('/')[0];

	if(newUrl.domain.indexOf('activestandards.com') === 0 || newUrl.domain.indexOf('www.activestandards.com') === 0 || newUrl.domain.indexOf('my.activestandards.com') === 0) {
		newUrl.domain = 'dqm.crownpeak.com';
	}

	return newUrl.protocol + newUrl.protocolSep + newUrl.domain + '/';
};

var PageChecker = function(params) {
	this.notifier = PageCheckerNotification;

	this.init = function() {
		if(params.testMode){
			return;
		}

		var me = this;
		params.documentLocation = me.getDocumentLocation();

		if (params.bookmark.dqmUrl.indexOf('https') === 0) {
			params.dqmApiUrl = 'https://' + params.dqmApiUrl.split('://')[1];
		}

		var http = me.createAjaxRequest();

		if (me.isIE() && me.protocolMismatch(params.documentLocation) && me.limitedCORSSupport()) {
			me.notifier.showError(me.notifier.messages.incompatibleBrowser);
			return;
		}

		try {
			me.notifier.showMsg();
			//http.open('GET', "https://north-america-playground-agency-starterkit.unileversolutions.com/");

			//http.onreadystatechange = function() {
			//	if (http.readyState == 4) {
					var src = pageHTML;//http.responseText;
					src = src.replace(/\u0000/g, '');
					me.postAsset(src);
			//	}
			//};
			//http.onerror = function() {
			// 	me.notifier.showError(me.notifier.messages.failedPageSourceRetrieval);
			// 	me.notifier.hide(6000);
			// 	me.log('GET page onerror');
			// };
			// http.send(null);

		} catch (e) {
			me.log(e);
			me.notifier.showError(
			'The document does not appear to be fully loaded.\n' +
			'Please wait for the document to load before using DQM Page Checker.'
			);
		}

	};

	this.createForm = function(formName, method, action, formParams) {
debugger;
		var me = this;
		var doc = me.getDocument();

		var oldForm = doc.getElementById(formName);
		if (oldForm != null) {
			doc.body.removeChild(oldForm);
		}

		var form = doc.createElement('form');
		form.setAttribute('id', formName);
		form.setAttribute('action', action);
		form.setAttribute('method', method);

		if (formParams) {
			for (var i=0; i<formParams.length; i++) {
				var attr = formParams[i];
				e = doc.createElement('input');
				e.setAttribute('type', 'hidden');
				for (var key in attr) {
					e.setAttribute(key, attr[key]);
				}
				form.appendChild(e);
			}
		}
		doc.body.appendChild(form);
		return form;
	};

	this.postAsset = function(pageSource, pageHref) {

		var me = this;

		function createRequest(callbackFn) {
			var xhr = new XMLHttpRequest();
			var method = 'POST';
			var targetUrl = params.dqmApiUrl + 'assets?apiKey=' + params.bookmark.apiKey;
			if (false) {
                if ('withCredentials' in xhr) { // "withCredentials" only for XMLHTTPRequest2
                	xhr.open(method, targetUrl, true);
                	xhr.setRequestHeader('x-api-key', params.bookmark.apiKey);
                	xhr.setRequestHeader('Content-Type', params.postCtHeader);
                	callbackFn(xhr);
                }
				return;
            }

			var data = {
                'contentType' : params.postCharset,
                'upsert' : true,
                'clientName' :  params.clientName,
                'clientVersion' :  params.clientVersion,
                'websiteId' :  params.bookmark.websiteId,
                'url' :  params.documentLocation || pageHref,
                'content' :  pageSource
            }
            data.url = "https://north-america-playground-agency-starterkit.unileversolutions.com/";

			$.ajax({
				url: targetUrl,
                type: "POST",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('x-api-key', params.bookmark.apiKey);
                    xhr.setRequestHeader('Content-Type', params.postCtHeader);
				},
				data: data,
				success: function(json) {
					console.log(json);
                    //dqmPageChecker.submitFormInjected(json.id);
                        // <form id="ASTForm" action="https://dqm.crownpeak.com/pagechecker" method="POST">
						// 	<input type="hidden" name="assetId" value="b218501c750bd2e87adacc5bb20648b6">
						// 	<input type="hidden" name="apiKey" value="Wh4ofobEv61PtbELMAtms533TIMxCb1E9plYDAiP">
						// </form>

                    $.ajax({
                        url: "https://dqm.crownpeak.com/pagechecker",
                        type: "POST",
                        data: {
                            assetId: json.id,
                            apiKey: params.bookmark.apiKey
                        },
                        success: function(xhr) {
                        	debugger
                            console.log(xhr);
                        },
                        error: function(text) {
                            console.log(text)
                        }
                    });
				},
				error: function(text) {
					console.log(text)
				}
			});
		};

		createRequest(function(xhr) {

			try {
				this.sendFn = function() {
					debugger
					var e = encodeURIComponent;
					var body =
						'contentType=' + e(params.postCharset) +
						'&upsert=true' +
						'&clientName=' + e(params.clientName) +
						'&clientVersion=' + e(params.clientVersion) +
						'&websiteId=' + e(params.bookmark.websiteId) +
						'&url=' + e(params.documentLocation) +
						'&content=' + e(pageSource)
						;

					xhr.send(body);
				};

				xhr.onload = function() {
					debugger
					try {
						var resText = this.responseText;
						var parsedResponse = JSON.parse(resText);

						if (this.status > 199 && this.status < 300) {
                            params.asset = parsedResponse;
                            params.assetId = params.asset.id;

                            me.notifier.remove();
                            me.submitFormInjected(params.assetId);
						} else {
                            params.formError = parsedResponse;

                            me.notifier.showError();
                            me.log('failed to submit form');
                        }

					} catch (e) {
						me.notifier.showError();
						me.log('failed to submit form').log(e);
					}
				};
				xhr.onerror = function() {
					me.notifier.showError();
					me.log('Get UI onerror');
				};

				setTimeout(function(me) { // delay for IE
					return function() {
						me.sendFn();
					};
				}(this), 100);

			} catch (e) {
				me.notifier.showError();
				me.log(e);
			}
		});

	};

	this.submitFormInjected = function(assetId) {
		var me = this;
		try {
			var form = me.createForm(
				'ASTForm',
				'POST',

				convertOldContextUrl(params.bookmark.dqmUrl) + 'pagechecker',
				[
				 {name: 'assetId', value: assetId},
				 {name: 'apiKey', value: params.bookmark.apiKey}
				]);
			me.log('UI inject form, asset [' + assetId + ']');

			if (params.bookmark.debug) {
				me.debug();
			} else {
				// form.submit();
				var boom = $('#ASTForm').serialize();
				var action = $('#ASTForm').attr("action");
				debugger
                $.post(action, boom, function(response){
                    console.log(response)
                })
			}

		} catch (e) {

			// Handle possible popup blocking (can still happen in IE8).
			// May fail the first time on website if user not yet given permission for popup.
			// No need to show error as browser shows it's own.

			me.log('UI blocked: ' + e);
			if (typeof (e.name) !== 'undefined' && 'NS_ERROR_FAILURE' === e.name) {
				me.log('FF blocked popup');
			} else {
				throw e; // report all other errors
			}
		}
	};

    this.xgetDocumentLocation = function() {
    	return "https://north-america-playground-agency-starterkit.unileversolutions.com/"
	};
	this.getDocumentLocation = function() {
		if (typeof (frameName) !== 'undefined') {
			if (window.frames[frameName]) {
				if (window.frames[frameName].location) {
					return window.frames[frameName].location.href;
				}
			}
		}
		return document.location.href;
	};

	this.getDocument = function() {
		if (typeof (frameName) !== 'undefined') {
			try {
				if (window.frames[frameName].document) {
					return window.frames[frameName].document;
				}
			} catch (e) {}
		}
		return document;
	};

	this.createAjaxRequest = function() {
		var http;
		if (!http && typeof XMLHttpRequest !== 'undefined') {
			try {
				http = new XMLHttpRequest();
			} catch (e) {
				http = false;
			}
		}
		if (!http && typeof ActiveXObject !== 'undefined') {
			try {
				http = new ActiveXObject('MSXML2.XMLHTTP');
			} catch (e) {
				http = false;
			}
			if (!http) {
				try {
					http = new ActiveXObject('Microsoft.XMLHTTP');
				} catch (e) {
					http = false;
				}
			}
		}
		return http;
	};

	this.isIE = function() {
		return 'Microsoft Internet Explorer' === navigator.appName;
	};

	this.protocolMismatch = function(location) {
		return params.bookmark.dqmUrl.split('://')[0] !== location.split('://')[0];
	};

	this.limitedCORSSupport = function() {
		var xhr = new XMLHttpRequest(),
		isLimited = !('withCredentials' in xhr) && XDomainRequest;
		xhr = null;
		return isLimited;
	};

	this.hasLog = function() {
		return typeof console !== 'undefined' && typeof (console.log) !== 'undefined';
	};

	this.log = function(msg) {
		if (this.hasLog()) {
			console.log('DQM Page Checker: ' + msg);
		}
		return this;
	};

	this.debug = function() {
		if (this.hasLog()) {
			console.log(params);
		}
		var body;
		try {
			body = '<pre>' + JSON.stringify(params, undefined, 2) + '</pre>';
		} catch (e) {
			body = '<p>Apologies, the diagnostic is not working. Please try another browser.</p>';
		}
		document.writeln('<h1>DQM Page Checker Diagnostic</h1>' + body);
	};

};

var PageCheckerNotification = {

	barId: 'PageCheckerLoader',
	barHasShown : false,
	addFontsStyleSheet : function(){
		if(!this.barHasShown){
			var head = document.head,
				link = document.createElement('link');
			link.type = 'text/css';
			link.rel = 'stylesheet';
			link.href = 'https://fonts.googleapis.com/css?family=Open+Sans:600italic,400,600,700';
			head.appendChild(link);

		}
	},
	createBar: function(message, error) {
		this.addFontsStyleSheet();
		document.body.setAttribute('style', 'padding:0;margin:0;');

		var div = document.createElement('div');
		var backgroundColour = (error) ? '#fceae7' : '#e7f3ed';
		div.setAttribute('id', this.barId);
		div.setAttribute('style',
			'padding: 12px;' +
			'text-align: center;' +
			'font-size: 16px;' +
			'font-family: \'Open Sans\', Helvetica, Arial, sans-serif;' +
			'border-bottom: 1px solid #999b9a;' +
			'background:' + backgroundColour +';' +
			'color: #2e3232;' +
			'box-shadow: 0px 3px 3px 0px rgba(46, 50, 50, 0.1);' +
			'transition: all 0.2s;'
		);
		if(this.barHasShown === false){
			div.style.transform = 'translateY(-100px)';
		}
		var p = document.createElement('p');
		p.setAttribute('id', 'QuickCheckLoaderMessage');
		p.innerHTML = message;
		div.appendChild(p);
		return div;
	},
	showMsg: function() {
		this.show(this.createBar(
			'<strong>DQM Page Checker</strong> ' +
			'is currently analysing your page. When the results are ready ' +
			'they will appear here.', false
		));
	},
	showError: function(message) {
		var msg = message || this.messages.theDefault;
		this.show(this.createBar(msg, true));
	},
	show: function(bar) {
		this.remove();
		document.body.appendChild(bar);

		window.getComputedStyle(bar).transform;
		requestAnimationFrame(function(){
			bar.style.transform = 'translateY(0)';
		});

		this.barHasShown = true;
	},
	remove: function() {
		var oldBar = document.getElementById(this.barId);
		if (oldBar != null) {
			document.body.removeChild(oldBar);
		}
	},
	hide: function(millis) {
		setTimeout(function(me) {
			return function() { me.remove(); };
		}(this), millis);
	},

	messages : {
		theDefault : 'Apologies, DQM Page Checker is not currently available. If you continue to see this message please email the <a href="mailto:dqmhelp@crownpeak.com" title="Email Crownpeak DQM Product Team">Crownpeak DQM Product Team</a> for assistance.',
		incompatibleBrowser : 'You are trying to run DQM Page Checker over a page which contains both insecure (http) and insecure (https) content. Unfortunately your current browser does not permit this.<br />You should be able to run DQM Page Checker over this page if you use either Firefox or Chrome.',
		failedPageSourceRetrieval : 'Apologies, DQM Page Checker is currently unable to access the page source. If you continue to see this message please email the <a href="mailto:dqmhelp@crownpeak.com" title="Email Crownpeak DQM Product Team">Crownpeak DQM Product Team</a> for assistance.'
	}

};

dqmPageChecker = new PageChecker(new PageCheckerParams(dqmPCBookmark));
setTimeout("dqmPageChecker.init();", 1);