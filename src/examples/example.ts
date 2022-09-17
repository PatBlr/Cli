import { Cli } from "../cli";

async function test() {
  const cli = new Cli();
  // const answer_ask: string = await cli.ask("This is a question");
  // console.log("answer:", answer_ask);
  cli.write("What kinds of fruits do you like? ");
  cli.writeln(
    "([arrow-keys]: navigate, [space]: select, [return]: submit)",
    "grey"
  );
  // let opts = ["Opt1", "Opt2", "Opt3"];
  // let answer = await cli.askOpts(opts);
  // console.log("You chose:", opts[answer]);
  let x = await cli.selectOpts([
    ["Apple", false],
    ["Banana", false],
    ["Orange", false],
    ["Strawberry", false],
    ["Raspberry", false],
  ]);
  console.log(x);
  cli.end();
}
test();
