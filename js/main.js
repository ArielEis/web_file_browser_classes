"use strict";

/* Start of local variables */
var page = $('#page');
var content = $('#content');
var browser = $('#browser');
var contentMenu =  $('#content_menu');
var promptTemplate = $('#template_prompt');
var alertTemplate = $('#template_alert');
var openFileWindow = $('#open_file_window');
var address = $('#address_line');
var backwardButton = $('#go_back');
var forwardButton = $('#go_forward');
var newFileMenu = contentMenu.find('#new_file_menu');
var contentMenuTitle = contentMenu.find('#menu_title');
var contentTemplate = content.find('.template');
var browserTemplate = browser.find('.template li');
var currentLocationId = -1;
var targetId = -1;
var historyLog;

/* end of local variables */


(function () {

    historyLog = new History();
    let fileSystem = new FileSystem();
    let ui = new UI(fileSystem);

}());