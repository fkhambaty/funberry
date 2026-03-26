const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Monorepo root (two levels up from apps/mobile)
const monorepoRoot = path.resolve(__dirname, "../..");

const config = getDefaultConfig(__dirname);

// Watch the entire monorepo so Metro can resolve @funberry/* packages
config.watchFolders = [monorepoRoot];

// Tell Metro where to look for node_modules (mobile first, then monorepo root)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Disable symlinks resolution issues in monorepos
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
