# linear-cli
### A command line interface to interact with Linear

To run the command line, you need a linear api key.
Store it as an env variable: `LINEAR_API_KEY`

The functionality now is *extremely* simple, and although
it will hopefully expand, it is built around my basic needs
to read and edit my own issues in Linear without having
to navigate to my browser.

You will have to build the app and then run `node dist/index.js`
with one of the current commands:
```
Commands:
  list            List your current issues
  read            read the contents of an issue
  edit            Edit an issue
```


