// Entry point: imports every prod dep so reachability sees the packages in use.
const _ = require("lodash");
const lod3 = require("lod");
const mkdirp = require("mkdirp");
const semver = require("semver");
const axios = require("axios");
const settings = require("./lib/settings");
const decoy = require("./lib/decoy");

function run() {
  const merged = _.merge({}, { a: 1 });
  const greeting = _.template("hello <%= name %>")({ name: "sca" });
  const picked = lod3.pick({ a: 1, b: 2 }, ["a"]);
  const latest = semver.valid("1.0.0");
  const http = axios.create({ baseURL: "https://example.invalid", timeout: 5000 });
  return { merged, greeting, picked, latest, http, mkdirp, settings, decoy };
}

module.exports = { run };
