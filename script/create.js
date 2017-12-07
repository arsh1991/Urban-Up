function handleNewBOPResult(err, res) {
    if (err) alert(err.message);
    else {
        $("#createTransactionID").append(`<p>Contract creation transaction submitted: <a href="${window.etherscanURL}tx/${res}">See Transaction on etherscan.</a></p>`);
    }
}

function callNewBOP(valueInEth, payer, serviceDepositInEth, autoreleaseIntervalInHours, title, payerString) {
    var valueInWei = web3.toWei(valueInEth, 'ether');
    var serviceDepositInWei = web3.toWei(serviceDepositInEth, 'ether');
    var autoreleaseIntervalInSeconds = autoreleaseIntervalInHours * 60 * 60;
    BOPFactory.contractInstance.newBurnableOpenPayment(payer, serviceDepositInWei, autoreleaseIntervalInSeconds, title, payerString, {
        'from': web3.eth.accounts[0],
        'value': valueInWei,
        'gas': 15000000
    }, handleNewBOPResult);
}

function useBOPFormInput() {
    var valueInEth = $("#NewBOPForm #paymentAmountInput").val();
    if (valueInEth == '') {
        alert("Must specify payment amount!");
        return;
    }
    valueInEth = Number(valueInEth);

    var payer = $("#NewBOPForm #payerInput").val();
    if (payer == '') {
        alert("Must specify payer!");
        return;
    }

    var serviceDepositInEth = $("#NewBOPForm #serviceDepositInput").val();
    if (serviceDepositInEth == '') {
        alert("Must specify service deposit!");
        return;
    }
    serviceDepositInEth = Number(serviceDepositInEth);

    var autoreleaseIntervalInHours = $("#autoreleaseIntervalInHoursInput").val();
    if (autoreleaseIntervalInHours == '') {
        alert("Must specify a default timeout length! (Or set default action to \"None\")");
        return;
    }
    autoreleaseIntervalInHours = Number(autoreleaseIntervalInHours);

    var payerString = $("#NewBOPForm #payerStringInput").val();
    var title = $("#titleInput").val();
    if (payerString == '') {
        if (!confirm("Initial payerString is empty! Are you sure you want to open a contract without a payerString?")) {
            return;
        }
    }
    callNewBOP(valueInEth, payer, serviceDepositInEth, autoreleaseIntervalInHours, title, payerString);
}

function populatePayerInputFromMetamask() {
    if ($("#payerInput").val() == "") {
        $("#payerInput").val(web3.eth.accounts[0])
    }
}

function updateLengthChecker() {
    var length = $('#titleInput').val().length;
    if (length <= 100) {
        $('#lengthCheckerOutput').html("<font style='color:blue'>" + length.toString() + "/100</font>");
    }
    else {
        $('#lengthCheckerOutput').html("<font style='color:red'>" + length.toString() + "/100<br><b>Caution!</b> Although the full title will be stored in the contract, Urban Up only displays the first 100 characters! Use the Initial Payer Statement to include more details.</font>");
    }
}

window.addEventListener('load', function () {
    if (typeof web3 !== 'undefined') {
        window.web3 = new Web3(web3.currentProvider);
        window.BOPFactory = {};
        web3.version.getNetwork((err, netID) => {
            if(netID === '1') {
            console.log("You are on the Ethereum main net!");
            window.etherscanURL = "https://etherscan.io/"
            BOPFactory.address = BOP_FACTORY_ADDRESS;
        } else if (netID === '3') {
            console.log("You are on the Ropsten net!");
            window.etherscanURL = "https://ropsten.etherscan.io/";
            BOPFactory.address = BOP_FACTORY_ADDRESS_ROPSTEN;
        }
        else {
            alert("You aren't on the Ethereum main or Ropsten net! Try changing your metamask options to connect to the main network.");
        }
        BOPFactory.ABI = BOP_FACTORY_ABI;
        BOPFactory.contract = web3.eth.contract(BOPFactory.ABI);
        BOPFactory.contractInstance = BOPFactory.contract.at(BOPFactory.address);
    })
        ;
    }
    else {
        $('h1').html("Metamask/Mist not detected. This site probably won't work for you. <a href='https://metamask.io/'>Download</a> the metamask addon and try again.");
        console.log("metamask/mist not detected. This site probably won't work for you. Download the metamask addon and try again!");
    }
});
