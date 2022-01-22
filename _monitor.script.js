// Monitor the security and money of the target

// If available, get target from file
var target = read("__target-money.txt");
if (!target) {
    // Otherwise get from argument
    if (args.length > 0) target = args[0];
    else {
        tprint("ERROR: No target specified. Exiting..");
        exit();
    }
}

function getTimestamp() {
    var now = new Date();
    var datetime = now.getFullYear() + "-" +
        String("0" + (now.getMonth() + 1)).slice(-2) + "-" +
        String("0" + now.getDate()).slice(-2) + " @ " +
        String("0" + now.getHours()).slice(-2) + ":" +
        String("0" + now.getMinutes()).slice(-2) + ":" +
        String("0" + now.getSeconds()).slice(-2);
    return datetime;
}

var remember = null;

while (true) {
    var moneyNow = getServerMoneyAvailable(target);
    var moneyMax = getServerMaxMoney(target);

    var securityNow = getServerSecurityLevel(target);
    var securityMin = getServerMinSecurityLevel(target);
    var securityDif = securityNow - securityMin;

    var txt = "INFO: [" + target + "]: Money: " + nFormat(moneyNow, '0,0.00') + " (" + ((moneyNow / moneyMax) * 100).toFixed(2) + "% of max " + nFormat(moneyMax, '0,0.00') + ") / Security: " + nFormat(securityNow, '0,0.00') + " (" + nFormat(securityDif, '0,0.00') + " over min)";
    if (txt !== remember) { // Only output if there has been a change
        remember = txt;
        tprint("[" + getTimestamp().slice(-8) + "] " + txt);
    }
    sleep(10000);
}
