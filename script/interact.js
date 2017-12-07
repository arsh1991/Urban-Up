window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
      window.web3 = new Web3(web3.currentProvider);
      //get GET-Parameter from URL to decide on contract
      window.address = getUrlParameter('contractAddress');

      web3.version.getNetwork((err, netID) => {
        if (netID == 1) {
          console.log("You are on the Ethereum main net!");
          window.factory_address = BOP_FACTORY_ADDRESS;
          if(typeof window.address == "undefined") window.address = "";
          window.etherscanURL = "https://etherscan.io/address/"
          window.etherscanAPI = "https://api.etherscan.io/api?";
          $("#verifiedOutput").text("WARNING: Contract has not been verified as a BOP!");
        }
        else if (netID == 3) {
          console.log("You are on the Ropsten net!");
          window.factory_address = BOP_FACTORY_ADDRESS_ROPSTEN;
          window.etherscanURL = "https://ropsten.etherscan.io/address/";
          window.etherscanAPI = "https://ropsten.etherscan.io/api?";
          $("#verifiedOutput").text("WARNING: Contract has not been verified as a BOP!");
        }
        else{
          console.log("You aren't on the Ethereum main or Ropsten net! Try changing your metamask options to connect to the main network.");
        }
        //Initialize the BOP object to interact with the smart contract(BOP)
        window.BOPFactory = {
            "address": window.factory_address,
            "ABI": BOP_FACTORY_ABI
        };
        BOPFactory.contract = web3.eth.contract(BOPFactory.ABI);
        BOPFactory.contractInstance = BOPFactory.contract.at(BOPFactory.address);

        window.BOP = {
            "address": window.address,
            "ABI": BOP_ABI,
        };



        BOPFactory.contractInstance.getBOPCount(function(err,res){
          if (err) {
              console.log("Error calling Contract method: " + err.message);
          }
          else {
            for(var conCounter = 0; conCounter < Number(res); conCounter++){
              BOPFactory.contractInstance.BOPs(conCounter, function(err,res){
                if (err) {
                    console.log("Error calling Contract method: " + err.message);
                }
                else{
                  if(window.address !== res){
                     console.log();
                  }
                  else{
                    $("#verifiedOutput").text("Contract verified.");
					$("#verifiedOutput").css({'color':'green'});
                    BOP.contract = web3.eth.contract(BOP.ABI);
                    BOP.contractInstance = BOP.contract.at(BOP.address);
                    getEventsAndParticipants('logs','getLogs','address=' + window.address);

                    window.checkUserAddressesInterval = setInterval(checkForUserAddresses, 1000);
                    window.getFullStateInterval = setInterval(function(){
                      web3.eth.getCode(window.address,function(err,res){
                        if(res == "0x"){
                          console.log("This Contract doesn't exist or was destroyed.")
                          document.getElementById('payerFundsInputGroup').hidden = true;
                          document.getElementById('updatePayerStringInputGroup').hidden = true;
                          document.getElementById('updateWorkerStringInputGroup').hidden = true;
                          document.getElementById('commitInputGroup').hidden = true;
                        	document.getElementById('recoverFundsInputGroup').hidden = true;
                          document.getElementById('autoReleaseInputGroup').hidden = true;
                          document.getElementById('delayDefaultActionForm').hidden = true;
                          $('.insertAddress').text(BOP.address);
                          $('#etherscanLink').attr("href", `${window.etherscanURL}${BOP.address}`);
                          $('#BOPTitleOutput').text("Doesn't exist/Destroyed");
                          $('#BOPInfoOutput').text("None");
                          $('#BOPPayerOutput').text("None")
                          $('#BOPWorkerOutput').text("None")
                          // $('#BOPPayerStringOutput').text("None");
                          // $('#BOPWorkerStringOutput').text("None");
                          $('#BOPBalanceOutput').text("None");
                          $('#BOPServiceDepositOutput').text("None");
                          $('#BOPFundsDepositedOutput').text("None");
                          $('#BOPFundsBurnedOutput').text("None");
                          $('#BOPFundsReleasedOutput').text("None");
                          // $('#BOPDefaultActionOutput').text("None");
                          $('#BOPDefaultTimeoutLength').text("None");
                          $('#BOPTable').css("background-color", "#9ca2a3");
                        }
                        else{
                          BOP.contractInstance.getFullState(function(err, res){
                            if (err) {
                              console.log("Error calling Contract method: " + err.message);
                              ////workaournd////////////////////////////////////////////////////////
                              console.log("This Contract doesn't exist or was destroyed.")
                              document.getElementById('payerFundsInputGroup').hidden = true;
                              document.getElementById('updatePayerStringInputGroup').hidden = true;
                              document.getElementById('updateWorkerStringInputGroup').hidden = true;
                              document.getElementById('commitInputGroup').hidden = true;
                              document.getElementById('recoverFundsInputGroup').hidden = true;
                              document.getElementById('autoReleaseInputGroup').hidden = true;
                              document.getElementById('delayDefaultActionForm').hidden = true;

                              $('.insertAddress').text(BOP.address);
                              $('#etherscanLink').attr("href", `${window.etherscanURL}${BOP.address}`);
                              $('#BOPTitleOutput').text("Doesn't exist/Destroyed");
                              $('#BOPInfoOutput').text("None");
                              $('#BOPPayerOutput').text("None")
                              $('#BOPWorkerOutput').text("None")
                              $('#BOPPayerStringOutput').text("None");
                              $('#BOPWorkerStringOutput').text("None");
                              $('#BOPBalanceOutput').text("None");
                              $('#BOPServiceDepositOutput').text("None");
                              $('#BOPFundsDepositedOutput').text("None");
                              $('#BOPFundsBurnedOutput').text("None");
                              $('#BOPFundsReleasedOutput').text("None");
                              $('#BOPDefaultActionOutput').text("None");
                              $('#BOPDefaultTimeoutLength').text("None");
                              $('#BOPTable').css("background-color", "#9ca2a3");
                              ////workaournd////////////////////////////////////////////////////////
                            }
                            else{
                              BOP['title'] = res[1].toString();
                              BOP['state'] = res[2].toString();
                              BOP['payer'] = res[0].toString();
                              // BOP['payerString'] = res[2].toString();
                              BOP['worker'] = res[3].toString();
                              // BOP['workerString'] = res[4].toString();
                              BOP['balance'] = res[4].toString();
                              BOP['serviceDeposit'] = res[5].toString();
                              BOP['amountDeposited'] = res[6].toString();
                              BOP['amountBurned'] = res[7].toString();
                              BOP['amountReleased'] = res[8].toString();
                              // BOP['autoRelease'] = res[10].toString() === "true";
                              BOP['autoreleaseInterval'] = res[9].toString();
                              BOP['autoreleaseTime'] = res[10].toString();
                              insertInstanceStatsInPage();
                              if (BOP_STATES[Number(BOP.state)] == 'Open') $('#BOPInfoOutput').css("color", "green");
                              if (BOP_STATES[Number(BOP.state)] == "Committed") $('#BOPInfoOutput').css("color", "blue");
                              if (BOP_STATES[Number(BOP.state)] == "Expended") $('#BOPInfoOutput').css("color", "red");
                              updateExtraInput();
                            }
                          });
                        }
                      })
                    }, 3000);
                  }
                }
              });
            }
          }
        });
      });
  }
  else {
    $("h1").html("Metamask/Mist not detected. This site probably won't work for you. <a href='https://metamask.io/'>Download</a> the metamask addon and try again.");
    console.log("metamask/mist not detected. This site probably won't work for you. Download the metamask addon and try again!");
  }
});

