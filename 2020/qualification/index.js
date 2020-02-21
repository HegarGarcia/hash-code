const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { chunk } = require("lodash");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function main() {
  const pathToFile = process.argv[2];
  const filename = path.parse(pathToFile).name;

  const file = await readFile(pathToFile, { encoding: "utf8" });
  const { libraries, limitDays } = extractProblem(file);

  printProblem(libraries, limitDays);

  await writeFile(
    path.join(__dirname, "outputs", `${filename}.out`),
    output(solver(libraries, limitDays))
  );
}

function extractProblem(file) {
  const [general, rawBooks, ...librariesDetails] = file.split("\n");

  const [, , limitDays] = general.split(" ").map(Number);

  const books = rawBooks.split(" ").map((score, id) => new Book(id, +score));
  const libraries = [];

  for (const [details, ownBook] of chunk(librariesDetails, 2)) {
    if (!details || !ownBook) {
      continue;
    }

    const [, signUp, booksPerDay] = details.split(" ").map(Number);
    const booksIds = ownBook.split(" ").map(Number);

    libraries.push(
      new Library(
        libraries.length,
        signUp,
        booksPerDay,
        books.filter(book => booksIds.includes(book.id))
      )
    );
  }

  return { limitDays, books, libraries };
}

function printProblem(libraries, limitDays) {
  console.log({ limitDays });
  console.log({ libraries: libraries.length });
}

function solver(libraries) {
  let sortedLibs = libraries.sort(byHighestThroughput);
  const bannedBooks = new Set();
  const libs = [];

  while (sortedLibs.length) {
    const lib = sortedLibs.shift();

    lib.books = filterBanned(bannedBooks, lib.books);
    libs.push(lib);

    sortedLibs = sortedLibs
      .map(lib2 => {
        lib2.newBooks = filterBannedWithoutAdding(bannedBooks, lib2.books);
        return lib2;
      })
      .sort(byHighestThroughput);
  }

  return libs.filter(lib => lib.size);
}

function output(libraries) {
  return `${libraries.length}\n${libraries
    .map(
      lib =>
        `${lib.id} ${lib.books.length}\n${lib.books
          .map(book => book.id)
          .join(" ")}`
    )
    .join("\n")}`;
}

class Book {
  constructor(id, score) {
    this.id = id;
    this.score = score;
  }
}

class Library {
  constructor(id, signUp, booksPerDay, books) {
    this.id = id;
    this.signUp = signUp;
    this.booksPerDay = booksPerDay;
    this.books = books.sort(byHigherScore);
    this.score = sumScore(books);
  }

  set newBooks(books) {
    this.books = books.sort(byHigherScore);
    this.score = sumScore(books);
  }

  get throughput() {
    return this.score / this.signUp;
  }

  get size() {
    return this.books.length;
  }
}

function filterBanned(bannedList, books) {
  return books.filter(book => {
    if (bannedList.has(book.id)) {
      return false;
    } else {
      bannedList.add(book.id);
      return true;
    }
  });
}

function filterBannedWithoutAdding(bannedList, books) {
  return books.filter(book => {
    if (bannedList.has(book.id)) {
      return false;
    } else {
      return true;
    }
  });
}

function sumScore(books) {
  return books.reduce((acc, book) => acc + book.score, 0);
}

function byHighestThroughput(a, b) {
  return b.throughput - a.throughput;
}

function byHigherScore(a, b) {
  return b.score - a.score;
}

main();
