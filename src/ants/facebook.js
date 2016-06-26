import { FaceBookAnt } from "orbs"

export class WhisFBAnt extends FaceBookAnt {
	constructor (web, params) {
		super (web, params);

		this.members = [];
		this.firebaseAnt = this.web.ants["WhisFirebaseAnt"];
	}

	initialize (req, res) {
		if (req.query['hub.verify_token'] === this.params.facebook.token) {
			console.log("FB hook established");
			res.send(req.query['hub.challenge']);
		} else
			res.send('Error, wrong validation token');
	}

	listenToMessages (req, res) {
		let messaging_events = req.body.entry[0].messaging;

		for (let i = 0; i < messaging_events.length; i++) {
			let event = req.body.entry[0].messaging[i];
			let sender = event.sender.id;
			/**
			 * The user may just send the text message
			 */
			if (event.message && event.message.text) {
				let text = event.message.text;

				switch (text) {
					case ".whis subscribe":
						if (this.members.indexOf(sender) == -1) {
							this.members.push(sender);
							//firebaseAnt.addSubscriber(sender);
							this.sendTextMessage(sender, "Sure, I'll notify you daily morning and as soon as the date is available");
						} else
							this.sendTextMessage(sender, "You are already subscribed for updates. To unsubscribe, use .whis unsubscribe");
					break;
					case ".whis unsubscribe":
						if (this.members.indexOf(sender) > -1) {
							this.members.splice(this.members.indexOf(sender), 1);
							//firebaseAnt.removeSubscriber(sender);
							this.sendTextMessage(sender, "You are unsubscribed for updates");
						}
						else
							this.sendTextMessage(sender, "You are not subscribed for updates. To subscribe, use .whis subscribe");
					break;
					case ".whis all":
						{
							let data = this.firebaseAnt.read.call(this.firebaseAnt, "DATES");
							this.sendFistDateForAllCities(sender, { data });
						}
					break;
					default:
						this.sendTextMessage(sender, "enna '"+ text.substring(0, 200) + "'");
				}
			}
			/**
			 * The user clicks the button that we provided to trigger postback
			 */
			else if (event.postback) {

				if(event.postback.payload.indexOf("DATES") == 0) {
					let params = event.postback.payload.split("_");
					let data = this.firebaseAnt.read.call(this.firebaseAnt, params[0], params[1]);

					// If user clicked the "All available dates" button
					if(!!params[1]) this.sendAvailableDatesForCity (sender, { data });
					else this.sendFistDateForAllCities (sender, { data });
				}
			}
		}
		res.sendStatus(200);
	}

	/*********************** Protected methods ********************/

	_generateAttachment (params) {
		let attachment = { "type": "template", "payload": { "template_type": "generic", "elements": [] } };

		if (params.data.name != undefined) {
			// return attachment only if there is available date
			if (params.data.dates) attachment.payload.elements.push(this._generateCard(params.data, true));
			else return null;
		} else {
			for (let elem in params.data) {
				params.data[elem].dates && attachment.payload.elements.push(this._generateCard(params.data[elem], false));
			}
		}

		return attachment;
	}

	_generateCard (data, allCities) {
		let card = {};
		
		card.title = data.name;
		card.subtitle = data.address;
		card.buttons = [];

		card.buttons.push({
				type: "web_url",
				url: "https://ais.usvisa-info.com/en-ca/niv/schedule/11636195/appointment",
				title: ((data.dates && data.dates.length > 0) ? data.dates[0].date : "No available dates")
			});

		(data.dates && data.dates.length > 0) &&
			card.buttons.push({ type: "postback", payload: "DATES_" + data.id, title: "Show all dates" });
		
		allCities && 
			card.buttons.push({ type: "postback", payload: "DATES", title: "1st date in all cities" });

		return card;
	}

	/*********************** Postback methods ********************/

	sendAvailableDatesForCity (recepient, params) {
		let message = "",
			avlDatesCount = params && params.data && params.data.dates && params.data.dates.length;

		if ( avlDatesCount > 0) {
			for (let i = 0; 
				((avlDatesCount > 10 && i < 10) || (avlDatesCount < 10 && i < avlDatesCount)); 
				i++) {
				message += " * " + params.data.dates[i].date + "   ";
			}
		} else {
			message = "No available dates in " + params.data.name;
		}

		this.sendTextMessage(recepient, message);
	}

	sendFistDateForAllCities (recepient, params) {
		let attachment = this._generateAttachment(params);
		attachment && this.sendAttachment(recepient, attachment);
	}

	/*********************** Announcement methods ********************/

	announceDateChange (params) {
		let attachment = this._generateAttachment(params);

		if ( attachment) {
			for (let member of this.members) {
				this.sendAttachment(member, attachment);
			}
		}
	}

	announceFistDateForAllCities () {
		let data = this.firebaseAnt.read.call(this.firebaseAnt, "DATES");
		
		for (let member of this.members) {
			this.sendFistDateForAllCities(member, { data });
		}
	}
}