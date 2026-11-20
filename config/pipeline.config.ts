/** All environment-specific values live here, so specs and page objects stay generic. */
export type DestinationKey = 'snowflake' | 'bigquery' | 'databricks';

export interface Destination {
  key: DestinationKey;
  /** App name as shown in the destination app picker */
  appLabel: string;
  /** Existing connection name in Workato */
  connection: string;
}

const APP_LABELS: Record<DestinationKey, string> = {
  snowflake: 'Snowflake',
  bigquery: 'Google BigQuery',
  databricks: 'Databricks',
};

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} (see .env.example)`);
  return v;
}

export const cfg = {
  uiUrl: process.env.WORKATO_UI_URL ?? 'https://app.workato.com',
  folderId: () => need('WORKATO_FOLDER_ID'),
  source: {
    connection: () => need('SOURCE_CONNECTION'),
    search: () => need('SOURCE_SEARCH'),
    object: () => need('SOURCE_OBJECT'),
  },
  everyMinutes: Number(process.env.PIPELINE_EVERY_MINUTES ?? 15),
  loadTimeoutMs: Number(process.env.LOAD_TIMEOUT_MINUTES ?? 20) * 60_000,
  keepPipeline: process.env.KEEP_PIPELINE === 'true',
};

export function destinations(): Destination[] {
  const keys = (process.env.DESTINATIONS ?? 'snowflake')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as DestinationKey[];
  return keys.map((key) => {
    if (!APP_LABELS[key]) throw new Error(`Unknown destination "${key}"`);
    return { key, appLabel: APP_LABELS[key], connection: need(`${key.toUpperCase()}_CONNECTION`) };
  });
}
