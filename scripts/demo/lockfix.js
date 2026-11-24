// Make an old version install what it got when it was released, not what the registry has today.
//
//     node lockfix.js <dir> <release date, YYYY-MM-DD>
//
// Run in a version's export (server or client folder) before `yarn install`:
//   1. A Yarn 2+ ("berry") yarn.lock, which the Yarn 1 in the Node images can't read (it then
//      resolves everything afresh), is rewritten in Yarn 1's format with the same versions.
//   2. A direct dependency whose range has no entry in yarn.lock (package.json changed without
//      the lockfile following) is pinned to the newest version matching its range that was
//      published by the release date: what `yarn install` resolved to when it was built then.
// Prints one line per change. Anything it can't read is left alone for yarn to resolve.
"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");

const [dir, date] = process.argv.slice(2);
const cutoff = new Date(`${date}T23:59:59Z`).getTime();
const lockPath = path.join(dir, "yarn.lock");
const pkgPath = path.join(dir, "package.json");

// ---- berry -> yarn 1 ---------------------------------------------------------------------

const unq = (s) => s.trim().replace(/^"(.*)"$/, "$1");

function descriptor(raw) {
  // "name@npm:^1.2.0" -> "name@^1.2.0"; aliases keep "npm:" ("a@npm:b@^1" stays, as Yarn 1 reads it)
  const at = raw.indexOf("@", 1);
  if (at < 0) return null;
  const name = raw.slice(0, at);
  let range = raw.slice(at + 1);
  if (!range.startsWith("npm:")) return null;          // workspace:, patch:, virtual:, file:, ...
  range = decodeURIComponent(range.slice(4));
  if (range.includes("@", 1)) range = "npm:" + range;   // an alias
  return { name, range };
}

function depRange(value) {
  let v = unq(value);
  if (v.startsWith("patch:")) {                          // patch:resolve@npm%3A^1.1.7#... -> ^1.1.7
    const inner = decodeURIComponent(v.slice(6).split("#")[0]);
    const d = descriptor(inner);
    return d ? d.range : null;
  }
  if (v.startsWith("npm:")) {
    v = v.slice(4);
    return v.includes("@", 1) ? "npm:" + v : v;
  }
  return /^[a-z]+:/i.test(v) ? null : v;
}

function berryToV1(text) {
  const blocks = text.split(/\n(?=\S)/);
  const out = ["# yarn lockfile v1", "# converted from a Yarn 2+ lockfile for the demo build", ""];
  for (const block of blocks) {
    const lines = block.split("\n");
    const head = lines[0];
    if (!head.endsWith(":") || head.startsWith("__metadata") || head.startsWith("#")) continue;
    const fields = {}, sections = { dependencies: {}, optionalDependencies: {} }, meta = {};
    let section = null;
    for (const line of lines.slice(1)) {
      const m2 = line.match(/^ {2}(\S[^:]*):\s*(.*)$/);
      const m4 = line.match(/^ {4}(\S.*?):\s*(.+)$/);
      const m6 = line.match(/^ {6}optional:\s*true$/);
      if (m2) {
        section = m2[2] === "" ? m2[1] : null;
        if (m2[2] !== "") fields[m2[1]] = unq(m2[2]);
      } else if (m4 && sections[section]) {
        const r = depRange(m4[2]);
        if (r) sections[section][unq(m4[1])] = r;
      } else if (line.match(/^ {4}(\S.*?):\s*$/) && section === "dependenciesMeta") {
        meta.current = unq(line.trim().slice(0, -1));
      } else if (m6 && section === "dependenciesMeta" && meta.current) {
        (meta.optional ||= new Set()).add(meta.current);
      }
    }
    // Yarn 2+ can mark a plain dependency optional in dependenciesMeta; Yarn 1 wants it listed as optional
    for (const name of meta.optional || []) {
      if (name in sections.dependencies) {
        sections.optionalDependencies[name] = sections.dependencies[name];
        delete sections.dependencies[name];
      }
    }
    // Yarn 2+ adds node-gyp to every package with an install script; Yarn 1 doesn't need it locked
    if (sections.dependencies["node-gyp"] === "latest") delete sections.dependencies["node-gyp"];
    const res = fields.resolution && descriptor(unq(fields.resolution));
    if (!res || res.range.startsWith("npm:") || !fields.version) continue;
    const keys = unq(head.slice(0, -1)).split(/,\s*/).map((k) => descriptor(unq(k))).filter(Boolean);
    if (!keys.length) continue;
    const name = res.name;
    const base = name.includes("/") ? name.split("/")[1] : name;
    out.push(keys.map((k) => JSON.stringify(`${k.name}@${k.range}`)).join(", ") + ":");
    out.push(`  version "${res.range}"`);
    out.push(`  resolved "https://registry.yarnpkg.com/${name}/-/${base}-${res.range}.tgz"`);
    for (const [sec, deps] of Object.entries(sections)) {
      if (!Object.keys(deps).length) continue;
      out.push(`  ${sec}:`);
      for (const [d, r] of Object.entries(deps)) out.push(`    ${JSON.stringify(d)} ${JSON.stringify(r)}`);
    }
    out.push("");
  }
  return out.join("\n");
}

