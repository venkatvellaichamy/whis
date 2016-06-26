import { Web } from "orbs";
import { UsVisaSpider } from "./spiders/usvisa";
import { WhisFBAnt } from "./ants/facebook";
import { WhisFirebaseAnt } from "./ants/firebase";
import params from "./params/space_params";
import crontab from "node-crontab";

let arse = {};
arse.web = new Web("https://ais.usvisa-info.com/en-ca/niv/users/sign_in");
arse.ants = {
		firebaseAnt: new WhisFirebaseAnt (arse.web, params),
		fbAnt: new WhisFBAnt (arse.web, params)
	};

function createSpider () {
	arse.spiders = { visaSpider: new UsVisaSpider (arse.web, params) };
	arse.spiders.visaSpider.run();
}

//createSpider();
//setInterval(createSpider, 60000);

crontab.scheduleJob("* * * * *", createSpider);
crontab.scheduleJob("* */12 * * *", () => { arse.ants.fbAnt.announceFistDateForAllCities(); });
   
module.exports = arse;