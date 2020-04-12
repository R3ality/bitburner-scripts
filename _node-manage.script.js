// Manage purchased servers

var forceKill = false; // Default to NOT kill running subject script
if (args.length > 0) {
    forceKill = parseBoolean(args[0]); // Or accept second argument and forcefully kill any script
    tprint("<font color=cyan> NOTIFY:</font> Force killall set to: " + forceKill);
}

var execScript = "_farm-exp.script"; // Default to exp farming script
if (args.length > 1) {
    execScript = args[1]; // Or accept second argument as target script name
    tprint("<font color=cyan> NOTIFY:</font> Subject script set to: " + execScript);
}

var servers = getPurchasedServers();

while (servers.length > 0) {
    var target = servers.pop();

    // If any scripts are running on the target already
    if (getServerRam(target)[1] > 0) {
        // If it is the right script, skip this target
        if (!forceKill && isRunning(execScript, target)) {
            tprint("Subject script already running, skipping target: " + target);
            continue;
        } else {
            // Otherwise kill all scripts
            tprint("Killing all scripts on: " + target);
            killall(target);
        }
    }

    // Enslave the target
    if (execScript === "_farm-exp.script") {
        exec("_enslave.script", "home", 1, target);
    } else {
        // If non-default subject script, pass it along
        exec("_enslave.script", "home", 1, target, execScript);
    }


    // Wait until enslave script is finished
    while (isRunning("_enslave.script", "home", target)) {
        sleep(1000);
    }

    // Verify results
    if (isRunning(execScript, target)) {
        tprint("<font color=green>SUCCESS:</font> Node managed: " + target);
    } else {
        tprint("<font color=red>FAILURE:</font> Management failed: " + target);
    }

}

function parseBoolean(str) {
    if (str == 'true') return true;
    else return false;
}