function insertInstanceStatsInPage(){
    $('.insertAddress').text(BOP.address);
    $('#etherscanLink').attr("href", `${window.etherscanURL}${BOP.address}`);
    $('#BOPTitleOutput').text(BOP.title);
    $('#BOPInfoOutput').text(BOP_STATES[BOP.state]);
    $('#BOPPayerOutput').text(BOP.payer)
    // $('#BOPPayerStringOutput').text(BOP.payerString);
    BOP.worker == '0x0000000000000000000000000000000000000000' ? $('#BOPWorkerOutput').text("None") : $('#BOPWorkerOutput').text(BOP.worker);
    // $('#BOPWorkerStringOutput').text(BOP.workerString, 'ether');
    $('#BOPBalanceOutput').text(web3.fromWei(BOP.balance, 'ether') + ' ETH');
    $('#BOPServiceDepositOutput').text(web3.fromWei(BOP.serviceDeposit,'ether') + ' ETH');
    $('#BOPFundsDepositedOutput').text(web3.fromWei(BOP.amountDeposited, 'ether') + ' ETH');
    $('#BOPFundsBurnedOutput').text(web3.fromWei(BOP.amountBurned, 'ether') + ' ETH');
    $('#BOPFundsReleasedOutput').text(web3.fromWei(BOP.amountReleased, 'ether') + ' ETH');
    // $('#BOPDefaultActionOutput').text(BOP.autoRelease);
    $('#BOPDefaultTimeoutLength').text(secondsToDhms(BOP.autoreleaseInterval));
    $('#BOPTriggerTime').html('Remaining Time:<br>' + new Date(BOP.autoreleaseTime * 1000).toLocaleString()); //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
}


