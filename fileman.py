'''
Created on Apr 4, 2017

@author: ParkerMc
'''
import os

class fileman:
    def __init__(self, filename):
        if os.path.isfile(filename):
            self.newfile = False
            self.f = open(filename, "r")
            self.text = self.f.readlines()
            self.f.close()
            self.f = open(filename, "w")
        else:
            self.newfile = True
            self.f = open(filename, "w")
            self.text = []
        
    def text(self):        
        return "\n".join()
    
    def toArray(self):
        return self.text
    
    def toT2Array(self):
        out = []
        for i in self.text:
            out.append((i.split(",")[0],i.split(",")[1]))
        return out
    
    def save(self, text):
        self.f.writelines(text)
