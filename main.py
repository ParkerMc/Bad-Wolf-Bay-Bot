'''
Created on Apr 4, 2017

@author: ParkerMc
'''
from discord.ext import commands
from fileman import fileman
import discord

class main:
    def __init__(self, bot):
        self.adminRanks = ["Kraken", "Hydra Heads"]
        #load files
        self.userlistF = fileman("userlist.txt")
        self.userlist = self.userlistF.toT2Array()
        self.bot = bot
        self.botChannel = "298544719946842114"
        self.server = "270055309786087435"
    
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
        for i in self.userlist:
            if str(i[0]) == str(ctx.message.author):
                await self.bot.say("You are already in the list.")
                return

        self.userlist.append((ctx.message.author, timezone))
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
        await self.bot.say("Added.")
        
    @commands.bot.command(pass_context=True, no_pm=True, description='Removes you to the RR list')
    async def remove(self, ctx):
        """Removes you to the RR list"""
        found = False
        for i in self.userlist:
            if str(i[0]) == str(ctx.message.author):
                self.userlist.remove(i)
                found = True
        if not found:
            await self.bot.say("You are not in the list.")
            return
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
            await self.bot.say("Removed.")

    @commands.bot.command(pass_context=True, no_pm=False, description='List timezones (Admin only).')
    async def timezonesA(self, ctx):
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
    async def moveA(self, ctx, username : str, slot : int):
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
        await self.bot.say("Moved.")
 
description = '''An bot for RR use.
No spaces in user name when useing admin commands!'''
bot = commands.Bot(command_prefix='?', description=description)
bot.add_cog(main(bot))

@bot.event
async def on_ready():
    print('Logged in as')
    print(bot.user.name)
    print(bot.user.id)
    print('------')
bot.run('email', "password")
