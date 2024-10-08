// Crawl all servers and enslave any which are possible

// Inspiration, reference or copied sources:
// https://github.com/iuriguilherme/netscripts.d/blob/master/deepscan-nuke.script
// https://github.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js
// https://github.com/Nolshine/bitburner-scripts/blob/master/spidercrack.ns.js

export async function main(ns) {
  ns.disableLog("sleep");

  // Arrays for ignored, visited and planned targets
  let ignored = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
  ignored = ignored.concat(ns.getPurchasedServers()); // Ignore our purchased nodes as well
  let visited = [];
  let planned = ns.scan("home");
  let enslaved = 0;

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

    // If it is rooted, and has ram...
    if (ns.hasRootAccess(target) && ns.getServerMaxRam(target) != 0) {
      // ...and not yet enslaved, attempt to enslave it
      if (!ns.isRunning("_farm-money.script", target) && !ns.isRunning("_farm-exp.script", target)) {

        ns.exec("_enslave.script", "home", 1, target);

        // Wait until enslave script is finished
        while (ns.isRunning("_enslave.script", "home", target)) {
          await ns.sleep(1000);
        }

        // Verify results
        if (ns.isRunning("_farm-money.script", target) || ns.isRunning("_farm-exp.script", target)) {
          enslaved++;
          ns.tprint("SUCCESS: Target enslaved: " + target);
        } else {
          ns.tprint("ERROR: Enslaving failed: " + target);
        }
      }
    }
  }

  ns.tprint("INFO: Finished crawling " + visited.length + " targets. Enslaved " + enslaved);
}
