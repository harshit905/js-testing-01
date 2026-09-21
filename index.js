// Trivial entry point so the repo looks real and imports the prod deps.
const _ = require("lodash");
const mkdirp = require("mkdirp");
const semver = require("semver");

function run() {
  return { latest: semver.valid("1.0.0"), merged: _.merge({}, {}), mkdirp };
}

module.exports = { run };