// ---- semver, enough for package.json ranges ------------------------------------------------

function parse(v) {
  const m = String(v).trim().replace(/^[v=]/, "").match(/^(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?(-[\w.]+)?$/i);
  if (!m) return null;
  const n = (s) => (s === undefined || s === "x" || s === "*" ? null : Number(s));
  return { major: Number(m[1]), minor: n(m[2]), patch: n(m[3]), pre: m[4] || null };
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const tuple = (p) => [p.major, p.minor ?? 0, p.patch ?? 0];

function comparator(c) {
  // a predicate over [major, minor, patch], or null when it can't be read
  const m = c.match(/^(\^|~|>=|<=|>|<|=)?\s*(.+)$/);
  if (!m) return null;
  const op = m[1] || "";
  if (/^(\*|x|latest)?$/i.test(m[2])) return () => true;
  const p = parse(m[2]);
  if (!p) return null;
  const lo = tuple(p);
  let hi;
  if (op === "^") {
    hi = p.major > 0 || p.minor === null ? [p.major + 1, 0, 0]
      : p.minor > 0 || p.patch === null ? [0, p.minor + 1, 0] : [0, 0, p.patch + 1];
  } else if (op === "~" || (op === "" && (p.minor === null || p.patch === null))) {
    hi = p.minor === null ? [p.major + 1, 0, 0] : [p.major, p.minor + 1, 0];
  }
  switch (op) {
    case ">=": return (v) => cmp(v, lo) >= 0;
    case ">": return (v) => cmp(v, lo) > 0;
    case "<=": return (v) => cmp(v, lo) <= 0;
    case "<": return (v) => cmp(v, lo) < 0;
  }
  if (hi) return (v) => cmp(v, lo) >= 0 && cmp(v, hi) < 0;
  return (v) => cmp(v, lo) === 0;
}

function matcher(range) {
  const alts = range.split("||").map((alt) => {
    const hy = alt.trim().match(/^(\S+)\s+-\s+(\S+)$/);
    const parts = hy ? [`>=${hy[1]}`, `<=${hy[2]}`] : alt.trim().split(/\s+/).filter(Boolean);
    const preds = parts.map(comparator);
    return preds.includes(null) ? null : (v) => preds.every((f) => f(v));
  });
  return alts.includes(null) ? null : (v) => alts.some((f) => f(v));
}

// ---- pinning -------------------------------------------------------------------------------

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { accept: "application/json" } }, (r) => {
      if (r.statusCode !== 200) { r.resume(); return reject(new Error(`${r.statusCode} ${url}`)); }
      let body = "";
      r.setEncoding("utf8");
      r.on("data", (c) => (body += c));
      r.on("end", () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}

function lockKeys(text) {
  const keys = new Set();
  for (const line of text.split("\n")) {
    if (!line || line.startsWith(" ") || line.startsWith("#") || !line.endsWith(":")) continue;
    for (const k of line.slice(0, -1).split(/,\s*/)) keys.add(unq(k));
  }
  return keys;
}

async function main() {
  if (!fs.existsSync(pkgPath)) return;
  let lock = fs.existsSync(lockPath) ? fs.readFileSync(lockPath, "utf8") : "";
  if (lock.includes("__metadata:")) {
    lock = berryToV1(lock);
    fs.writeFileSync(lockPath, lock);
    console.log(`lockfix: ${dir}/yarn.lock converted from Yarn 2+ (${lockKeys(lock).size} entries)`);
  }
  if (!date || Number.isNaN(cutoff)) return;
  const keys = lockKeys(lock);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  let changed = false;
  for (const section of ["dependencies", "devDependencies"]) {
    for (const [name, range] of Object.entries(pkg[section] || {})) {
      if (keys.has(`${name}@${range}`) || /^[a-z]+:|\//i.test(range)) continue;   // locked, or not a registry range
      const ok = matcher(range);
      if (!ok) { console.log(`lockfix: ${name}@${range} left alone (range not understood)`); continue; }
      let meta;
      try {
        meta = await get(`https://registry.npmjs.org/${name.replace("/", "%2F")}`);
      } catch (e) {
        console.log(`lockfix: ${name}@${range} left alone (${e.message})`);
        continue;
      }
      const best = Object.keys(meta.versions || {})
        .map((v) => [v, parse(v)])
        .filter(([v, p]) => p && !p.pre && p.minor !== null && p.patch !== null
          && meta.time && new Date(meta.time[v]).getTime() <= cutoff && ok(tuple(p)))
        .sort((a, b) => cmp(tuple(b[1]), tuple(a[1])))[0];
      if (!best) { console.log(`lockfix: ${name}@${range} left alone (nothing published by ${date})`); continue; }
      pkg[section][name] = best[0];
      changed = true;
      console.log(`lockfix: ${name}@${range} -> ${best[0]} (newest by ${date})`);
    }
  }
  if (changed) fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

main().catch((e) => { console.log(`lockfix: skipped (${e.message})`); });
