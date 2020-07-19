import axios from "axios";
import cheerio from "cheerio";
import { uploadFile, getFile, getTranslation } from "../utils.mjs";

export const parse = async (req, res) => {
  try {
    let url;
    if (req.path === "/parse") {
      url = req.query.url;
    } else {
      url = req.params.url;
    }
    console.log(url);
    if (!url) {
      return res.status(400).send({ error: "url missing" });
    }
    const { data } = await axios.get(
      url.startsWith("http") ? url : `http://${url}`
    );
    const $ = cheerio.load(data);
    let favicon = $('link[rel="icon"]');
    if (!favicon.length) {
      favicon = $('link[rel="shortcut icon"]');
      if (!favicon.length) {
        favicon = null;
      }
    }
    if (favicon) {
      favicon = favicon.attr("href");
    }

    let title = $("title").text();
    if (!title) {
      title = $('meta[property="og:title"]').attr("content");
    }
    if (!title) {
      title = $('meta[name="twitter:title"]').attr("content");
    }

    let image = $('meta[property="og:image"]').attr("content");
    if (!image) {
      image = $('meta[property="twitter:image"]').attr("content");
    }

    let description = $('meta[name="description"]').attr("content");
    if (!description) {
      description = $('meta[property="og:description"]').attr("content");
    }
    if (!description) {
      description = $('meta[name="twitter:description"]').attr("content");
    }

    return res.status(200).send({
      favicon,
      title: typeof title === "string" ? title.trim() : title,
      "large-image": image,
      snippet:
        typeof description === "string" ? description.trim() : description,
    });
  } catch (e) {
    console.error(e);
    return res.status(400).send({
      error:
        "Something went wrong. Check your url - Remember you need to pass your url without schema or URIEncoded. (encodeURIComponent)  ",
    });
  }
};

export const translate = async (req, res) => {
  try {
    let url;
    if (req.path === "/translate") {
      url = req.query.url;
    } else {
      url = req.params.url;
    }
    if (!url) {
      return res.status(400).send({ error: "url missing" });
    }
    const { data } = await axios.get(
      url.startsWith("http") ? url : `http://${url}`
    );
    const $ = cheerio.load(data);
    const translated = await getTranslation(
      $.html(),
      $("body").html(),
      req.query.lang || null
    );
    res.send(translated.translations[0].translatedText);
  } catch (e) {
    console.error(e);
    if (e.code === 3) {
      return res.status(400).send({
        error:
          "The page has too much content. Lets not waste the quota and test with a smaller  pagge please :)",
      });
    }
    return res.status(400).send({
      error:
        "Something went wrong. Check your url - Remember you need to pass your url without schema or URIEncoded. (encodeURIComponent)  You can also  use query param 'url' to GET /translate",
    });
  }
};

export const upload = async (req, res, next) => {
  try {
    const myFile = req.file;
    const fileId = await uploadFile(myFile);
    res.status(200).json({
      message: "File upload",
      id: fileId,
    });
  } catch (error) {
    next(error);
  }
};

export const download = async (req, res) => {
  try {
    const file = await getFile(req.params.identifier);
    res.header({
      "Content-Type": file.metadata[0].contentType,
    });
    res.send(file.file);
  } catch (e) {
    console.error(e);
    res.status(e.code || 404).send({
      error: "Not found",
    });
  }
};
