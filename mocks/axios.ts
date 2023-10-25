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

const badfeed = "This is not a valid RSS feed";

const feeds: Map<string, string> = new Map<string, string>([
  ["basefeed", basefeed],
  ["badfeed", badfeed],
]);

const axios = (options: { url: string; method: string }) => {
  let urlObj: URL;

  try {
    urlObj = new URL(options.url);
  } catch (_) {
    throw new Error("Invalid URL");
  }

  const feedKey: string = urlObj.pathname.split("/").pop() as string;

  if (feeds.has(feedKey) === false) {
    throw new Error("Invalid URL");
  }

  return new Promise((resolve, _) => {
    resolve({
      data: feeds.get(feedKey),
    });
  });
};

export default axios;
