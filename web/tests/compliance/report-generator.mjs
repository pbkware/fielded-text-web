import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.error('Usage: node tests/compliance/report-generator.mjs <vitest-json-path> <report-markdown-path>');
}

function readJson(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(text);
}

function readTraceability(traceabilityPath) {
  const absolutePath = path.resolve(traceabilityPath);
  if (!fs.existsSync(absolutePath)) {
    return new Map();
  }

  const text = fs.readFileSync(absolutePath, 'utf8');
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) {
    return new Map();
  }

  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 2) {
      continue;
    }
    const requirementId = parts[0].trim();
    const clause = parts[1].trim();
    if (requirementId.length > 0) {
      map.set(requirementId, clause);
    }
  }

  return map;
}

function collectFromVitestJson(json) {
  if (!json || !Array.isArray(json.testResults)) {
    return undefined;
  }

  const out = [];
  for (const suite of json.testResults) {
    if (!suite || !Array.isArray(suite.assertionResults)) {
      continue;
    }

    for (const assertion of suite.assertionResults) {
      const hasName = typeof assertion.fullName === 'string' || typeof assertion.title === 'string';
      const hasStatus = typeof assertion.status === 'string';
      if (!hasName || !hasStatus) {
        continue;
      }

      out.push({
        name: assertion.fullName ?? assertion.title,
        status: assertion.status,
        duration: typeof assertion.duration === 'number' ? assertion.duration : undefined,
        failureMessages: Array.isArray(assertion.failureMessages) ? assertion.failureMessages : [],
      });
    }
  }

  return out;
}

function collectTestCases(value, out = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectTestCases(item, out);
    }
    return out;
  }

  if (value && typeof value === 'object') {
    const hasStatus = typeof value.status === 'string';
    const hasName = typeof value.fullName === 'string';

    if (hasStatus && hasName) {
      const name = value.fullName ?? value.name;
      out.push({
        name,
        status: value.status,
        duration: typeof value.duration === 'number' ? value.duration : undefined,
        failureMessages: Array.isArray(value.failureMessages) ? value.failureMessages : [],
      });
    }

    for (const key of Object.keys(value)) {
      collectTestCases(value[key], out);
    }
  }

  return out;
}

function normalizeStatus(status) {
  switch (status) {
    case 'pass':
    case 'passed':
      return 'pass';
    case 'fail':
    case 'failed':
      return 'fail';
    case 'skip':
    case 'skipped':
      return 'skip';
    case 'todo':
      return 'todo';
    default:
      return status;
  }
}

function requirementIdFromName(name) {
  const match = name.match(/\[(FT0\.9-[A-Z]+-\d{3})\]/);
  return match ? match[1] : 'UNMAPPED';
}

function clauseGroupFromClause(clause) {
  if (!clause || clause === 'UNMAPPED') {
    return 'UNMAPPED';
  }

  const firstClause = clause.split('|')[0].trim();
  const match = firstClause.match(/^(\d+)(?:\.(\d+))?/);
  if (!match) {
    return 'UNMAPPED';
  }

  if (match[2] !== undefined) {
    return `${match[1]}.${match[2]}`;
  }

  return match[1];
}

function severityForStatus(status) {
  if (status === 'fail') {
    return 'high';
  }
  if (status === 'todo') {
    return 'medium';
  }
  if (status === 'skip') {
    return 'low';
  }
  return 'none';
}

function generateReport(cases, inputPath, clauseByRequirement) {
  const normalized = cases.map((t) => ({ ...t, status: normalizeStatus(t.status) }));
  const passed = normalized.filter((t) => t.status === 'pass');
  const nonPass = normalized.filter((t) => t.status !== 'pass');
  const total = normalized.length;
  const denominator = total === 0 ? 1 : total;
  const compliancePercent = ((passed.length / denominator) * 100).toFixed(1);

  const grouped = new Map();
  const clauseGroups = new Map();

  for (const test of normalized) {
    const reqId = requirementIdFromName(test.name);
    const clause = clauseByRequirement.get(reqId) ?? 'UNMAPPED';
    const group = clauseGroupFromClause(clause);

    if (!clauseGroups.has(group)) {
      clauseGroups.set(group, { total: 0, pass: 0, nonPass: 0 });
    }

    const counters = clauseGroups.get(group);
    counters.total += 1;
    if (test.status === 'pass') {
      counters.pass += 1;
    } else {
      counters.nonPass += 1;
    }
  }

  for (const test of nonPass) {
    const reqId = requirementIdFromName(test.name);
    if (!grouped.has(reqId)) {
      grouped.set(reqId, []);
    }
    grouped.get(reqId).push(test);
  }

  const lines = [];
  lines.push('# FTStd0.9 Non-Compliance Report');
  lines.push('');
  lines.push(`Generated from: ${inputPath}`);
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total tests: ${total}`);
  lines.push(`- Passing: ${passed.length}`);
  lines.push(`- Non-pass (fail/todo/skip): ${nonPass.length}`);
  lines.push(`- Compliance percentage: ${compliancePercent}%`);
  lines.push('');

  lines.push('## Coverage By Clause Group');
  lines.push('');

  const orderedGroups = [...clauseGroups.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));

  for (const [group, counters] of orderedGroups) {
    const groupPercent = counters.total === 0 ? '0.0' : ((counters.pass / counters.total) * 100).toFixed(1);
    lines.push(`- ${group}: ${counters.pass}/${counters.total} pass (${groupPercent}%), ${counters.nonPass} non-pass`);
  }
  lines.push('');

  if (nonPass.length === 0) {
    lines.push('## Findings');
    lines.push('');
    lines.push('No non-compliance findings in this run.');
    lines.push('');
    return lines.join('\n');
  }

  lines.push('## Findings');
  lines.push('');

  for (const [reqId, tests] of grouped.entries()) {
    lines.push(`### ${reqId}`);
    lines.push('');
    for (const test of tests) {
      const severity = severityForStatus(test.status);
      lines.push(`- Status: ${test.status}`);
      lines.push(`- Severity: ${severity}`);
      lines.push(`- Test: ${test.name}`);
      if (test.failureMessages.length > 0) {
        lines.push(`- Observed behavior: ${test.failureMessages[0].replace(/\s+/g, ' ').slice(0, 300)}`);
      } else {
        lines.push('- Observed behavior: No failure message. Pending or skipped behavior.');
      }
      const clause = clauseByRequirement.get(reqId) ?? 'UNMAPPED';
      lines.push(`- FT clause: ${clause}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath || !outputPath) {
    usage();
    process.exit(1);
  }

  const absoluteInput = path.resolve(inputPath);
  const absoluteOutput = path.resolve(outputPath);
  const traceabilityPath = 'tests/compliance/traceability.csv';

  const json = readJson(absoluteInput);
  const clauseByRequirement = readTraceability(traceabilityPath);
  const cases = collectFromVitestJson(json) ?? collectTestCases(json);
  const report = generateReport(cases, inputPath, clauseByRequirement);

  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, report, 'utf8');

  console.log(`Wrote report to ${outputPath}`);
}

main();
