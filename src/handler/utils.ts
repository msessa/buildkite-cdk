export function assertParamIsDefined<T>(paramName: string, val: T): T {
  if (val === undefined || val === null) {
    throw new Error(`expected parameter '${paramName}' to be defined, but received ${val}`);
  }
  return val;
}

export function assertEnvVarIsDefined(envVarName: string): string {
  const val = process.env[envVarName];
  if (val === undefined || val === null) {
    throw new Error(`expected env var '${envVarName}' to be defined, but received ${val}`);
  }
  return val;
}
