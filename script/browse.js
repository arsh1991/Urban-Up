function onGetFullState(err, res, address, currentTime) {
  var bopObject = {};
  bopObject['contractAddress'] = address;
  bopObject['title'] = res[1].toString();
  bopObject['state'] = res[2].toString();
  bopObject['payer'] = res[0].toString();
  // bopObject['payerString'] = res[2].toString();
  bopObject['worker'] = res[3].toString();
  // bopObject['workerString'] = res[4].toString();
  bopObject['balance'] = res[4].toString();
  bopObject['serviceDeposit'] = res[5].toString();
  bopObject['amountDeposited'] = res[6].toString();
  bopObject['amountBurned'] = res[7].toString();
  bopObject['amountReleased'] = res[8].toString();
  // bopObject['autoRelease'] = res[10].toString();
  bopObject['autoreleaseInterval'] = res[9].toString();
  bopObject['autoreleaseTime'] = res[10].toString();
  bopObject['autoreleaseTimePassed'] = (currentTime >= Number(res[10]));
  BOPs.push(bopObject);
  buildBOPRow();
}

function buildBOPRow(){
  if(BOPs.length !== 1) $("tbody").append($(".mainTableRow").first().clone());
  // console.log(BOP_STATES[BOPs[bopCount].state]);
  switch(BOP_STATES[BOPs[BOPs.length-1].state]){
    case("Open"):
      $(`.state:eq(${BOPs.length-1})`).css("color", "green");
      break;
    case("Committed"):
      $(`.state:eq(${BOPs.length-1})`).css("color", "blue");
      break;
    case("Expended"):
      $(`.state:eq(${BOPs.length-1})`).css("color", "red");
      break;
  }
  $(`.state:eq(${BOPs.length-1})`).text(BOP_STATES[BOPs[BOPs.length-1].state]);
  $(`.contractAddress:eq(${BOPs.length-1})`).text("Go to Project Contract");
  $(`.contractAddress:eq(${BOPs.length-1})`).css({"font-size":"100%"});
  $(`.contractAddress:eq(${BOPs.length-1})`).css({"color":"blue"});
  $(`.contractAddress:eq(${BOPs.length-1})`).attr("href", `../layout/interact1.html?contractAddress=${BOPs[BOPs.length-1].contractAddress}`);
  $(`.payerAddress:eq(${BOPs.length-1})`).html(`\n <a href='${window.etherscanURL}${BOPs[BOPs.length-1].payer}'>${BOPs[BOPs.length-1].payer}</a>`);
  // $(`.payerAddress:eq(${BOPs.length-1})`).text(BOPs[BOPs.length-1].payer);
  if(BOPs[BOPs.length-1].worker !== "0x0000000000000000000000000000000000000000"){
    // $(`.workerAddress:eq(${BOPs.length-1})`).text("Worker: \n" + );
    $(`.workerAddress:eq(${BOPs.length-1})`).html(`<a href='${window.etherscanURL}${BOPs[BOPs.length-1].worker}'>${BOPs[BOPs.length-1].worker}</a>`);
  }else{
    $(`.workerAddress:eq(${BOPs.length-1})`).html(`No Worker! <a href='../layout/interact1.html?contractAddress=${BOPs[BOPs.length-1].contractAddress}'> Commit ether to become the worker for Project.</a>`);
  }
  $(`.title:eq(${BOPs.length-1})`).text(BOPs[BOPs.length-1].title);
  $(`.balance:eq(${BOPs.length-1})`).text(web3.fromWei(BOPs[BOPs.length-1].balance, 'ETHER'));
  $(`.serviceDeposit:eq(${BOPs.length-1})`).text(web3.fromWei(BOPs[BOPs.length-1].serviceDeposit, 'ETHER'));
  $(`.fundsDeposited:eq(${BOPs.length-1})`).text(web3.fromWei(BOPs[BOPs.length-1].amountDeposited, 'ETHER'));
  $(`.fundsBurned:eq(${BOPs.length-1})`).text(web3.fromWei(BOPs[BOPs.length-1].amountBurned, 'ETHER'));
  $(`.fundsReleased:eq(${BOPs.length-1})`).text(web3.fromWei(BOPs[BOPs.length-1].amountReleased, 'ETHER'));
  if (BOPs[BOPs.length-1].autoRelease != "false") {
    $(`.autoRelease:eq(${BOPs.length-1})`).text("Default release");
    $(`.autoreleaseInterval:eq(${BOPs.length-1})`).text(BOPs[BOPs.length-1].autoreleaseInterval/60/60 + " hours");
    if(BOPs[BOPs.length-1].autoreleaseTime != 0){
      if(BOPs[BOPs.length-1].autoreleaseTimePassed){
        $(`.autoreleaseTime:eq(${BOPs.length-1})`).text(new Date(BOPs[BOPs.length-1].autoreleaseTime * 1000).toLocaleString());
        $(`.autoreleaseTime:eq(${BOPs.length-1})`).css("color","green");
      }
      else{
        $(`.autoreleaseTime:eq(${BOPs.length-1})`).text(secondsToDhms(Number(BOPs[BOPs.length-1].autoreleaseTime - currentTime)));
        $(`.autoreleaseTime:eq(${BOPs.length-1})`).css("color","green");
      }
    }
    else{
      $(`.autoreleaseTime:eq(${BOPs.length-1})`).text(0);
    }
  }
  else {
    $(`.autoRelease:eq(${BOPs.length-1})`).text("No default release");
    $(`.autoreleaseInterval:eq(${BOPs.length-1})`).text("");
    $(`.autoreleaseTime:eq(${BOPs.length-1})`).text("");
  }
  onGABLoaded();
}

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
    web3.version.getNetwork((err, netID) => {
      let BOPAddress = BOP_FACTORY_ADDRESS;
      if (netID == 1) {
          console.log("You are on the Ethereum main net!");
          window.etherscanURL = "https://etherscan.io/address/"
          window.bopFactoryCreationBlock = 4207091;
      }
      else if (netID == 3) {
          console.log("You are on the Ropsten net!");
          BOPAddress = BOP_FACTORY_ADDRESS_ROPSTEN;
          window.etherscanURL = "https://ropsten.etherscan.io/address/";
          window.bopFactoryCreationBlock = 1655966;
      }
      else{
        alert("You aren't on the Ethereum main or Ropsten net! Try changing your metamask options to connect to the main network.");
      }
      window.BOPFactory = {
          "address": BOPAddress,
          "ABI": BOP_FACTORY_ABI
      };
      BOPFactory.contract = web3.eth.contract(BOPFactory.ABI);
      BOPFactory.contractInstance = BOPFactory.contract.at(BOPFactory.address);

      //get all newBOP events
      window.BOPs = [];
      window.event = BOPFactory.contractInstance.NewBOP({}, {"fromBlock": bopFactoryCreationBlock});//NewBOP is an event, not a method; it returns an event object.

      currentBOP = {
          "address": "",
          "ABI": BOP_ABI
      };

      currentBOP.contract = web3.eth.contract(currentBOP.ABI);

      web3.eth.getBlock("latest",function(err,res){
        if (err) {
            console.log("Error calling contract method: " + err.message);
        }
        else{
          currentTime = res.timestamp;
          BOPFactory.contractInstance.getBOPCount(function(err,res){
            if (err) {
                console.log("Error calling contract method: " + err.message);
            }
            else {
              var contractArray = [];
              for(var conCounter = 0; conCounter < Number(res); conCounter++){
                BOPFactory.contractInstance.BOPs(conCounter, function(err,res){
                  if (err) {
                      console.log("Error calling contract method: " + err.message);
                  }
                  else{
                    var currentAddress = res;
                    (function(currentAddress){
                      web3.eth.getCode(currentAddress, function(err, res){
                        if(err){
                          console.log("Error calling contract method: " + err.message);
                        }
                        else if(res !== "0x"){
                          currentBOP.contractInstance = currentBOP.contract.at(currentAddress);
                          currentBOP.contractInstance.getFullState(function(err,res){
                            if(err){
                              console.log("Error calling contract method: " + err.message);
                            }
                            else{
                              onGetFullState(err, res, currentAddress, currentTime);
                            }
                          });
                        }
                      });
                    })(currentAddress);
                  }
                });
              }
            }
          });
        }
      });
    });
  }
  else {
      $("h1").html("Metamask/Mist not detected. This site probably won't work for you. <a href='https://metamask.io/'>Download</a> the metamask addon and try again.");
      console.log("metamask/mist not detected. This site probably won't work for you. Download the metamask addon and try again!");
  }
});