function updateExtraInput() {
  var userHasAddress = (isUserAddressVisible());
  var userIsPayer = (BOP.payer == web3.eth.defaultAccount);
  var userIsWorker = (BOP.worker == web3.eth.defaultAccount);
  var isNullWorker = (BOP.worker == '0x0000000000000000000000000000000000000000');

  // document.getElementById('payerFundsInputGroup').hidden = !userIsPayer;
  document.getElementById('payerBurnReleaseInputGroup').hidden = (BOP_STATES[Number(BOP.state)] !== "Committed" || !userIsPayer);
  document.getElementById('updatePayerStringInputGroup').hidden = !userIsPayer;
  document.getElementById('updateWorkerStringInputGroup').hidden = !userIsWorker;
  document.getElementById('commitInputGroup').hidden = !isNullWorker;
	document.getElementById('recoverFundsInputGroup').hidden = !(userIsPayer && isNullWorker);
  web3.eth.getBlock("latest",
    function(err,res){
      if (err) {
          console.log("Error calling Contract method: " + err.message);
      }
      else{
        currentTime = res.timestamp;
      }
      if(!(userIsWorker || userIsPayer)){
        document.getElementById('autoReleaseInputGroup').hidden = true;
        document.getElementById('delayDefaultActionForm').hidden = true;
      }
      if((Number(BOP.autoreleaseTime) < currentTime && BOP_STATES[Number(BOP.state)] === 'Committed' && (userIsWorker || userIsPayer))){
        console.log(1)
        document.getElementById('BOPTriggerTime').hidden = false;
        document.getElementById('BOPDefaultTimeoutLengthGroup').hidden = false;
        document.getElementById('autoReleaseInputGroup').hidden = false;
        document.getElementById('delayDefaultActionForm').hidden = !userIsPayer;
      }
      else if((Number(BOP.autoreleaseTime) > currentTime && BOP_STATES[Number(BOP.state)] === 'Committed' && (userIsWorker || userIsPayer))){
        document.getElementById('BOPTriggerTime').hidden = false;
        document.getElementById('BOPDefaultTimeoutLengthGroup').hidden = false;
        document.getElementById('autoReleaseInputGroup').hidden = true;
        document.getElementById('delayDefaultActionForm').hidden = true;
        differenceTime = Number(BOP.autoreleaseTime) - res.timestamp;
        if(0 < differenceTime && differenceTime <= 86400){
          $('#BOPTriggerTime').html("Remaining Time:<br>" + secondsToDhms(differenceTime));
        }
        else{
          $('#BOPTriggerTime').html("Remaining Time:<br>" + new Date(BOP.autoreleaseTime * 1000).toLocaleString());
          $('#BOPTriggerTime').css("color", "red");
        }
      }
      else if(Number(BOP.autoreleaseTime) < currentTime && BOP_STATES[Number(BOP.state)] === 'Committed'){
        document.getElementById('BOPTriggerTime').hidden = false;
        document.getElementById('BOPDefaultTimeoutLengthGroup').hidden = false;
      }
      else if(BOP_STATES[Number(BOP.state)] === 'Committed'){
        document.getElementById('BOPTriggerTime').hidden = false;
        document.getElementById('BOPDefaultTimeoutLengthGroup').hidden = false;
      }
      else{
        document.getElementById('BOPTriggerTime').hidden = true;
        document.getElementById('BOPDefaultTimeoutLengthGroup').hidden = false;
      }
  });
}

