// Crawl all servers and nuke any which are possible, output all skipped

// Inspiration, reference or copied sources:
// https://github.com/iuriguilherme/netscripts.d/blob/master/deepscan-nuke.script
// https://github.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js
// https://github.com/Nolshine/bitburner-scripts/blob/master/spidercrack.ns.js

export async function main(ns) {
  ns.disableLog("sleep");

  let crackTools = ["BruteSSH.exe", "FTPCrack.exe", "RelaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  let crackFuncs = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject];

  // Check how many ports we could crack
  let crackCount = 0;
  crackTools.forEach(function (tool) {
    if (ns.fileExists(tool, "home")) crackCount++;
  });

  // Arrays for ignored, visited and planned targets
  let ignored = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
  ignored = ignored.concat(ns.getPurchasedServers()); // Ignore our purchased nodes as well
  let visited = [];
  let planned = ns.scan("home");
  let nuked = 0;
  let alreadyNuked = 0;

  while (planned.length > 0) {
    let target = planned.pop();

    // If it is ignored or already visited, skip it and jump to next iteration
    if (ignored.includes(target) || visited.includes(target)) {
      ns.print("INFO: Ignoring target: " + target);
      continue;
    }

    // Scan for new targets and mark this one as visited
    let scanned = ns.scan(target);
    planned = planned.concat(scanned);
    visited.push(target);

    let reasons = [];
    let crackRequired = ns.getServerNumPortsRequired(target);
    let levelRequired = ns.getServerRequiredHackingLevel(target);

    // Check if target is eligible
    if (ns.hasRootAccess(target)) {
      alreadyNuked++;
      reasons.push("Target already rooted");
    }
    else {
      if (levelRequired > ns.getHackingLevel()) {
        reasons.push("Requires Hacking level " + levelRequired);
      }
      if (crackRequired > crackCount) {
        reasons.push("Requires " + crackRequired + " crack tools");
      }
    }

    // If there were reasons for skipping it, jump to next iteration
    if (reasons.length > 0) {
      let reasonsString = reasons.join(", ");
      if (reasonsString == 'Target already rooted') continue; // Optional. If this is the only reason, do not warn
      ns.tprint("WARN: Skipping target: " + target + " (" + reasonsString + ")");
      continue;
    }

    // Otherwise crack the target
    for (let i = 0; i < crackRequired; i++) {
      crackFuncs[i](target);
    }

    // ..and nuke it
    ns.nuke(target);

    // Wait for a little while and verify results
    await ns.sleep(1000);
    if (ns.hasRootAccess(target)) {
      nuked++;
      ns.tprint("SUCCESS: Target rooted: " + target);
    } else {
      ns.tprint("ERROR: Rooting failed: " + target);
    }
  }

  ns.tprint("INFO: Finished crawling targets: " + visited.length + ". Nuked " + nuked + ", total " + alreadyNuked + " with root access");
}
