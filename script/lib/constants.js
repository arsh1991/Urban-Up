var BOP_FACTORY_ADDRESS = "0x38B394cD27C3b0D865F58a4512b65c7b0ab6DB66"; //////////////////needs to be changed to const in final version, var for test purposes
var BOP_FACTORY_ADDRESS_ROPSTEN = "0x395135f78242Ad2AA75CCE2D4890d51e3D77e2fa"; //////////////////needs to be changed to const in final version, var for test purposes

const BOP_STATES = {
  0: 'Open',
  1: 'Committed',
  2: 'Expended'
}

function secondsToDhms(d) {
	d = Number(d);
  var days = Math.floor(d / 86400);
	var h = Math.floor(d % 86400 / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);
  return ((days > 0 ? days + " days " : "") + (h > 0 ? h + " h " + (m < 10 ? "0" : "") : "") + m +" min" + " " + (s < 10 ? "0" : "") + s + " sec");
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function truncateTitleIfTooLong(title) {
  if (title.length > 100)
    return title.substring(0,100) + "...";
  else return title;
}

function hexToAscii(str1){
//hexToAscii(resultParsed.status).replace(/(<([^>]+)>)/ig,"");
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}

function logCallResult(err, res) {
    if (err) {
        console.log("Error calling ddddBOP method: " + err.message);
    }
    else {
        return res;
    }
}

window.addEventListener('load', () => {
  $.get("navbar.html", (data) => {
    $("#nav-placeholder").replaceWith(data);
  });
});