function isUserAddressVisible() {
	return (typeof(web3.eth.accounts) != 'undefined' && web3.eth.accounts.length > 0);
}
function checkForUserAddresses() {
    if (isUserAddressVisible()) {
        clearInterval(checkUserAddressesInterval);
        onUserAddressesVisible();
    }
    else {
        onUserAddressesNotVisible();
    }
}
function onUserAddressesNotVisible() {
    document.getElementById('userAddress').innerHTML = "Can't find user addresses. If using metamask, are you sure it's unlocked and initialized?<br>";
}
function onUserAddressesVisible() {
    web3.eth.defaultAccount = web3.eth.accounts[0];
    document.getElementById('userAddress').innerHTML = "User address:<br>" + web3.eth.defaultAccount;
}

function workerStringEditMode(flag) {
	if (flag) {
		$('#workerStringUpdateStartButton').hide();
		$('#workerStringUpdateTextarea').show();
		$('#workerStringUpdateCommitButton').show();
		$('#workerStringUpdateCancelButton').show();
		$('#BOPWorkerStringOutput').hide();
	}
	else {
		$('#workerStringUpdateStartButton').show();
		$('#workerStringUpdateTextarea').hide();
		$('#workerStringUpdateCommitButton').hide();
		$('#workerStringUpdateCancelButton').hide();
		$('#BOPWorkerStringOutput').show();
	}
}
function startWorkerStringUpdate() {
	workerStringEditMode(true);

	('#workerStringUpdateTextarea').val(BOP.workerString);
}
function cancelWorkerStringUpdate() {
	workerStringEditMode(false);
}
function commitWorkerStringUpdate() {
	callUpdateWorkerString($('#workerStringUpdateTextarea').val());
	workerStringEditMode(false);
}

function payerStringEditMode(flag) {
	if (flag) {
		$('#payerStringUpdateStartButton').hide();
		$('#payerStringUpdateTextarea').show();
		$('#payerStringUpdateCommitButton').show();
		$('#payerStringUpdateCancelButton').show();
		$('#BOPPayerStringOutput').hide();
	}
	else {
		$('#payerStringUpdateStartButton').show();
		$('#payerStringUpdateTextarea').hide();
		$('#payerStringUpdateCommitButton').hide();
		$('#payerStringUpdateCancelButton').hide();
		$('#BOPPayerStringOutput').show();
	}
}
function startPayerStringUpdate() {
	payerStringEditMode(true);

	$('#payerStringUpdateTextarea').val(BOP.payerString);
}
function cancelPayerStringUpdate() {
	payerStringEditMode(false);
}
function commitPayerStringUpdate() {
	callUpdatePayerString($('#payerStringUpdateTextarea').val());
	payerStringEditMode(false);
}


