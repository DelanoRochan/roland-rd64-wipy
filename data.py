import json

class Data:
    def __init__(self,filename="data.json"):
        self.filename = filename
        self.data = self.__read_file()
        self.changed = False

    def __read_file(self):
        with open(self.filename) as data:
            return json.load(data)

    def refresh(self):
        self.data = self.__read_file()

    def get(self,key):
        try:
            keys = key.split('.')
            data = self.data
            for k in keys:
                k = int(k) if isinstance(data,list) else k
                data = data[k]
        except KeyError:
            return None
        return data

    def set(self,key,value):
        keys = key.split('.')
        data = self.data
        i = 0
        for k in keys:
            k = int(k) if isinstance(data,list) else k
            if i == len(keys)-1:
                data[k] = value
                self.changed = True
            else:
                data = data[k]
            i+=1

    def save(self):
        with open(self.filename,'w') as f:
            f.write(json.dumps(self.data))
