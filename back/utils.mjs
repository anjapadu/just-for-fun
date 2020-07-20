import Translate from "@google-cloud/translate";
import Cloud from "@google-cloud/storage";
import crypto from "crypto";
import dotenv from "dotenv";
const { Storage } = Cloud;
const storage = new Storage();
const bucket = storage.bucket("just-for-fun-file-storage");
if (process.env.NODE_ENV === "develop") {
  dotenv.config();
}

const translate = new Translate.v3.TranslationServiceClient({
  projectId: "justforfun-283718",
});
export const getUser = (username, password) => {
  if (username === "alice" && password === "monkey1") {
    return {
      usename: "alice",
      id: 1,
    };
  }
  return false;
};

export const getTranslation = async (body, language = null) => {
  const request = {
    parent: "projects/justforfun-283718/locations/global",
    contents: [body],
    targetLanguageCode: language || "ja",
  };
  const [response] = await translate.translateText({
    mimeType: "text/html",
    ...request,
  });
  return response;
};

export const uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    const { originalname, buffer, mimetype } = file;

    var id = crypto.randomBytes(16).toString("hex");
    const blob = bucket.file(id);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: mimetype,
      },
    });
    blobStream
      .on("finish", () => {
        resolve(id);
      })
      .on("error", () => {
        reject(`Something went wrong while uploading`);
      })
      .end(buffer);
  });
};

export const getFile = (fileIdentifier) => {
  return new Promise(async (resolve, reject) => {
    const file = bucket.file(fileIdentifier);
    let metadata;
    try {
      metadata = await file.getMetadata();
    } catch (e) {
      reject(e);
    }
    file
      .download()
      .then(function (data) {
        resolve({ file: data[0], metadata });
      })
      .catch((e) => {
        console.log({ e });
        reject(e);
      });
  });
};
