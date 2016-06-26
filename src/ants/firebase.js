import _ from "lodash";
import { FirebaseAnt } from "orbs";

export class WhisFirebaseAnt extends FirebaseAnt {
	constructor (web, params) {
		super (web, params);

		this.dbRefs = {
			availableDates: this.db.ref("available_dates"),
			subscribers: this.db.ref("subscribers")
		};

		this._initializeEvents ();
	}

	_debounce (func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	// _initializeEvents () {
	// 	this.dbRefs.availableDates.on("child_changed", snapshot => { 
	// 		console.log("Available Dates Changed");
	// 		this.emit("ant", { id: "WhisFBAnt", action: "announceDateChange", params: { data: snapshot.val() } });
	// 	});

	// 	this.dbRefs.availableDates.on("value", snapshot => {
	// 		this.dbValue = snapshot.val();
	// 	})
	// }

	_initializeEvents () {
		let that = this,
			currentData = {},
			timeout;
		
		this.previousData = {};
		/**
		 * this is a closure debunce function so that this function is called only once in a second
		 * hope user wont be bombarded with lot of messages
		 */
		let announceDateChangeClosure = this._debounce(
			function (snapshot) {
				currentData = snapshot.val();

				if (!_.isEqual(that.previousData, currentData)) {
					console.log("Available Dates Changed");

					that.previousData = currentData;
					that.emit("ant", { id: "WhisFBAnt", action: "announceDateChange", params: { data: currentData } });
				}
			}, 1000);
		
		this.dbRefs.availableDates.on("child_changed", announceDateChangeClosure);

		this.dbRefs.availableDates.on("value", snapshot => {
			this.dbValue = snapshot.val();
		})
	}

	updateAvailableDates (params) {
		this.dbRefs.availableDates.set(params.data);
		console.log("Available Dates Saved in the db")
	}

	read (payloadAction, id) {
		if (payloadAction === "DATES") {
			if (id != undefined) return this.dbValue[id];
			else return this.dbValue;
		}
	}

	addSubscriber (user) {
		let data = {};
		data[user] = user;

		this.dbRefs.subscribers.set(data);
	}

	removeSubscriber (user) {
		this.dbRefs.child(user).remove();
	}
}