import { Command } from "commander";
import { LinearClient } from "@linear/sdk";
import { config } from "dotenv";

config();

const client = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

const program = new Command();

program
  .version("0.0.1")
  .name("linear-cli")
  .description("A cli to interact with Linear")
  .option("-i, --issues", "List your issues");

program.parse();

const options = program.opts();

if (options.issues) {
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
