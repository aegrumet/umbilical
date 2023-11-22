import { mf } from "../dev_deps.ts";

const basefeed = `<?xml version="1.0" ?>
<rss version="2.0">
<channel>
  <title>Test RSS</title>
  <link>http://example.com/basefeed/</link>
  <description>A base case RSS feed</description>
  <image>
      <url>http://example.com/image.gif</url>
      <link>http://example.com/link</link>
  </image>
  <item>
      <title>Episode 1</title>
      <link>http://example.com/media/episodes/1/</link>
      <description>A description of the first episode.</description>
      <enclosure length="12345678" type="audio/mpeg" url="http://somefile.mp3" />
  </item>
</channel>
</rss>`;

const basechapters = JSON.stringify({
  version: "1.2.0",
  chapters: [
    {
      startTime: 1,
      title: "Chapter 1",
      img: "https://example.com/chapter1.jpg",
    },
    {
      startTime: 53,
      title: "Chapter 2",
      img: "https://example.com/chapter2.jpg",
    },
  ],
});

const badfeed = "This is not a valid RSS feed";

const badchapters = {
  bad: "these are not chapters",
};

const baseopml = `<?xml version="1.0"?>
<!-- example OPML file -->
<!-- source https://gist.github.com/jamesstout/a4050fdfda4f1fad5d5637ff35293549 -->
<opml version="1.0">
    <head>
        <title>Overcast Podcast Subscriptions</title>
    </head>
    <body>
        <outline type="rss" text="Richard Herring's Leicester Square Theatre Podcast"
            title="Richard Herring's Leicester Square Theatre Podcast"
            xmlUrl="http://feeds.feedburner.com/RichardHerringLSTPodcast"
            htmlUrl="https://www.comedy.co.uk/podcasts/richard_herring_lst_podcast/" />
        <outline type="rss" text="5by5 at the Movies" title="5by5 at the Movies"
            xmlUrl="http://feeds.5by5.tv/movies" htmlUrl="http://5by5.tv/movies" />
        <outline type="rss" text="TV Talk Machine" title="TV Talk Machine"
            xmlUrl="http://feeds.theincomparable.com/tvtm"
            htmlUrl="https://www.theincomparable.com/tvtm/" />
        <outline type="rss" text="A STORM OF SPOILERS - A Pop Culture Podcast"
            title="A STORM OF SPOILERS - A Pop Culture Podcast"
            xmlUrl="http://feeds.feedburner.com/AStormOfSpoilers"
            htmlUrl="http://stormofspoilers.com/" />
        <outline type="rss" text="Reconcilable Differences" title="Reconcilable Differences"
            xmlUrl="https://www.relay.fm/rd/feed" htmlUrl="https://www.relay.fm/rd" />
        <outline type="rss" text="Query" title="Query" xmlUrl="https://www.relay.fm/query/feed"
            htmlUrl="https://www.relay.fm/query" />
        <outline type="rss" text="Omnibus" title="Omnibus"
            xmlUrl="https://feeds.megaphone.fm/omnibus" htmlUrl="https://www.omnibusproject.com/" />
        <outline type="rss" text="Techmeme Ride Home" title="Techmeme Ride Home"
            xmlUrl="http://feeds.feedburner.com/TechmemeRideHome"
            htmlUrl="https://www.techmeme.com/" />
        <outline type="rss" text="Stuff You Should Know" title="Stuff You Should Know"
            xmlUrl="https://feeds.megaphone.fm/stuffyoushouldknow"
            htmlUrl="https://www.howstuffworks.com/" />
        <outline type="rss" text="Following The Leftovers (Ad-Free)"
            title="Following The Leftovers (Ad-Free)"
            xmlUrl="http://username:password@baldmove.com/feed/ad-free-the-leftovers/"
            htmlUrl="http://baldmove.com/category/the-leftovers/" />
    </body>
</opml>`;

// deno-lint-ignore no-explicit-any
export const feeds: Map<string, string> = new Map<string, any>([
  ["basefeed", basefeed],
  ["badfeed", badfeed],
  ["basechapters", basechapters],
  ["badchapters", badchapters],
  ["baseopml", baseopml],
]);

// Assume mf.install() has already been called
const installFeedsMock = () => {
  mf.mock(`GET@/:name`, (_req, params) => {
    const name = params?.name ?? "";
    const feed = feeds.get(name);
    if (feed === undefined) {
      return new Response("", {
        status: 404,
      });
    }

    return new Response(feed, {
      status: 200,
    });
  });
};

const uninstallFeedsMock = () => {
  mf.remove(`GET@/:name`);
};

export { installFeedsMock, uninstallFeedsMock };
export default feeds;
