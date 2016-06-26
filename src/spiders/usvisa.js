import { Spider } from "orbs";

export class UsVisaSpider extends Spider {
	constructor (web, params) {
		super (web, params);
	}

	_login () {
			
		this.captureStep('Login page loaded');

		this.then(function fillLoginForms() {
			var skipLink = "body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.no-close.infoPopUp.ui-dialog-buttons > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button";

			if (this.exists (skipLink)) {
			    this.clickLink({
	                stepDescription: 'Pass the prompt message',
	                selector: skipPromotionLink
	            });
			}
		
			this.fillSelectors('#new_user', {
	          '#user_email': spider.params.credentials.username,
	          '#user_password': spider.params.credentials.password
	      	});

			this.captureStep('Login form filled..');
		
			this.clickLink({
	            stepDescription: 'Clicking login button',
	            selector: '#new_user > div:nth-child(4) > div.greenSubmitNew > div > input'
	        });
		});
	}

	crawl () {
		var ret = {
			"89": {
				name: "calgary",
				address: "",
				dates: []
			},
			"90": {
				name: "Halifax",
				address: "",
				dates: []
			},
			"91": {
				name: "Montreal",
				address: "",
				dates: []
			},
			"92": {
				name: "Ottawa",
				address: "",
				dates: []
			},
			"93": {
				name: "Quebec City",
				address: "",
				dates: []
			},
			"94": {
				name: "Toronto",
				address: "",
				dates: []
			},
			"95": {
				name: "Vancouver",
				address: "",
				dates: []
			}
		},
		ids = Object.keys(ret),
		count = 0;

		this.then(function () {
			this.repeat(ids.length, function() {
				this.then(function reading () {
					ret[ids[count]].id = ids[count];
					this.thenOpen('https://ais.usvisa-info.com/en-ca/niv/schedule/11636195/appointment/address/' + ids[count] + "?",
						function () {
							ret[ids[count]].address = this.fetchText("body");
						});
					this.thenOpen('https://ais.usvisa-info.com/en-ca/niv/schedule/11636195/appointment/days/' + ids[count] +'.json?',
						function(response) {
							try {
								ret[ids[count]].dates = JSON.parse(this.getPageContent());
							} catch (e) {
								this.echo(e.toString());
								ret[ids[count]].dates = []
							}
						});
					this.wait(100, function() {
						++count;
					})
				});
			});
		});

		this.then(function finshed() {
			this.echo ("All dates are read")
			this.emit ("ant", { id: "WhisFirebaseAnt", action: "updateAvailableDates", params: { data: ret } });
		});
	}
}