//smart contract caller and handler functions
function handleCommitResult(err, res) {
    if (err) console.log(err.message);
}
function callCommit() {
    BOP.contractInstance.commit({'value':BOP.serviceDeposit}, handleCommitResult);
}
function handleRecoverFundsResult(err, res) {
	if (err) console.log(err.message);
}
function callRecoverFunds() {
	BOP.contractInstance.recoverFunds(handleRecoverFundsResult);
}
function handleReleaseResult(err, res) {
    if (err) console.log(err.message);
}
function callRelease(amountInEth) {
    BOP.contractInstance.release(web3.toWei(amountInEth,'ether'), handleReleaseResult);
}
function releaseFromForm() {
    var form = document.getElementById('payerFundsInputGroup');
    var amount = Number(form.elements['amount'].value);

    callRelease(amount);
}
function handleBurnResult(err, res) {
    if (err) console.log(err.message);
}
function callBurn(amountInEth) {
    BOP.contractInstance.burn(web3.toWei(amountInEth,'ether'), handleBurnResult);
}
function burnFromForm() {
    var form = document.getElementById('payerFundsInputGroup');
    var amount = Number(form.elements['amount'].value);

    callBurn(amount);
}
function handleAddFundsResult(err, res) {
	if (err) console.log(err.message);
}
function callAddFunds(includedEth) {
	BOP.contractInstance.addFunds({'value':web3.toWei(includedEth,'ether')}, handleAddFundsResult)
}
function addFundsFromForm() {
	var form = document.getElementById('payerFundsInputGroup');
	var amount = Number(form.elements['amount'].value);
	callAddFunds(amount);
}
function callDefaultAction(){
  BOP.contractInstance.triggerAutorelease(logCallResult);
}
function delayDefaultRelease(){
  // var delayDefaultActionInHours = Number($('input[type=text]', '#delayDefaultActionForm').val());
  BOP.contractInstance.delayAutorelease(logCallResult);
}
function handleUpdateWorkerStringResult(err, res) {
    if (err) console.log(err.message);
}
function callUpdateWorkerString(newString) {
    BOP.contractInstance.logPayerStatement(newString, handleUpdateWorkerStringResult);
}
function handleUpdatePayerStringResult(err, res) {
    if (err) console.log(err.message);
}
function callUpdatePayerString(newString) {
    BOP.contractInstance.logPayerStatement(newString, handleUpdatePayerStringResult);
}
function callCancel() {
    BOP.contractInstance.recoverFunds(logCallResult);
}
function callGetFullState() {
    BOP.contractInstance.payer(logCallResult);
}


//////////////////////////////////Events Part of the interact page////////////////////////////////////////////////
function buildEventsPage(logArray, payer, worker){
  var who;
  var logArrayCounter = 0;
  var eventArray = [];
  logArray.forEach(function(log){
    var eventObject = {};
    (function(log){
      web3.eth.getTransaction(log.transactionHash, function(err,res){
        if(err){
          console.log("Error calling Contract method: " + err.message);
        }
        else{
          var topic = log.topics[0];
          var event = decodeTopic(topic, BOP_ABI);
          if(res === null){
            console.log("null");
          }
          else if(res.from === payer){
            who = "payer";
          }
          else if(res.from === worker){
            who = "worker";
          }
          eventObject.who = who;
          eventObject.event = event;
          eventObject.timeStamp = log.timeStamp;
          eventObject.arguments = returnEventArguments(log.data, event)
          eventArray.push(eventObject);

          logArrayCounter += 1;
          if(logArrayCounter === logArray.length){
            eventArray = sortOnTimestamp(eventArray);
            insertAllInChat(eventArray);
          }
        }
      });
    })(log);
  });
}

function returnEventArguments(rawArguments, eventInfo){
  if(eventInfo.name === "Created" || typeof eventInfo.inputs[0] == "undefined") return "";
  var rawArgumentArray = rawArguments.substring(2).match(/.{1,64}/g);
  switch(eventInfo.inputs[0].type){
    case "address":
      return "0x" + rawArgumentArray[rawArgumentArray.length-1].substring(24);
      break;
    case "uint256":
      return parseInt(rawArgumentArray[rawArgumentArray.length-1], 16);
      break;
    case "string":
      var builtString = "";
      rawArgumentArray.slice(2, rawArgumentArray.length).forEach((element) => {
        builtString += web3.toAscii(element);
      });
      return builtString;
      break;
    case "bool":
      return parseInt(rawArgumentArray[rawArgumentArray.length-1]) === 1;
      break;
    default:
    return "";
  }
}

