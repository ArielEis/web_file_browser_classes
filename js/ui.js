"use strict";

function UI(fileSystem) {
    this._fileSystem = fileSystem;



    $(document).ready(function () {
        initialContextMenuOptions();
        initializeTopBar();
        initializeBrowser();
        initializeContent();
    });




    /* Start of - Initialize functions */


    function initializeTopBar() {
        address.val('');
        backwardButton.attr('disabled', true);
        forwardButton.attr('disabled', true);
        address.on('keyup', function (e) {
            if (e.keyCode == 13) {
                let item = fileSystem.getItem(address.val());
                if (item !== undefined) {
                    switch (item.getType()){
                        case 'folder':
                            openDirectory(item, false);
                            break;
                        case 'file':
                            targetId = item._id;
                            showFileContent();
                            targetId = -1;
                            break;

                    }

                } else {
                    createAlertMessage('address location isn\'t exist');
                    updateAddressLine();
                }
            }
        });
        initialNavigateButtons();
    }


    function initialNavigateButtons(){
        initializeBackwardButton();
        initializeForwardButton();
    }


    function initializeBackwardButton(){
        backwardButton.click(function () {
            if (historyLog.getPointer() > 0){
                let backToDirectory = undefined;
                while (backToDirectory === undefined && historyLog.getPointer() > 0){
                    let destId = historyLog.goBack();
                    backToDirectory = fileSystem.getItem(destId);
                }
                if (historyLog.getPointer() === 0){
                    handleNavigationButtonsEnable();
                    closeDirectory(fileSystem.getItem(historyLog.getHistory(1)));
                } else {
                    handleNavigationButtonsEnable();
                    openDirectory(backToDirectory, true);
                }
            }
        });
    }

    function initializeForwardButton() {
        forwardButton.click(function () {
            if (historyLog.getPointer() < historyLog.getMaxSize() && historyLog.getPointer() < (historyLog.getLength()-1)) {
                let goToDirectory = undefined;
                let destId = historyLog.goForward();
                while (goToDirectory === undefined && historyLog.getPointer() > 0){
                    goToDirectory = fileSystem.getItem(destId);
                    if (goToDirectory === undefined){
                        historyLog.removeItemAtIndex(historyLog.getPointer());
                    }
                }
                handleNavigationButtonsEnable();
                openDirectory(goToDirectory, true);
            }
        });
    }

    function initializeBrowser(){
        browser.empty();
        let newNode = browserTemplate.clone();
        newNode.find('.arrow').remove();
        let folder = newNode.find('.folder');
        folder.attr('id', 'folder_0');
        folder.attr('index', 0);
        folder.attr('state', 'close');
        addListenerClickToFolderIconOnBrowser(folder);
        let aTag = newNode.find('a');
        aTag.text(fileSystem.getItem(0)._name);
        aTag.attr('class', 'a_ul');
        aTag.attr('index', 0);
        aTag.attr('state', 'close');
        addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag);
        browser.append(newNode);
        browser.contextmenu(function () {
            return false;
        });

        browser.mousedown(function (event) {
            if (event.button !== 2){
                closeObject([contentMenu, newFileMenu], 200);
            }
        });
    }

    function initializeContent() {
        content.empty();
        content.css({'background-color':'#666'});
        content.contextmenu(function () {
            return false;
        });

        content.mousedown(function (event) {
            if (currentLocationId > -1){
                setRightClickContextMenu(event);
            }
        });
    }



    function initialContextMenuOptions(){
        addListenerClickToDeleteFile();
        addListenerClickToRenameFile();
        addListenerClickToNewFile();
        addListenerClickToQuitContentMenu();
        addListenerClickToCreateNewDirectory();
        addListenerClickToCreateNewFile();
    }


    /* End of - Initialize functions */


    /* Function for browser window */


    function openDirectoryOnBrowser(directory){
        let folderIcon =  browser.find('#folder_'+directory._id);
        folderIcon.attr('src', 'pics/open_directory.png');
        folderIcon.attr('state', 'open');
        let allDirectories = [];
        let allFiles = [];
        seperateFilesInsideDirectory(directory, allDirectories, allFiles);
        allDirectories = mergeSort(allDirectories, 'fileName');
        for (let i = 0; i < allDirectories.length; i++){
            drawDirectoryOnBrowser(allDirectories[i]._name, allDirectories[i]._id, directory._id);
        }
    }


    function closeDirectoryOnBrowser(directory){
        let folderIcon =  browser.find('#folder_'+directory._id);
        folderIcon.attr('src', 'pics/close_directory.png');
        folderIcon.attr('state', 'close');
        for (let i = 0; i < directory._items.length; i++){
            removeDirectoryFromBrowser(directory._items[i]._id);
        }
    }


    function removeDirectoryFromBrowser(id) {
        browser.find('#ul_' + id).remove();
    }


    function drawDirectoryOnBrowser(name, id, parentId){
        let newNode = browserTemplate.clone();
        let folder = newNode.find('.folder');
        folder.attr('id', 'folder_'+id);
        folder.attr('index', id);
        addListenerClickToFolderIconOnBrowser(folder);
        let aTag = newNode.find('a');
        aTag.text(name);
        newNode.find('ul').attr('id', 'ul_'+id);
        aTag.attr('id', 'a_' + id);
        aTag.attr('index', id);
        aTag.attr('state', 'close');
        addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag);
        browser.find('#ul_' + parentId).append(newNode);
    }


    /* Function for content window */


    function openDirectory(directory, isHistoryRequest){
        content.css({'background-color':'snow'});
        content.empty();
        currentLocationId = directory._id;
        let allDirectories = [];
        let allFiles = [];
        seperateFilesInsideDirectory(directory, allDirectories, allFiles);
        allDirectories = mergeSort(allDirectories, 'fileName');
        allFiles = mergeSort(allFiles, 'fileName');
        for (let i=0; i<allDirectories.length; i++){
            drawDirectoryOnContent(allDirectories[i]._name, allDirectories[i]._id);
        }
        for (let i = 0; i < allFiles.length; i++) {
            drawFileOnContent(allFiles[i]._name, allFiles[i]._id, allFiles[i].getType());
        }
        updateAddressLine();
        if (!isHistoryRequest){
            historyLog.setLength(historyLog.getPointer()+1);
            historyLog.addToHistory(currentLocationId);
            handleNavigationButtonsEnable();
        }
    }


    function closeDirectory(directory){
        currentLocationId = fileSystem.getParentById(directory._id);
        content.empty();
        content.css({'background-color':'#666'});
        address.val('');
    }



    function showFileContent() {
        let window = openFileWindow.clone();
        let file = fileSystem.getItem(targetId);
        window.find('.file_title').text(file._name+".txt");
        let input = window.find('#file_content_text');
        input.text(file.getContent());
        window.find('#file_quit').click(function () {
            closeObject([window], 200);
        });
        window.find('#cancel_file').click(function () {
            closeObject([window], 200);
        });
        window.find('#save_file').click(function () {
            file.setContent(input.val());
            saveSystem();
            closeObject([window], 200);
        });
        page.append(window);
        openObject([window], 200);
    }


    function drawDirectoryOnContent(name, id){
        let newFolder = contentTemplate.clone();
        let folderIcon = newFolder.find(".icon");
        setUpFileContent(newFolder, folderIcon, name, id ,'directory');
        folderIcon.dblclick(function () {
            targetId = parseInt($(this).attr('index'));
            let targetDirectory = fileSystem.getItem(id);
            openDirectory(targetDirectory, false);
        });
        content.append(newFolder);
    }

    function drawFileOnContent(name, id, type){
        let newFile = contentTemplate.clone();
        let folderIcon = newFile.find(".icon");
        setUpFileContent(newFile, folderIcon, name, id ,type);
        folderIcon.dblclick(function () {
            targetId = parseInt($(this).attr('index'));
            showFileContent();
        });
        content.append(newFile);
    }


    function removeItemFromContent() {
        content.find('#file_'+targetId).remove();
    }


    function setUpFileContent(file, icon, name, id, type){
        file.attr('id', 'file_'+id);
        file.find(".file_name").text(name);
        icon.attr('index', id);
        switch(type){
            case 'file':
                icon.attr('src', 'pics/txt.png');
                icon.css({'width':'60%'});
                break;
        }
        icon.mousedown(function (event) {
            if (event.button === 2){
                targetId = parseInt($(this).attr('index'));
            }
        });
    }


    /* Function for top bar */

    function updateAddressLine(){
        if (currentLocationId >= 0){
            address.val(fileSystem.getPath(currentLocationId));
        } else {
            address.val('');
        }
    }


    function handleNavigationButtonsEnable(){
        let pointer = historyLog.getPointer();
        if (pointer <= 0){
            disableButton(backwardButton);
        } else {
            enableButton(backwardButton);
        }

        if (pointer > -1 && pointer < historyLog.getLength()-1){
            enableButton(forwardButton);
        } else {
            disableButton(forwardButton);
        }

    }

    function disableButton(button){
        button.attr('disabled', true);
        button.attr('class', 'disabled_button');
    }

    function enableButton(button){
        button.attr('disabled', false);
        button.attr('class', 'enabled_button');
    }

    /* Function influence on file system */


    function createNewDirectory(name){
        checkTargetFromBrowserOrFromContent();
        fileSystem.addFolder(name, targetId);
        if (browser.find('#folder_'+targetId).attr('state') === 'open'){
            drawDirectoryOnBrowser(name, (fileSystem._nextId-1), targetId);
        } else {
            openDirectoryOnBrowser(fileSystem.getItem(targetId));
        }
        if (targetId === currentLocationId){
            drawDirectoryOnContent(name, (fileSystem._nextId-1));
        }
        saveSystem();
    }

    function createNewFile(name, type){
        checkTargetFromBrowserOrFromContent();
        fileSystem.addFile(name, targetId ,'Empty-file');
        if (targetId === currentLocationId){
            drawFileOnContent(name, (fileSystem._nextId-1), type);
        }
        saveSystem();
    }


    function deleteItem(){
        checkTargetFromBrowserOrFromContent();
        setConfirmDeletePrompt();
    }

    function deleteItemExecute() {
        if (fileSystem.getItem(targetId).getType() === 'folder'){
            removeDirectoryFromBrowser(targetId);
        }

        if (targetId === currentLocationId){
            removeItemFromContent();
        }

        fileSystem.deleteItem(targetId);

        content.find('#file_'+targetId).remove();


        saveSystem();
    }


    function renameItem(targetFile, name){
        targetFile.rename(name);
        browser.find('#a_'+targetFile._id).text(name);
        content.find('#file_'+targetFile._id).find(".file_name").text(name);
        updateAddressLine();
        saveSystem();
    }



    /* Context menu */

    function setRightClickContextMenu(event){
        if (event.button === 2){
            checkTargetFromBrowserOrFromContent();
            let title = setMaxLengthOfTitle15Characters(fileSystem.getItem(targetId)._name);
            contentMenuTitle.text(title);
            contentMenu.css('left', event.pageX+5);
            contentMenu.css('top', event.pageY+5);
            openObject([contentMenu], 200);
        } else {
            closeObject([contentMenu, newFileMenu], 200);
            targetId = -1;
        }
    }


    /*  Listeners:    */

    function addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag) {
        aTag.click(function () {
            let index = parseInt($(this).attr('index'));
            let directory = fileSystem.getItem(index);
            if ($(this).attr('state') === 'open'){
                $(this).attr('state', 'close');
                closeDirectory(directory);
            } else {
                $(this).attr('state', 'open');
                openDirectory(directory, false);
            }
        });

        aTag.mousedown(function (event) {
            targetId = parseInt($(this).attr('index'));
            setRightClickContextMenu(event)
        });
    }


    function addListenerClickToDeleteFile() {
        let deleteFile = contentMenu.find('#delete_file');
        deleteFile.click(function () {
            closeObject([contentMenu], 200);
            deleteItem();
        });
        deleteFile.hover(function () {
            closeObject([newFileMenu], 200);
        });
    }


    function addListenerClickToRenameFile() {
        let renameFile = contentMenu.find('#rename_file');
        renameFile.click(function () {
            closeObject([contentMenu], 200);
            setRenamePrompt();
        });
        renameFile.hover(function () {
            closeObject([newFileMenu], 200);
        });
    }

    function addListenerClickToNewFile() {
        contentMenu.find('#new_file').hover(function (event) {
            if (newFileMenu.css('display') === 'none'){
                newFileMenu.css('left', event.pageX +40);
                newFileMenu.css('top', event.pageY -15);
                openObject([newFileMenu], 200);
            }
        });
    }

    function addListenerClickToCreateNewDirectory(){
        newFileMenu.find('#new_directory').click(function () {
            closeObject([newFileMenu, contentMenu], 200);
            createPromptNewDirectory();
        });
    }

    function addListenerClickToCreateNewFile(){
        newFileMenu.find('#new_txt_file').click(function () {
            closeObject([newFileMenu, contentMenu], 200);
            createPromptNewTextFile();
        });
    }

    function addListenerClickToQuitContentMenu(){
        let quitMenu = contentMenu.find('.quit_menu');
        quitMenu.click(function () {
            closeObject([newFileMenu, contentMenu], 200);
            targetId = -1;
        });

        quitMenu.hover(function () {
            closeObject([newFileMenu], 200);
        });
    }


    function addListenerClickToFolderIconOnBrowser(icon) {
        icon.click(function () {
            let currentDirectory = fileSystem.getItem(parseInt($(this).attr('index')));
            if ($(this).attr('state') === 'close'){
                openDirectoryOnBrowser(currentDirectory);
            } else {
                closeDirectoryOnBrowser(currentDirectory);
            }
        });
    }



    /* Validations   */

    function validateName(name, message, type, isTargetNeededToBeCheck){
        checkTargetFromBrowserOrFromContent();

        if (name === ''){
            message.push('Name must to contain characters');
            return false;
        }
        if (name.includes('.') || name.includes('/')){
            message.push('Name cannot contain special characters');
            return false;
        }

        let currentDirectory = fileSystem.getItem(targetId);

        if (currentDirectory._isNameExist(name, type)){
            message.push('Name is already exist');
            return false;
        }

        if (isTargetNeededToBeCheck && targetId < 0){
            message.push('Root directory cannot be changed');
            return false;
        }


        return true;
    }


    function validateDelete(message){
        if (targetId <= 0){
            message.push('This item cannot be deleted!');
            return false;
        }
        return true;
    }

    function isDirectory() {
        let file = fileSystem.getItem(targetId);
        if (file.getType() === 'folder'){
            return true;
        }
        return false;
    }


    /* Prompts:  */

    function createPromptNewDirectory(){
        let item = fileSystem.getItem(targetId);
        let newPrompt = promptTemplate.clone();
        let confirm = newPrompt.find('.prompt_confirm');
        let input = newPrompt.find('.prompt_text');
        checkTargetFromBrowserOrFromContent();
            try {
                setUpNewPrompt(newPrompt, 'New directory name:',
                        fileSystem.getFreeNewName(targetId, 'new folder', 'folder'),
                             'Create', input, confirm);
                confirm.click(function () {
                    if (isDirectory()) {
                        let message = [];
                        if (validateName(input.val(), message, 'directory')) {
                            closeObject([newPrompt], 1);
                            createNewDirectory(input.val());
                        } else {
                            createAlertMessage(message.pop());
                        }
                    }
                });
            } catch (e){
                 createAlertMessage('You cannot create new directory in file');
            }
    }

    function createPromptNewTextFile(){
        let newPrompt = promptTemplate.clone();
        let confirm = newPrompt.find('.prompt_confirm');
        let input = newPrompt.find('.prompt_text');
        checkTargetFromBrowserOrFromContent();
        try {
            setUpNewPrompt(newPrompt, 'New txt file name:',
                fileSystem.getFreeNewName(targetId, 'new file', 'file'), 'Create', input, confirm);
            confirm.click(function () {
                if (isDirectory()) {
                    let message = [];
                    if (validateName(input.val(), message, 'txt')) {
                        closeObject([newPrompt], 1);
                        createNewFile(input.val(), 'file');
                    } else {
                        createAlertMessage(message.pop());
                    }
                }
            });
        } catch (e) {
            createAlertMessage('You cannot create new file in file');
        }
    }


    function setConfirmDeletePrompt() {
        let newPrompt = promptTemplate.clone();
        let confirm = newPrompt.find('.prompt_confirm');
        let input = newPrompt.find('.prompt_text');
        setUpNewPrompt(newPrompt, 'Delete:', '',
            'Confirm', input, confirm);
        input.remove();
        newPrompt.find('.prompt_content').text('Are you sure?');
        confirm.click(function () {
            let message = [];
            if (validateDelete(message)){
                closeObject([newPrompt], 1);
                deleteItemExecute();
            } else {
                closeObject([newPrompt], 1);
                createAlertMessage(message.pop());
            }
        });
    }


    function setRenamePrompt() {
        let newPrompt = promptTemplate.clone();
        let confirm = newPrompt.find('.prompt_confirm');
        let input = newPrompt.find('.prompt_text');
        checkTargetFromBrowserOrFromContent();
        let targetFile = fileSystem.getItem(targetId);
        setUpNewPrompt(newPrompt, 'Rename file:', targetFile._name,
            'Rename', input, confirm);
        confirm.click(function () {
            let message = [];
            try{
                targetId = fileSystem.getParentById(targetFile._id)._id;
                if (validateName(input.val(), message, targetFile.getType(), true)){
                    targetId = targetFile._id;
                    closeObject([newPrompt], 1);
                    renameItem(targetFile, input.val());
                } else {
                    createAlertMessage(message.pop());
                }
            } catch (e){
                createAlertMessage('Cannot rename root folder');
            }
        });
    }





    function setUpNewPrompt(prompt, title, text, confirm_text, input, confirm){
        prompt.find('.prompt_title').text(title);
        input.val(text);
        confirm.attr('value', confirm_text);

        prompt.find('.prompt_quit').click(function () {
            closeObject([prompt], 200);
            prompt.remove();
        });
        prompt.find('.prompt_cancel').click(function () {
            closeObject([prompt], 200);
            prompt.remove();
        });
        page.append(prompt);
        openObject([prompt], 200);
    }


    /* Alert:  */

    function createAlertMessage(message){
        let newAlert = alertTemplate.clone();
        newAlert.find('.alert_text').text(message);
        newAlert.find('.alert_confirm').click(function () {
            closeObject([newAlert], 200);
            newAlert.remove();
        });
        content.append(newAlert);
        openObject([newAlert], 200);
    }


    /* General functions */

    function closeObject(objects, timer){
        for(let i = 0; i <objects.length; i++){
            objects[i].fadeOut(timer);
        }
    }

    function openObject(objects, timer){
        for(let i = 0; i <objects.length; i++){
            objects[i].fadeIn(timer);
        }
    }



    function checkTargetFromBrowserOrFromContent(){
        if (targetId < 0){
            targetId = currentLocationId;
        }
    }


    function setMaxLengthOfTitle15Characters(string) {
        if (string.length < 15){
            return string;
        }
        let newString = '';
        for (let i = 0; i < 15; i++){
            newString += string[i];
        }
        return newString;
    }


    function saveSystem() {
        fileSystem.saveInLocalStorage();
        targetId = -1;
    }

    function seperateFilesInsideDirectory(directory, directories, files){
        for (let i = 0; i < directory._items.length; i++){
            if (directory._items[i].getType() === 'folder'){
                directories.push(directory._items[i]);
            } else {
                files.push(directory._items[i]);
            }
        }
    }


    function mergeSort(array, type){
        if (array.length < 2) {
            return array;
        }

        let middle = Math.floor(array.length / 2);
        let left = array.slice(0, middle);
        let right = array.slice(middle);

        switch(type){
            case 'fileName':
                return mergeName(mergeSort(left, 'fileName'), mergeSort(right, 'fileName'));
                break;

            case 'id':
                return mergeId(mergeSort(left, 'id'), mergeSort(right, 'id'));
                break;
        }
    }

    function mergeName(left, right) {
        let result = [];
        let indexLeft = 0;
        let indexRight = 0;

        while (indexLeft < left.length && indexRight < right.length) {
            if (left[indexLeft]._name.toLowerCase() < right[indexRight]._name.toLowerCase()) {
                result.push(left[indexLeft++]);
            } else if (left[indexLeft]._name.toLowerCase() === right[indexRight]._name.toLowerCase()) {
                if ((left[indexLeft].getType() < right[indexRight].getType())) {
                    result.push(left[indexLeft++]);
                } else {
                    result.push(right[indexRight++]);
                }
            }else {
                result.push(right[indexRight++]);
            }
        }
        return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));
    }


    function mergeId(left, right) {
        let result = [];
        let indexLeft = 0;
        let indexRight = 0;

        while (indexLeft < left.length && indexRight < right.length) {
            if (left[indexLeft]._id < right[indexRight]._id) {
                result.push(left[indexLeft++]);
            }else {
                result.push(right[indexRight++]);
            }
        }
        return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));
    }


}