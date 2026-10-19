export function withMenuDescriptionGeneration({ distinctId }, callback) {
  return callback();
}

export function getBedrockRuntime() {
  return import("@aws-sdk/client-bedrock-runtime");
}
