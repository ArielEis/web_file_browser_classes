"use strict";

function FileSystem(){

    this._root = null;
    this._nextId = 1;

    this._getItemById = function (currentItem, id) {
        let isFound = false;
        let i = 0;
        let result = undefined;

        if (currentItem._id === id) {
            return currentItem;

        } else if(currentItem.getType() === 'folder'){

            while (!isFound && i < currentItem._items.length) {

                if (currentItem._items[i]._id === id) {
                    isFound = true;
                    return currentItem._items[i];

                } else {
                    result = this._getItemById(currentItem._items[i], id);

                    if (result !== undefined) {
                        return result;
                    }
                }
                i++;
            }
        }
    };

    let system = localStorage.getItem('file_system');
    if (system === null){
        this._root = new Folder(0, 'Root');
    } else {
        let linearArray = JSON.parse(system);
        this._root = new Folder(linearArray[0][1], linearArray[0][2]);
        if (linearArray.length > 0){
            let parent = null;
            for (let i = 1; i < linearArray.length; i++){
                parent = this.getItem(linearArray[i][3]);
                if (linearArray[i][0] === 'folder'){
                    this.addFolder(linearArray[i][2], parent._id);
                } else {
                    this.addFile(linearArray[i][2], parent._id, linearArray[i][4]);
                }
            }
        }
    }


    this._getParentByChildId = function (currentItem, id) {

        if (id === 0) {return this._root}

        let isFound = false;
        let i = 0;
        let result = undefined;

        while (!isFound && i < currentItem._items.length) {

            if (currentItem._items[i]._id === id) {
                return currentItem;

            } else if (currentItem._items[i].getType() === 'folder'){
                result = this._getParentByChildId(currentItem._items[i], id);

                if (result !== undefined) {
                    return result;
                }
            }
            i++;
        }
    };

    this._getItemByPath = function (pathString) {
        let file = undefined;
        let path = pathString.split('/');

        if (this._root._name.toLowerCase() !== path[0].toLowerCase()) {
            return file;
        }

        let currentItem = this._root;
        let index = 1;
        let isFound = true;
        let isRunning = true;
        let counter = 0;

        while (isRunning && index < path.length) {
            isFound = false;
            while (counter < currentItem._items.length && !isFound) {
                if (currentItem._isNameExist(path[index], 'folder')) {
                    isFound = true;
                    let items = currentItem.getChildren();
                    for (let i = 0; i < items.length; i++){
                        if (items[i]._name.toLowerCase() === path[index].toLowerCase()
                            && items[i].getType() === 'folder'){
                            currentItem = items[i];
                            break;
                        }
                    }
                    index++;
                }
                counter++;
            }
            if (!isFound) {
                isRunning = false;
            }
        }
        if (isFound) {
            file = currentItem;
        } else if (index ===  path.length-1) {
            counter = 0;
            isFound = false;
            while (!isFound && counter < currentItem._items.length) {
                if (currentItem._isNameExist(path[index], 'file')) {
                    isFound = true;
                    let items = currentItem.getChildren();
                    for (let i = 0; i < items.length; i++){
                        if (items[i]._name.toLowerCase() === path[index].toLowerCase()){
                            currentItem = items[i];
                            break;
                        }
                    }
                }
                counter++;
            }
        }
        if (isFound) {
            file = currentItem;
        }
        return file;
    };
    
    this._buildPathOfFile = function (currentFolder, id, path) {
        path.push(currentFolder._name);
        let isFound = false;
        let i = 0;
        let result = undefined;
        if (currentFolder._id === id) {
            result = currentFolder;
            return result;
        } else {
            while (!isFound && i < currentFolder._items.length) {
                if (currentFolder._items[i]._id === id) {
                    isFound = true;
                    path.push(currentFolder._items[i]._name);
                    result = currentFolder._items[i];
                    return result;
                } else {
                    if (currentFolder._items[i].getType() === 'folder') {
                        result = this._buildPathOfFile(currentFolder._items[i], id, path);
                        if (result !== undefined) {
                            return result;
                        }
                    }
                }
                i++;
            }
        }
        path.pop();
    };

    this._insertSystemToArray = function (currentItem, linearArray) {
        switch (currentItem.getType()){
            case 'folder':
                linearArray.push(['folder', currentItem._id, currentItem._name,
                    this.getParentById(currentItem._id)._id]) ;

                for (let i = 0; i < currentItem._items.length; i++){
                    this._insertSystemToArray(currentItem._items[i], linearArray);
                }
                break;
            case 'file':
                linearArray.push(['file', currentItem._id, currentItem._name,
                    this.getParentById(currentItem._id)._id, currentItem._content]);
                break;
        }

    };
}


FileSystem.prototype.addFolder = function(name, parentId) {
    let newFolder = new Folder(this._nextId++, name);

    let targetFolder = this._getItemById(this._root, parentId);
    if (targetFolder.getType() !== 'folder') {
        throw new Error('Cannot create new folder in this location');
    }

    targetFolder.addChild(newFolder);
};

FileSystem.prototype.addFile = function (name, parentId, content) {
    let newFile = new File(this._nextId++, name, content);

    let targetFolder = this._getItemById(this._root, parentId);
    if (targetFolder.getType() !== 'folder') {
        throw new Error('Cannot create new file in this location');
    }

    targetFolder.addChild(newFile);
};

FileSystem.prototype.renameItem = function (id, newName) {
    let targetItem = this._getItemById(this._root, id);
    targetItem.rename(newName);
};

FileSystem.prototype.deleteItem = function (id) {
    let targetFolder = this._getParentByChildId(this._root, id);
    targetFolder.deleteChild(id);
};

FileSystem.prototype.getItem = function (uniqueIdentify) {
    switch(typeof uniqueIdentify){
        case 'string':
            return this._getItemByPath(uniqueIdentify);
            break;

        case 'number':
            return this._getItemById(this._root, uniqueIdentify);
            break;
    }
    return null;
};

FileSystem.prototype.getPath = function (id) {
    let pathArray = [];
    this._buildPathOfFile(this._root, id, pathArray);

    return pathArray.join('/');
};

FileSystem.prototype.getParentById = function (id) {
    return this._getParentByChildId(this._root, id)
};



FileSystem.prototype.getFreeNewName = function (id, name ,type) {
    let currentItem = this._getItemById(this._root, id);

    if (currentItem.getType() !== 'folder'){
        throw new Error(currentItem +' is not a folder')
    }

    let count = 0;
    let isFound = false;
    let newName = name;
    if (currentItem._isNameExist(name, type)){
        while (!isFound){
            count++;
            if (!currentItem._isNameExist(name+' ('+count+')', type)) {
                return name+' (' + count + ')';
            }
        }
    }
    return newName;
};

FileSystem.prototype.saveInLocalStorage = function () {
    let linearArray = [];
    this._insertSystemToArray(this._root, linearArray);
    localStorage.setItem('file_system', JSON.stringify(linearArray));
};