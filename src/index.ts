import { Command } from "commander";
import { LinearClient } from "@linear/sdk";
import { config } from "dotenv";
import inquirer from "inquirer";

config();

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

const program = new Command();

program
  .version("0.0.1")
  .name("linear-cli")
  .description("A cli to interact with Linear");

program
  .command("list")
  .description("List your current issues")
  .action(() => listIssues());

program
  .command("read")
  .description("read the contents of an issue")
  .action(() => readIssue());

program.parse();

const options = program.opts();

if (options.list) {
  listIssues();
}

async function listIssues() {
  const me = await client.viewer;
  const myIssues = await me.assignedIssues();

  if (myIssues.nodes.length) {
    myIssues.nodes
      .filter((issue) => !issue.completedAt)
      .map((issue) => console.dir(issue.title));
  } else {
    console.log(`${me.displayName} has no issues`);
  }
}

async function readIssue() {
  const me = await client.viewer;
  const myIssues = await me.assignedIssues();
  if (myIssues.nodes.length === 0) {
    console.log(`${me.displayName} has no issues`);
    return;
  }
  const choices = myIssues.nodes
    .filter((issue) => !issue.completedAt)
    .map((issue) => issue.title);

  inquirer
    .prompt([
      {
        type: "list",
        name: "Current Issues",
        message: "Choose an issue to read",
        choices: choices,
      },
    ])
    .then((issue) => {
      console.log(JSON.stringify(issue, null, 2));
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.warn("Your console environment is not supported");
      } else {
        console.warn(error);
      }
    });
}
