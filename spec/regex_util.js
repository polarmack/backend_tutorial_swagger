var moment = require("moment");
const momentFormat = val => moment(val).format("YYYY-MM-DD");
const url = require("url");

const parseUrlImage = urlImage => {
	const myURL = url.parse(urlImage);
	let newUrl = "";
	if (myURL.host === null) newUrl = "https://" + urlImage;
	else newUrl = urlImage;

	return newUrl;
};
module.exports = {
	regexDate: /^(20[1-9][0-9])-([0][0-9]|1[0-2])-([0-2][0-9]|3[0-1])?$/,
	regexTime: /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/,
	regexFullname: /^[ก-๏\s]+$/,
	regexNormalString: /^[0-9a-zA-Z ก-๛]+$/,
	regexFullString: /^[_0-9a-zA-Z ก-๛\-,\\]+$/,
	regexMongoId: /^[0-9a-f]{24}$/,
	regexUserName: /^[_0-9a-z]+$/,
	regexEmail: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
	regexName: /^[a-zA-Z ก-๛]+$/,
	regexImageUrl: /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/,
	regexHttp: /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
	momentFormat,
	parseUrlImage
};
