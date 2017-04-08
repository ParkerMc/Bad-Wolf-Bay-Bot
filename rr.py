'''
Created on Apr 6, 2017

@author: ParkerMc
'''
import asyncio
from discord.ext import commands
from fileman import fileman

class rr:
    def __init__(self, bot):
        self.adminRanks = ["Kraken", "Hydra Heads"]
        #load files
        self.userlistF = fileman("userlist.txt")
        self.userlist = self.userlistF.toT2Array()
        self.noteF = fileman("note.txt")
        self.note = self.noteF.toText()
        self.RRF = fileman("RR.txt")
        self.RR = self.RRF.toArray()
        self.bot = bot
        self.botChannel = "299032114677022722" #my bot one"298544719946842114"
        self.server = "270055309786087435"
        self.timeToResondText = "5 mins" 
        self.timeToResondSecs = 300 
        self.ifThereMsg = "It is your turn for the RR please run \"?accept\" to accept, \"?deny\" to be moved to the end of the list, or \"?remove\" to be skiped and removed from the list. You will be skiped after %s." % (self.timeToResondText)
        self.endMessage = "When you are done used \"?done Your writeing\" to add your writeing or you can use \"?deny\" or \"?remove\"."
        self.waitingCurrent = True
        self.alreadyWent = {}
        self.currentUser = None
        self.started = False
        if self.note.strip() == "" or self.note == None:
            self.note = "Please write 3 sentences in 15 minutes that build on things people have written before you."
            
    @commands.bot.command(pass_context=True, no_pm=False, description='Add to the RR. (DM Only)')
    async def done(self, ctx):
        """Add to the RR. (DM Only)"""
        if str(self.currentUser) == str(ctx.message.author) and ctx.message.channel.is_private:
            if str(ctx.message.clean_content)[6:].strip() != "":
                self.RR.append(str(ctx.message.clean_content)[6:])
                self.RRF.save(self.RR)
                await self.bot.send_message(ctx.message.author, "Added, Thank you.")
                await self.next()
    @commands.bot.command(pass_context=True, no_pm=False, description='Accept the RR. (DM Only)')
    async def accept(self, ctx):
        """Accept the RR. (DM Only)"""
        if str(self.currentUser) == str(ctx.message.author) and ctx.message.channel.is_private:
            await self.bot.send_message(self.bot.get_channel(self.botChannel), str(ctx.message.author)[:-5] + " accepted")
            await self.bot.send_message(ctx.message.author, self.note)
            for i in self.RR:
                await self.bot.send_message(ctx.message.author, i)
            await self.bot.send_message(ctx.message.author, self.endMessage)
            self.waitingCurrent = False
    @commands.bot.command(pass_context=True, no_pm=False, description='Deny the RR and move to the end of the line.  (DM Only)')
    async def deny(self, ctx):
        """"Deny the RR and move to the end of the line.  (DM Only)"""
        if str(self.currentUser) == str(ctx.message.author) and ctx.message.channel.is_private:
                self.toEnd(ctx.message.author)
                await self.bot.send_message(self.bot.get_channel(self.botChannel), str(ctx.message.author)[:-5] + " denied, passing on.")
                await self.bot.send_message(ctx.message.author, "You have been moved to the end of the list.")
                await self.next()
    
    
    async def updatedList(self):
        msg = "Updated user list: "
        for i in self.userlist:
            if str(self.userlist[0][0]).strip() == str(i[0]):
                msg = msg + str(i[0])[:-5]
            elif str(self.userlist[len(self.userlist)-1][0]) == str(i[0]) and len(self.userlist) > 0:
                msg = msg + ", and " + str(i[0])[:-5]
            else:
                msg = msg + ", " + str(i[0])[:-5]
        smsg = await self.bot.send_message(self.bot.get_channel(self.botChannel), msg + ".")
        self.saveUserList()
  
    async def next(self):
        usernameOld = self.userlist[0][0]
        try:
            username = self.userlist[1][0]
        except:
            server = self.bot.get_server(self.server)
            for i in server.members:
                if str(i).lower().replace(" ", "")[:-5] == str("parkermc").lower():
                    for j in self.RR:
                        await self.bot.send_message(i, j)
            await self.bot.send_message(self.bot.get_channel(self.botChannel), "RR done sending to Riza") 
            return 
        self.userlist.pop(0)
        self.saveUserList()
        await self.changeUser(usernameOld, username)
              
    async def changeUser(self, usernameOld, username):
        await self.bot.send_message(self.bot.get_channel(self.botChannel), "%s is done passing to %s." % (str(usernameOld)[:-5], str(username)[:-5]))
        for i in self.bot.get_server(self.server).members:
            if str(i) == str(username):
                await self.bot.send_message(i, self.ifThereMsg)
                self.bot.loop.create_task(self.waitDM(i))
                self.waitingCurrent = True
    
    async def waitDM(self, user):
        self.currentUser = user
        await asyncio.sleep(self.timeToResondSecs)
        if self.waitingCurrent and str(self.currentUser) == str(user):
            if self.alreadyWent[str(user)] == True:
                await self.bot.send_message(user, "You took too long if this is the first you missed it you will be moved to the end.")
                await self.bot.send_message(self.bot.get_channel(self.botChannel), str(user)[:-5] + " took too long passing on.")
                self.removeUser(user)
                await self.next()
            else:
                self.toEnd(user)
                self.alreadyWent[str(user)] = True
                await self.bot.send_message(self.bot.get_channel(self.botChannel), str(user)[:-5] + " took too long passing on.")
                await self.next()
            
    def toEnd(self, user):
        for i in self.userlist:
            if str(i[0]) == str(user):
                self.userlist.append(i)
                
    def removeUser(self, user):
        for i in self.userlist:
            if str(i[0]) == str(user):
                self.userlist.remove(i)
                
    def saveUserList(self):
        text = []
        for i in self.userlist:
            text.append(str(i[0]) + "," + i[1])
        self.userlistF.save(text)

    @commands.bot.command(pass_context=True, no_pm=True, description='Adds you to the RR list')
    async def add(self, ctx, timezone : str):
        """Adds you to the RR list"""
        if timezone == None:
            await self.bot.say("No timezone specified. \"?help add\" for more info.")
            return
        if self.started:
            await self.bot.say("The RR already started only admins can add people now.")
            return
        for i in self.userlist:
            if str(i[0]) == str(ctx.message.author):
                await self.bot.say("You are already in the list.")
                return

        self.userlist.append((ctx.message.author, timezone))
        await self.updatedList()
        await self.bot.say("Added.")
        
    @commands.bot.command(pass_context=True, no_pm=False, description='Removes you to the RR list')
    async def remove(self, ctx):
        """Removes you to the RR list"""
        if str(self.currentUser) == str(ctx.message.author):
            self.removeUser(ctx.message.author)
            await self.updatedList()
            await self.bot.say("Removed.")
            await self.next()
            return
        found = False
        for i in self.userlist:
            if str(i[0]) == str(ctx.message.author):
                self.userlist.remove(i)
                found = True
        if not found:
            await self.bot.say("You are not in the list.")
            return
        await self.updatedList()
        await self.bot.say("Removed.")
        
    @commands.bot.command(pass_context=True, no_pm=False, description='Add user to list (Admin only).')
    async def addA(self, ctx, username : str, timezone : str):
        """Add user to list (Admin only)."""
        if timezone == None or username == None:
            await self.bot.say("No username or timezone specified. \"?help addA\" for more info.")
            return
        found = False
        server = self.bot.get_server(self.server)
        for i in server.members:
            if str(i).lower().replace(" ", "")[:-5] == str(username).lower():
                for j in self.userlist:
                    if str(i) == str(j[0]):
                        await self.bot.say("User already in the list.")
                        return
                self.userlist.append((i, timezone))
                found = True
        if not found:
            await self.bot.say("User not found.")
            return
        await self.updatedList()
        await self.bot.say("Added.")
            
    @commands.bot.command(pass_context=True, no_pm=False, description='Remove user from list (Admin only).')
    async def removeA(self, ctx, username : str):
        """Remove user from list (Admin only)."""
        if ctx.message.author.roles[1].name in self.adminRanks or ctx.message.author.name == "ParkerMc":
            found = False
            for i in self.userlist:
                if str(i[0]).lower().replace(" ", "")[:-5] == str(username).lower():
                    self.userlist.remove(i)
                    found = True
            if not found:
                await self.bot.say("User not found in the list.")
                return
            await self.updatedList()
            await self.bot.say("Removed.")

    @commands.bot.command(pass_context=True, no_pm=False, description='List timezones (Admin only).')
    async def timezones(self, ctx):
        """List timezones (Admin only)."""
        msg = "User list with timzones: "
        for i in self.userlist:
            if str(self.userlist[0][0]).strip() == str(i[0]):
                msg = msg + str(i[0])[:-5] + " - " + str(i[1])
            elif str(self.userlist[len(self.userlist)-1][0]) == str(i[0]) and len(self.userlist) > 0:
                msg = msg + ", and " + str(i[0])[:-5] + " - " + str(i[1])
            else:
                msg = msg + ", " + str(i[0])[:-5] + " - " + str(i[1])
        await self.bot.say(msg + ".")
        
    @commands.bot.command(pass_context=True, no_pm=False, description='Move user to slot # (Admin only).')
    async def move(self, ctx, username : str, slot : int):
        """Move user to slot # (Admin only)."""
        found = False
        for i in self.userlist:
            if str(i[0]).lower().replace(" ", "")[:-5] == str(username).lower():
                self.userlist.remove(i)
                self.userlist.insert(slot-1, i)
                found = True
        if not found:
            await self.bot.say("User not found in the list.")
            return
        await self.updatedList()
        await self.bot.say("Moved.")
        
    @commands.bot.command(pass_context=True, no_pm=False, description='See the current note (Admin only).')
    async def note(self, ctx):
        """See the current note (Admin only)."""
        await self.bot.say(self.note)
        
    @commands.bot.command(pass_context=True, no_pm=False, description='Set the note (Admin only).')
    async def setNote(self, ctx):
        """Set the note (Admin only)."""
        self.note = ctx.message.clean_content[10:]
        self.noteF.save([self.note])
        await self.bot.say("Note set.")
        
    @commands.bot.command(pass_context=True, no_pm=False, description='Start the RR (Admin only).')
    async def start(self, ctx):
        """Start the RR (Admin only)."""
        if self.started:
            await self.bot.say("Already started.")
            return 
        await self.bot.send_message(self.bot.get_channel(self.botChannel), "%s has started the RR, %s will go first" % (ctx.message.author.name, str(self.userlist[0][0])[:-5]))
        for i in self.bot.get_server(self.server).members:
            if str(i) == str(self.userlist[0][0]):
                await self.bot.send_message(i, self.ifThereMsg)
                self.waitingCurrent = True
                self.bot.loop.create_task(self.waitDM(i))
        await self.bot.say("Started.")
