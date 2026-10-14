const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// The web workspace hoists React 19 to the repository root. React Native 0.76
// must use the app's own React 18.3.1, including from shared @funberry/* packages
// and from react-native itself, so `react` always resolves as if imported here.
const upstream = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react" || moduleName.startsWith("react/")) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [__dirname] }),
    };
  }
  return upstream ? upstream(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
