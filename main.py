'''
Created on Apr 4, 2017

@author: ParkerMc
'''
from discord.ext import commands
from fileman import fileman
from rr import rr
import discord
import asyncio        
 
description = '''An bot for RR use.
No spaces in user name when useing admin commands!'''
bot = commands.Bot(command_prefix='?', description=description)
bot.add_cog(rr(bot))

@bot.event
async def on_ready():
    print('Logged in as')
    print(bot.user.name)
    print(bot.user.id)
    print('------')
bot.run('email', "password")
