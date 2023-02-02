import { Command } from "commander";
import { LinearClient } from "@linear/sdk";
import { config } from "dotenv";
import inquirer from "inquirer";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { spawn } from "child_process";
import fs from "fs";

config();

marked.setOptions({
  renderer: new TerminalRenderer(),
});

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

program
  .command("edit")
  .description("Edit an issue")
  .action(() => editIssue());

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
        name: "currentIssues",
        message: "Choose an issue to read",
        choices: choices,
      },
    ])
    .then((answers) => {
      const issue = myIssues.nodes.find(
        (issue) => issue.title === answers.currentIssues
      );
      console.log(marked(issue.description));
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.warn("Your console environment is not supported");
      } else {
        console.warn(error);
      }
    });
}

async function editIssue() {
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
        name: "currentIssues",
        message: "Choose an issue to read",
        choices: choices,
      },
    ])
    .then((answers) => {
      return myIssues.nodes.find(
        (issue) => issue.title === answers.currentIssues
      );
    })
    .then((issue) => {
      inquirer
        .prompt([
          {
            type: "editor",
            name: "description",
            message: "New Description",
            default: issue.description,
            postfix: "md",
          },
        ])
        .then((answers) => {
          console.log("Issue Updated\n");
          console.log(marked(answers.description));
        });
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.warn("Your console environment is not supported");
      } else {
        console.warn(error);
      }
    });
}
