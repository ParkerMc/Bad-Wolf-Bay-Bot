'''
Created on Apr 4, 2017

@author: ParkerMc
'''
import os

class fileman:
    def __init__(self, filename):
        self.filename = filename
        if os.path.isfile(filename):
            self.newfile = False
            self.f = open(filename, "r")
            self.text = self.f.readlines()
            self.f.close()
        else:
            self.newfile = True
            self.text = []
        
    def toText(self):        
        return "\n".join(self.text)
    
    def toArray(self):
        return self.text
    
    def toT2Array(self):
        out = []
        for i in self.text:
            out.append((i.split(",")[0].replace("\n", ""),i.split(",")[1].replace("\n", "")))
        return out
    
    def save(self, text):
        self.f = open(self.filename, "w")
        for i in text:
            self.f.write(i)
        self.f.close()
