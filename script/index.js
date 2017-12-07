

window.addEventListener('load', function() {
  $.get("layout/navbar_index.html", function(data){
    $("#nav-placeholder").replaceWith(data);
  });
  if (typeof web3 !== 'undefined') {
      window.web3 = new Web3(web3.currentProvider);
      web3.version.getNetwork((err, netID) => {
        if (netID == 1) {
            console.log("You are on the Ethereum main net!");
            window.etherscanURL = "https://etherscan.io/address/"
            window.bopFactoryCreationBlock = 4207091;
        }
        else if (netID == 3) {
            console.log("You are on the Ropsten net!");
            BOP_FACTORY_ADDRESS = '0x5b8c8de6e864b94a759373f876587f228779c177';
            window.etherscanURL = "https://ropsten.etherscan.io/address/";
            window.bopFactoryCreationBlock = 1655966;
        }
        else{
          alert("You aren't on the Ethereum main or Ropsten net! Try changing your metamask options to connect to the main network.");
        }
      });
  }
  else {
    $('#metamask-info').html("Metamask/Mist not detected. This site probably won't work for you. <a href='https://metamask.io/'>Download</a> the metamask addon and try again.");
    console.log("metamask/mist not detected. This site probably won't work for you. Download the metamask addon and try again!");
  }
});
