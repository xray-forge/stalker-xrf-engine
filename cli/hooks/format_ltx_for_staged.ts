import { formatLtx } from "#/format/format_ltx";

/**
 * Run the project LTX formatter from lint-staged.
 */
async function run(): Promise<void> {
  await formatLtx();
}

run().catch((error: unknown): void => {
  console.error(error);
  process.exitCode = 1;
});
