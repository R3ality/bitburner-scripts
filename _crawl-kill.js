// Crawl all servers and call killall()
// Or if arg[0] is specified as a script name, kill that instead

// Inspiration, reference or copied sources:
// https://raw.githubusercontent.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js

export async function main(ns) {
  // Arrays for ignored, visited and planned targets
  let ignored = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
  ignored = ignored.concat(ns.getPurchasedServers()); // Ignore our purchased nodes as well
  let visited = [];
  let planned = ns.scan("home");

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

    // If any scripts are running on it, run killall().
    if (ns.getServerUsedRam(target) > 0) {

      // Accept argument in case a specific script needs to be killed
      if (ns.args.length > 0) {
        ns.tprint("Killing script " + ns.args[0] + " on: " + target);
        ns.scriptKill(ns.args[0], target);
      } else {
        ns.tprint("Killing all scripts on: " + target);
        ns.killall(target);
      }

    }
  }

  ns.tprint("INFO: Finished crawling " + visited.length + " targets");
}
