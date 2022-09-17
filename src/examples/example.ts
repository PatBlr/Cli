import { Cli } from "../cli";

async function test() {
  const cli = new Cli();

  /** Write */
  cli.write("This is a colored text! ", "cyan");
  cli.writeln("(This one ends with a newline!)", "yellow");
  cli.write("See?");
  cli.writeln();

  /** Ask */
  const response = await cli.ask("What is your favorite fruit? ");
  console.log(response);

  /** Choose */
  cli.writeln("What is your favorite fruit? ");
  const options = ["Apple", "Banana", "Orange", "Strawberry", "Raspberry"];
  const choice_idx = await cli.choose(options);
  console.log(options[choice_idx]);

  /** Select */
  cli.write("What kind of fruits do you like? ");
  cli.writeln("(Everyone likes apples)", "grey");
  const selected = await cli.select([
    ["Apple", true],
    ["Banana", false],
    ["Orange", false],
    ["Strawberry", false],
    ["Raspberry", false],
  ]);
  console.log(selected);

  /** End */
  cli.end();
}
test();
