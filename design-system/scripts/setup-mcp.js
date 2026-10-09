#!/usr/bin/env node
/**
 * Zen 2.0 Design System - MCP Discovery, Diagnosis & Auto-Setup
 * 
 * Automatically detects whether Apple HIG and Playwright MCP servers are:
 * 1. Available in PATH / global npm / npx cache.
 * 2. Configured in project (.mcp.json, .cursor/mcp.json).
 * 3. Configured in agent environments (Antigravity, Claude Code, Cursor, Windsurf).
 * 
 * If missing, automatically generates the necessary configuration files.
 * 
 * Usage:
 *   node setup-mcp.js [--write]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

console.log('\n🍏 Zen Design System — MCP Discovery & Environment Setup\n');

const isWriteMode = process.argv.includes('--write') || process.argv.includes('-w') || true;

// Helper to check command availability
function isCommandAvailable(cmd) {
  try {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows ? `where ${cmd}` : `which ${cmd}`;
    const result = execSync(checkCmd, { stdio: 'pipe' }).toString().trim();
    return result.length > 0 ? result.split('\n')[0] : null;
  } catch {
    return null;
  }
}

// 1. Check local binary / npx execution
console.log('--- 1. Checking Binary & Execution Environment ---');
const globalBin = isCommandAvailable('apple-hig-mcp');
if (globalBin) {
  console.log(`  ✅ apple-hig-mcp found in PATH: ${globalBin}`);
} else {
  console.log('  ℹ️  apple-hig-mcp not in PATH. Will use dynamic fallback: npx -y apple-hig-mcp');
}

const npxBin = isCommandAvailable('npx');
if (npxBin) {
  console.log(`  ✅ npx available: ${npxBin}`);
} else {
  console.warn('  ⚠️  npx not found! Please ensure Node.js (>=18) is installed.');
}

// 2. Resolve Recommended MCP Configuration
const mcpConfig = {
  mcpServers: {
    'apple-hig': {
      command: globalBin ? globalBin : 'npx',
      args: globalBin ? [] : ['-y', 'apple-hig-mcp'],
      description: 'Apple Human Interface Guidelines (HIG) intelligence for component specs, design tokens, materials, and accessibility.'
    },
    'playwright': {
      command: 'npx',
      args: ['-y', '@playwright/mcp@latest'],
      description: 'Browser automation for testing responsive viewports (375px/390px), horizontal overflow, contrast, and theme switching.'
    }
  }
};

// 3. Inspect and configure project-level files
console.log('\n--- 2. Project-Level Configuration Files ---');
const projectRoot = process.cwd();

// A. Root .mcp.json
const rootMcpPath = path.join(projectRoot, '.mcp.json');
const designMcpPath = path.join(projectRoot, 'design-system', 'mcp.json');

function writeJsonIfMissing(targetPath, data, label) {
  if (fs.existsSync(targetPath)) {
    console.log(`  ✅ Found existing ${label} at: ${path.relative(projectRoot, targetPath)}`);
    try {
      const existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      if (existing.mcpServers?.['apple-hig']) {
        console.log(`     ↳ "apple-hig" is already configured!`);
      } else {
        console.log(`     ↳ Merging "apple-hig" into existing configuration...`);
        existing.mcpServers = { ...(existing.mcpServers || {}), ...data.mcpServers };
        fs.writeFileSync(targetPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
        console.log(`     ✅ Updated ${label}`);
      }
    } catch {
      console.warn(`     ⚠️  Could not parse existing ${label}. Leaving untouched.`);
    }
  } else {
    console.log(`  📝 Generating new ${label} at: ${path.relative(projectRoot, targetPath)}`);
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`  ✅ Created ${label}`);
  }
}

// Write to root .mcp.json and .cursor/mcp.json
writeJsonIfMissing(rootMcpPath, mcpConfig, 'Root .mcp.json (Standard)');
writeJsonIfMissing(path.join(projectRoot, '.cursor', 'mcp.json'), mcpConfig, 'Cursor IDE (.cursor/mcp.json)');

// 4. Check Global Agent Environments
console.log('\n--- 3. Agent Environment Discovery ---');
const homeDir = os.homedir();

// Antigravity global config
const geminiMcpConfig = path.join(homeDir, '.gemini', 'config', 'mcp_config.json');
if (fs.existsSync(geminiMcpConfig)) {
  try {
    const geminiData = JSON.parse(fs.readFileSync(geminiMcpConfig, 'utf8'));
    if (geminiData.mcpServers?.['apple-hig']) {
      console.log('  ✅ Google Antigravity: "apple-hig" is registered globally in ~/.gemini/config/mcp_config.json');
    } else {
      console.log('  ℹ️  Google Antigravity: You can register globally by running:');
      console.log(`     agy mcp add apple-hig -- npx -y apple-hig-mcp`);
    }
  } catch {}
}

// Claude Desktop config
const claudeDesktopMac = path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
if (fs.existsSync(claudeDesktopMac)) {
  console.log('  ℹ️  Claude Desktop detected. To add apple-hig, add the servers from .mcp.json to:');
  console.log(`     ${claudeDesktopMac}`);
}

// 5. Quick Verification instructions
console.log('\n--- 4. How to Verify Connection ---');
console.log('  1. In Google Antigravity: Ask agent: "Query apple-hig get_component_spec for Button"');
console.log('  2. In Cursor: Check Cursor Settings -> Features -> MCP (apple-hig should show Green indicator)');
console.log('  3. In Claude Code CLI: Run: claude mcp add apple-hig npx -y apple-hig-mcp');
console.log('  4. In Terminal (Direct Test): Run: npx -y apple-hig-mcp\n');

console.log('🎉 Setup check complete! Your project is ready to use Apple HIG intelligence.\n');
