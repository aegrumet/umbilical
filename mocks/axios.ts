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

const basechapters = {
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
};

const badfeed = "This is not a valid RSS feed";

const badchapters = {
  bad: "these are not chapters",
};

// deno-lint-ignore no-explicit-any
const feeds: Map<string, string> = new Map<string, any>([
  ["basefeed", basefeed],
  ["badfeed", badfeed],
  ["basechapters", basechapters],
  ["badchapters", badchapters],
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
