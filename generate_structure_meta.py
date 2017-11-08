import os
import json

modelsFolder = "models/body"
folder_system_map = {'cardiovascular': 'Cardiovascular', 'digestive': 'Digestive', 'male': 'Male Reproductive', \
                    'musculo': 'Musculo-skeletal', 'nervous': 'Brain & Central Nervous', 'respiratory':'Respiratory', \
                    'skin':'Skin (integument)', 'urinary':'Urinary'}
systemVisibility =  {'Cardiovascular': True, 'Digestive': False, 'Male Reproductive' : False, \
                    'Musculo-skeletal': False, 'Brain & Central Nervous': False, 'Respiratory': False, \
                    'Skin (integument)': False, 'Urinary': False }
partVisibility = { }
# mapping from qt to zinc end
initialLoadingSize = 0
totalsize = 0

def addJSONEntry(path, fileName, visibility):
    relativePathName = path + "/" + fileName
    json_raw = open(relativePathName).read()
    original_data = json.loads(json_raw)
    if type(original_data) is list:
        if len(original_data) == 1:
           partName = original_data[0]["GroupName"]
           itemDicts = {}
           if partName in partVisibility:
               itemDicts['loadAtStartup'] = partVisibility[partName]
           else:
               itemDicts['loadAtStartup'] = visibility
           itemDicts['BodyURL'] = relativePathName
           global totalsize
           itemSize = os.path.getsize(relativePathName)
           totalsize = totalsize + itemSize
           itemDicts['FileFormat'] = "JSON"
           return [original_data[0]["GroupName"], itemDicts]
        else:
            print len(original_data)
    return None

def addOtherEntry(path, fileName, fileFormat, visibility):
    relativePathName = path + "/" + fileName
    partName = os.path.splitext(fileName)[0].title()
    itemDicts = {}
    itemDicts['loadAtStartup'] = visibility
    if partName in partVisibility:
        itemDicts['loadAtStartup'] = partVisibility[partName]
    else:
        itemDicts['loadAtStartup'] = visibility
    itemDicts['BodyURL'] = relativePathName
    itemDicts['FileFormat'] = fileFormat
    global totalsize
    global initialLoadingSize
    itemSize = os.path.getsize(relativePathName)
    totalsize = totalsize + itemSize
    if itemDicts['loadAtStartup']:
        initialLoadingSize = initialLoadingSize + itemSize
    print partName + " " + str(itemSize/(1024)) + "KB;" + "Load at Startup: " + str(itemDicts['loadAtStartup']) 
    return [partName, itemDicts]


def addEntry(path, fileName, systemName):
    extension = os.path.splitext(fileName)[1]
    visibility = systemVisibility[systemName]
    if extension == ".json":
        return addJSONEntry(path, fileName, visibility)
    elif extension == ".stl":
        return addOtherEntry(path, fileName, "STL", visibility)
    elif extension == ".obj":
        return addOtherEntry(path, fileName, "OBJ",visibility)
        
    return None

def writeSystemEntry(parentFolder, systemName):
    topLevelArray = {}
    topLevelArray["System"] = systemName
    fileDicts = {}
    for x in os.walk(parentFolder):
        if len(x[2]) > 0:
            for filename in x[2]:
                content = addEntry(x[0], filename, systemName)
                if content != None:
                    fileDicts[content[0]] = content[1]
    topLevelArray["Part"] = fileDicts
    metafileName = parentFolder + "/" + systemName + "_meta.json"      
    f = open(metafileName, 'w+')
    json.dump(topLevelArray, f)
    f.close()
    return metafileName
    
def createSystemsDescription():
    bodyMeta = {}
    metaFilesArray = []
    for key in folder_system_map:
        metafileName = writeSystemEntry(modelsFolder + "/" + key, folder_system_map[key])
        metaFilesArray.append(metafileName)
    bodyMeta["SystemMetaLocation"] =  metaFilesArray
    f = open(modelsFolder + "/" + "bodyMeta.json", 'w+')
    json.dump(bodyMeta, f)
    f.close()
    #writeSystemEntry('cardiovascular', folder_system_map['cardiovascular'])
        
createSystemsDescription()
print "Total file size: " +  str(totalsize/(1024*1024)) + "MB"
print "Initial loading size: " +  str(initialLoadingSize/(1024*1024)) + "MB"

