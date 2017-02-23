"use strict";

function Folder(id, name){
    this._id = id;
    this._name = name;
    this._items = [];

    this._getIndexOfChildById = function (id) {
        let index = this._items.length;

        while(index--){
            let currentItem = this._items[index];

            if(currentItem._id === id){
                return index;
            }
        }
        return -1;
    };

    this._isNameExist = function (name, type) {
        for (let i = 0; i < this._items.length; i++){
            if (this._items[i]._name.toLowerCase() === name.toLowerCase()){
                if (this._items[i].getType() === type){
                    return true;
                }
            }

        }
        return false;
    };
}

Folder.prototype.deleteChild = function (id) {
    let index = this._getIndexOfChildById(id);

    if (index < 0){ return; }

    this._items.splice(index, 1);
};

Folder.prototype.rename = function (newName) {
    this._name = newName;
};

Folder.prototype.addChild = function (item) {
    this._items.push(item);
};

Folder.prototype.findChild = function (id) {
    let index = this._getIndexOfChildById(id);

    if (index < 0){ return null; }

    return this._items[index];
};

Folder.prototype.getChildren = function () {
    return this._items;
};

Folder.prototype.getId = function () {
    return this._id;
};

Folder.prototype.getType = function () {
    return 'folder';
};