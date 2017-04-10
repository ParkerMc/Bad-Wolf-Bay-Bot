module.exports = {
  sendTo: "rizapheonyxx",
  preAdminRoles: ["kraken", "hydra heads", "spawn", "imps"],
  adminRoles: ["kraken", "hydra heads"],
  adminUsers: ["parkermc"],
  //botChannel: "298544719946842114",// test on my server
  botChannel: "299032114677022722",// bad wolf bay
  help: {
    main:`\`\`\`
An bot for RR use.

RR:
  accept    Accept the RR. (DM Only)
  add       Adds you to the RR list
  deny      Deny the RR and move to the end of the line.  (DM Only)
  done      Add your writing to the RR. (DM Only)
  remove    Removes you to the RR list
RR Admin:
  addA      Add user to list.
  list      List all of the users in the list.
  move      Move user to slot #.
  removeA   Removes a user from the list.
  note      See the note.
  setNote   Set the note.
  start     Start the RR.
  timezones List users and their timezones.
Quotes:
  addquote  Add a quote (Spawn and up)
  quote     Get a random quote or you can specify a quote number.
  quotes    DM's you all of the quotes. (May take a min)
​Help:
  help      Shows this message.

Type ?help command for more info on a command.
You can also type ?help category for more info on a category.\`\`\``,
  rr: `\`\`\`
The Round Robin is where we get a list of names of people who want to join the robin. Depending on the amount of people we usually have each person write 3 sentences in 15 minutes then pass it on to the bot. Rizapheonyxx usually goes through it for grammar errors.\`\`\``,
  accept: `\`\`\`
Accept the RR. (DM Only)
?accept\`\`\``,
  add: `\`\`\`
Adds you to the RR list.
?add <timezone> <time restrictions>\`\`\``,
    remove: `\`\`\`
Removes you to the RR list.
?remove\`\`\``,
  deny: `\`\`\`
Deny the RR and move to the end of the line.  (DM Only)
?deny\`\`\``,
  done: `\`\`\`
Add your writing to the RR. (DM Only)
?done
or
<your writeing> ?done
or
?done <you writing>\`\`\``,
    rradmin: `\`\`\`
Admin commands for the RR's only Hydras and higer can use them.\`\`\``,
    adda: `\`\`\`
    Add a user to the list.
?addA <username> <timezone> <time restrictions>\`\`\``,
    list: `\`\`\`
List all of the users in the list.
?list\`\`\``,
    move: `\`\`\`
Move user to slot #.
?move <username> <index #>\`\`\``,
    removea: `\`\`\`
Removes a user from the list..
?removeA <username>\`\`\``,
    note: `\`\`\`
See the note.
?note\`\`\``,
    setnote: `\`\`\`
Set the note.
?setNote <note>\`\`\``,
    start: `\`\`\`
Start the RR.
?start\`\`\``,
    timezones: `\`\`\`
List users and their timezones.
?timezones\`\`\``,
    addquote: `\`\`\`
Adds a quote.
?addquote <quote>\`\`\``,
    quote: `\`\`\`
Get a random quote or you can specify a quote number.
?quote
or
?quote <num>\`\`\``,
    quotes: `\`\`\`
DM's you all of the quotes. (May take a min)
?quotes\`\`\``,
    help: `\`\`\`
Shows help information
?help
or
?help <command>\`\`\`` }
};