function insertAllInChat(eventArray){
  eventArray.forEach(function(eventObject){
    var text;
    // console.log(eventObject);
    var whoString = (eventObject.who === "payer") ? "Payer" : "Worker";
    switch(eventObject.event.name){
      case "Created":
        text = whoString + " " + "created the Contract";
        break;
      case "FundsAdded":
        text = web3.fromWei(eventObject.arguments, 'ether') + " ETH added to contract";
        break;
      case "PayerStatement":
        text = whoString + " string updated: " + eventObject.arguments;
        break;
      case "PayerStatement":
        text = whoString + " string updated: " + eventObject.arguments;
        break;
      case "FundsRecovered":
        text = whoString + " " + "recovered all Funds";
        break;
      case "Committed":
        text = "Contract state changed to Committed"
        break;
      case "FundsBurned":
        text = whoString + " burned " + web3.fromWei(eventObject.arguments, "ether") + " ETH";
        break;
      case "FundsReleased":
        text = whoString + " released " + web3.fromWei(eventObject.arguments, 'ether') + " ETH";
        break;
      case "Closed":
        text = "Contract state changed to Expended";
        break;
      case "Unclosed":
        text = "Contract state changed back from Expended";
        break;
      case "DefaultReleaseDelayed":
        text = whoString + " " + "called default release";
        break;
      case "DefaultReleaseCalled":
        text = whoString + " " + "delayed default release";
        break;
      default:
        text = eventObject.event.name;
        break;
    }
    insertChat(eventObject.who, text, new Date(parseInt(eventObject.timeStamp, 16) * 1000).toLocaleString());
  });
}

function getEventsAndParticipants(moduleParam, actionParam, additionalKeyValue){
  BOP.contractInstance.getFullState(function(err, res){
    if (err) {
      console.log("Error calling Contract method: " + err.message);
    }
    else{
      var payer = res[0].toString();
      var worker = res[3].toString();
      callEtherscanApi(moduleParam, actionParam, additionalKeyValue, function(resultJSON){
        buildEventsPage(resultJSON.result, payer, worker)
      });
    }
  });
}

function callEtherscanApi(moduleParam, actionParam, additionalKeyValue, callback){
  var request = new XMLHttpRequest();
  request.onreadystatechange = function(){
    if(this.readyState == 4){
      if(this.status == 200){
        var resultParsed = JSON.parse(this.responseText);
        callback(resultParsed);
      }
    }
  }
  request.open('GET', `${window.etherscanAPI}module=${moduleParam}&action=${actionParam}&${additionalKeyValue}&fromBlock=0&toBlock=latest`, true);
  request.send();
}

function decodeTopic(topic, abi){
  for (var methodCounter = 0; methodCounter < abi.length; methodCounter++) {
    var item = abi[methodCounter];
    if (item.type != "event") continue;
    var signature = item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")";
    var hash = web3.sha3(signature);
    if (hash == topic) {
      return item;
    }
  }
}

function insertChat(who, text, date){
  var control = "";
  if (who === "payer"){
    control =
    '<li class="list-group-item list-group-item-success" style="width:100%">' +
      '<div class="row">' +
        '<div class="col-md-6">' +
          '<span>' + text + '</span>' +
          '<p><small>' + date + '</small></p>' +
        '</div>' +
        '<div class="col-md-6"></div>' +
      '</div>' +
    '</li>';
  }
  else if(who === "worker"){
    control =
      '<li class="list-group-item list-group-item-info" style="width:100%;">' +
        '<div class="row">' +
          '<div class="col-md-6"></div>' +
          '<div class="col-md-6" align="right">' +
            '<span>' + text + '</span>' +
            '<p><small>' + date + '</small></p>' +
          '</div>' +
        '</div>' +
      '</li>';
  }
  $("#event-list").append(control);
}


function sortOnTimestamp(eventArray){
  eventArray.sort(function(current, next){
    if(current.timeStamp < next.timeStamp) return -1;
    if(current.timeStamp > next.timeStamp) return 1;
    return 0;
  });
  return eventArray;
}
