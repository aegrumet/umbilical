import file from "../version-info.json" with { type: "json" };
const semver: string = file.semver.version;

export const umbilicalUserAgent = `Umbilical/${semver}`;

export default umbilicalUserAgent;
