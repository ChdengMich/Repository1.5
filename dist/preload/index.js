"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // Add any methods you need
});
