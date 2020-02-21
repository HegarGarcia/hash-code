const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

(async () => {
  const pathToFile = process.argv[2];
  const filename = path.parse(pathToFile).name;
  const file = await readFile(pathToFile, { encoding: "utf8" });
  const { photosH, photosV } = extract(file);

  const photos = [...photosH, ...joinVerts(photosV)];
})();

function extract(file) {
  const [, ...photos] = file.split("\n");
  const photosV = [];
  const photosH = [];

  for (const id in photos) {
    const rawPhoto = photos[id];
    const [orientation, tagCount, ...tags] = rawPhoto.split(" ");
    const photo = new Photo({ orientation, tags, id, tagCount: +tagCount });

    switch (orientation) {
      case "H":
        photosH.push(photo);
        break;
      case "V":
        photosV.push(photo);
        break;
    }
  }

  return { photosH, photosV };
}

function joinVerts(photos) {
  return photos;
}

class Photo {
  constructor({ orientation, tags, id, tagCount }) {
    this.orientation = orientation;
    this.tags = new Set(tags);
    this.id = id;
    this.tagCount = tagCount;
  }
}
