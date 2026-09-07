module.exports = function (eleventyConfig) {
  const pathPrefix = process.env.ELEVENTY_PATH_PREFIX || "/";

  eleventyConfig.addPassthroughCopy({ img: "img" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "video/threshold-case-study.mp4": "video/threshold-case-study.mp4" });
  eleventyConfig.addPassthroughCopy("legacy.html");
  eleventyConfig.addPassthroughCopy("mindfizz_contact.php");

  [
    "android-icon-192x192.png",
    "apple-icon-114x114.png",
    "apple-icon-120x120.png",
    "apple-icon-144x144.png",
    "apple-icon-152x152.png",
    "apple-icon-180x180.png",
    "apple-icon-57x57.png",
    "apple-icon-60x60.png",
    "apple-icon-72x72.png",
    "apple-icon-76x76.png",
    "browserconfig.xml",
    "favicon-16x16.png",
    "favicon-256x256.png",
    "favicon-32x32.png",
    "favicon-96x96.png",
    "favicon.ico",
    "manifest.json"
  ].forEach((file) => eleventyConfig.addPassthroughCopy(file));

  eleventyConfig.addFilter("readableDate", (date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(date))
  );

  eleventyConfig.addFilter("htmlDateString", (date) =>
    new Date(date).toISOString().slice(0, 10)
  );

  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  // Keep root-relative authoring convenient while supporting GitHub project pages.
  eleventyConfig.addTransform("path-prefix", function (content) {
    if (this.page.outputPath?.endsWith(".html") && pathPrefix !== "/") {
      const prefix = `/${pathPrefix.replace(/^\/+|\/+$/g, "")}/`;
      return content.replace(/\b(href|src|poster|action)="\/(?!\/)/g, `$1="${prefix}`);
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    pathPrefix,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
