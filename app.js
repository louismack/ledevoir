import axios from "axios";
import jsdom from "jsdom";
import http from "http";
const BASE_DOMAIN = "https://www.ledevoir.com";

const requestListener = async function (req, res) {
  const url = new URL(req.url, "https://mydomain.com/");
  const start = url.searchParams.get("start") ?? 1;
  const end = url.searchParams.get("end") ?? 20;
  const response = await axios.get(BASE_DOMAIN);
  const htmlDoc = new jsdom.JSDOM(response.data, "text/html");
  const newHtmlDoc = new jsdom.JSDOM(response.data, "text/html");
  newHtmlDoc.window.document
    .querySelector("head")
    .insertAdjacentHTML("afterbegin", `<base href="${BASE_DOMAIN + "/"}">`);
  while (newHtmlDoc.window.document.body.firstChild) {
    newHtmlDoc.window.document.body.firstChild.remove();
  }
  const links = htmlDoc.window.document.querySelectorAll(".card-click");
  for (let i = start * 1 - 1; i < links.length && i < end * 1; i++) {
    const link = links[i];
    let url = link.href.includes(BASE_DOMAIN)
      ? link.href
      : BASE_DOMAIN + link.href;
    const res = await axios.get(url);
    const doc = new jsdom.JSDOM(
      "<div style='width: 100vw;'>" + res.data + "</div>",
      "text/html"
    );
    //   link.parent.parent.parent.insertAdjacentElement(
    //     "afterend",
    //     doc.window.document.body
    //   );
    doc.window.document.querySelector("header").remove();
    doc.window.document.querySelector("footer").remove();
    if (doc.window.document.querySelector("video"))
      doc.window.document.querySelector("video").remove();
    newHtmlDoc.window.document.body.insertBefore(
      doc.window.document.body,
      null
    );
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(newHtmlDoc.serialize());
};

const server = http.createServer(requestListener);
server.listen(8080);
server.on("listening", () => console.log("listening"));
