import { load } from "cheerio";

const BLOCK_SELECTOR = "p, h1, h2, h3, h4, h5, h6, div, section, article, header, footer, blockquote, pre, li, tr";

export function toPlainText(html: string): string {
  const $ = load(html, null, false);

  $("script, style, noscript, iframe, video, audio, svg, canvas, form, button, input, nav, aside").remove();

  $("img, picture, figure").replaceWith("【图片】");

  $("br").replaceWith("\n");

  $(BLOCK_SELECTOR).each((_, el) => {
    $(el).append("\n");
  });
  $("li").each((_, el) => {
    $(el).prepend("\n• ");
  });

  let text = $.root().text();
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/ *\n */g, "\n");
  text = text.replace(/\n{2,}/g, "\n");
  return text.trim();
}
