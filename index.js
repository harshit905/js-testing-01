// Trivial entry point so the repo looks real and imports the prod deps.
const _ = require("lodash");
const minimist = require("minimist");
const debug = require("debug")("app");

function run() {
  debug("started");
  return _.merge({}, minimist(process.argv.slice(2)));
}

module.exports = { run };
