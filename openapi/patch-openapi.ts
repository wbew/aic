type JsonObject = Record<string, unknown>;

const stripJsoncComments = (text: string): string =>
  text.replace(
    /"(?:[^"\\]|\\.)*"|\/\/.*$|\/\*[\s\S]*?\*\//gm,
    (match) => (match.startsWith("/") ? "" : match),
  );

const mergeDeep = (target: JsonObject, source: JsonObject): JsonObject => {
  const output: JsonObject = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = output[key];
    const sourceIsObject =
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue);
    const targetIsObject =
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue);

    if (sourceIsObject && targetIsObject) {
      output[key] = mergeDeep(targetValue as JsonObject, sourceValue as JsonObject);
      continue;
    }

    output[key] = sourceValue;
  }

  return output;
};

const [
  inputPath = "./openapi/aic.original.openapi.jsonc",
  outputPath = "./openapi/aic.patched.openapi.jsonc",
] = process.argv.slice(2);

const run = async () => {
  const [rawSpecText, patchText] = await Promise.all([
    Bun.file(inputPath).text(),
    Bun.file("./openapi/patch.jsonc").text(),
  ]);

  const spec = JSON.parse(stripJsoncComments(rawSpecText)) as JsonObject;
  const patch = JSON.parse(stripJsoncComments(patchText)) as JsonObject;

  const patched = mergeDeep(spec, patch);

  if ("swagger" in patched) {
    const { openapi: _, swagger, ...rest } = patched;
    Object.keys(patched).forEach((k) => delete patched[k]);
    Object.assign(patched, { swagger, ...rest });
  }

  const outputDir = outputPath.includes("/")
    ? outputPath.slice(0, outputPath.lastIndexOf("/"))
    : ".";
  await Bun.$`mkdir -p ${outputDir}`.quiet();
  await Bun.write(outputPath, `${JSON.stringify(patched, null, 2)}\n`);

  console.log(`Patched OpenAPI written to ${outputPath}`);
};

await run();
