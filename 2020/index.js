const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function main() {
  const pathToFile = process.argv[2];
  const filename = path.parse(pathToFile).name;

  const file = await readFile(pathToFile, { encoding: "utf8" });
  const { max, sizes } = extractProblem(file);
  const { result, total } = findMaxSum({ max, sizes });

  printScore({ max, total });

  const pizzasToOrder = result.map(byIndex).filter(byNotNull);
  const resultText = `${pizzasToOrder.length}\n${pizzasToOrder.join(" ")}`;

  await writeFile(
    path.join(__dirname, "outputs", `${filename}.out`),
    resultText
  );
}

function extractProblem(file) {
  const [details, rawSizes] = file.split("\n");
  const max = +details.split(" ")[0];
  const sizes = rawSizes.split(" ").map(Number);

  return { max, sizes };
}

function findMaxSum({ sizes, max }) {
  const result = [...sizes];
  let total = sum(sizes);
  let diff = Math.abs(max - total);

  while (total > max) {
    const value = getClosest(result.filter(byNotNull), diff);
    const index = result.indexOf(value);

    total -= value;

    result[index] = null;
    diff = Math.abs(max - total);
  }

  return { result, total };
}

function getClosest(numbers, target) {
  const max = Math.max(...numbers);
  const min = Math.min(...numbers);

  if (target > max) {
    return max;
  } else if (target < min) {
    return min;
  } else {
    return numbers.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
  }
}

function sum(numbers) {
  return numbers.reduce((acc, number) => acc + number);
}

function byIndex(val, i) {
  return val && i;
}

function byNotNull(value) {
  return value !== null;
}

function printScore({ max, total }) {
  console.log(`Max: ${max}
Total: ${total}
Diff: ${max - total}  
Score: ${total}`);
}

main();
