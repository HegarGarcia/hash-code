const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function main() {
  const pathToFile = process.argv[2];
  const pathValue = path.parse(pathToFile);

  const file = await readFile(pathToFile, { encoding: "utf8" });
  const { max, sizes } = extract(file);

  problemInfo({ max, sizes });

  const { currentTotal, result } = findMaxSum({ sizes, max });

  console.log({ currentTotal, max, diff: max - currentTotal });

  const pizzasToOrder = result
    .map((val, i) => (val ? i : null))
    .filter(Boolean);

  const resultText = `${pizzasToOrder.length}\n${pizzasToOrder.join(" ")}`;
  writeFile(
    path.join(__dirname, "outputs", `${pathValue.name}.out`),
    resultText
  );
}

function extract(file) {
  const [details, rawSizes] = file.split("\n");
  const [max] = details.split(" ");
  const sizes = rawSizes.split(" ").map(Number);

  return { max: +max, sizes };
}

function findMaxSum({ sizes, max }) {
  const result = [...sizes];
  let total = sum(sizes);

  let diff = Math.abs(max - total);

  let minNum = Math.min(...sizes);
  let maxNum = Math.max(...sizes);

  while (total > max) {
    const index = result.indexOf(diff);
    if (index === -1) {
      if (diff < minNum) {
        diff++;
      } else if (diff > maxNum) {
        diff = maxNum;
      } else {
        diff--;
      }
    } else {
      total -= diff;
      result[index] = null;
      let tmp = result.filter(Boolean);

      minNum = Math.min(...tmp);
      maxNum = Math.max(...tmp);
      diff = Math.abs(max - total);
    }
  }

  return { result, currentTotal: total };
}

function problemInfo({ max, sizes }) {
  console.log({ max, sizes, amount: sizes.length });
}

function sum(numbers) {
  return numbers.reduce((acc, number) => acc + number, 0);
}

main();
