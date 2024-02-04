import { gitDescribeSync, GitInfo } from "../server_deps.ts";

const gitInfo: GitInfo = gitDescribeSync();
const versionInfoJson: string = JSON.stringify(gitInfo, null, 2);
const encoder = new TextEncoder();

Deno.writeFileSync("version-info.json", encoder.encode(versionInfoJson));
