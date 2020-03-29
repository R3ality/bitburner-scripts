// Crawl all servers and call killall()

// Referenced or copied sources:
// https://raw.githubusercontent.com/Nolshine/bitburner-scripts/master/crawlkill.ns.js

export async function main(ns) {
    // an array to store visited nodes, so we don't keep scanning them forever.
    let visited = ["home"]; // ADD ANY SERVERS HERE WHICH SHOULD BE SKIPPED
    // an array to store nodes that we discovered that have yet to be scanned AKA visited.
    // this array will be initialized to have all servers reachable from 'home' in it.
    let nodes = ns.scan("home");

    // loop while there are nodes left in in the 'nodes' array,
    // which would mean its 'length' property isn't zero
    while (nodes.length !== 0) {
        // remove the last server from 'nodes' and store it separately
        let server = nodes.pop();
        // is the node visited?
        if (!visited.includes(server)) {
            // node not visited, so we scan it and add the results to 'nodes'.
            // we also add it to visited
            nodes = nodes.concat(ns.scan(server));
            visited.push(server);

            // if any scripts are running on it, run killall().
            if (ns.getServerRam(server)[1] > 0) {
                ns.tprint("Killing all scripts in: " + server);
                ns.killall(server);
            }
        }
    }
    ns.tprint("Finished crawling " + (visited.length - 1) + " servers");
}
