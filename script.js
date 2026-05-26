(function () {
  "use strict";

  var SETTINGS = {
    cmdTypeSpeedMin: 24,
    cmdTypeSpeedMax: 44,
    cmdPauseMin: 700,
    cmdPauseMax: 1500,
    statusUpdateMin: 1200,
    statusUpdateMax: 2400,
    minLiveSceneTime: 22000,
    finalFallbackDelay: 35000
  };

  var cmdTemplates = [
    "> boot gmod_client --sandbox",
    "mounting workshop collection ... ok",
    "loading lua autorun ... ok",
    "loading gamemode: sandbox",
    "checking server addons ... ok",
    "mounting content: Half-Life 2",
    "mounting content: Counter-Strike Source",
    "verifying materials ... ok",
    "spawning clientside props cache",
    "toolgun module linked",
    "physgun module linked",
    "reading server whitelist",
    "loading playermodel list",
    "binding spawnmenu context",
    "loading entities registry",
    "registering scripted weapons",
    "workshop content mounted",
    "lua state: stable",
    "map preload: gm_construct",
    "event trace: sandbox ready"
  ];

  var promptCommands = [
    "map gm_construct",
    "lua_openscript autorun/client.lua",
    "workshop_download_collection 1",
    "connect novgorod.net",
    "changegamemode sandbox",
    "load addons\\server_content",
    "load materials\\missing_texture",
    "sv_allowcslua 1",
    "retry workshop_mount",
    "status"
  ];

  var statusSignals = ["weak", "stable", "online", "synced", "ready"];
  var renderModes = ["cmd", "shell", "gmod", "console"];
  var archiveModes = ["addons", "workshop", "lua", "spawnmenu", "content"];

  var cmdLines = document.getElementById("cmdLines");
  var cmdInput = document.getElementById("cmdInput");
  var signal = document.getElementById("signal");
  var archiveStatus = document.getElementById("archiveStatus");
  var renderStatus = document.getElementById("renderStatus");
  var finalScreen = document.getElementById("finalScreen");
  var finalWelcome = document.getElementById("finalWelcome");
  var finalBrandWrap = document.getElementById("finalBrandWrap");
  var finalBrand = document.getElementById("finalBrand");

  var finalStarted = false;
  var finalTimer = null;
  var startedAt = Date.now();

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function appendCmdLine(text, cls) {
    if (!cmdLines) return;
    var el = document.createElement("div");
    el.className = "cmd-line" + (cls ? " " + cls : "");
    el.textContent = text;
    cmdLines.appendChild(el);
    while (cmdLines.children.length > 17) {
      cmdLines.removeChild(cmdLines.firstChild);
    }
  }

  function addCmdLine(text, cls) {
    if (!finalStarted) appendCmdLine(text, cls);
  }

  function typePrompt(text, done) {
    if (finalStarted || !cmdInput) return;
    cmdInput.textContent = "";
    var i = 0;

    (function step() {
      if (finalStarted || !cmdInput) return;
      if (i < text.length) {
        cmdInput.textContent += text.charAt(i++);
        setTimeout(step, randInt(SETTINGS.cmdTypeSpeedMin, SETTINGS.cmdTypeSpeedMax));
      } else if (done) {
        setTimeout(done, randInt(160, 320));
      }
    })();
  }

  function commandLoop() {
    if (finalStarted) return;
    var cmd = pick(promptCommands);
    typePrompt(cmd, function () {
      addCmdLine("C:\\GarrysMod\\NOVGOROD>" + cmd, "dim");
      addCmdLine(pick(cmdTemplates), Math.random() > 0.78 ? "warn" : "");
      if (Math.random() > 0.90) addCmdLine("warning: retrying missing dependency lookup", "err");
      if (cmdInput) cmdInput.textContent = "";
      setTimeout(commandLoop, randInt(SETTINGS.cmdPauseMin, SETTINGS.cmdPauseMax));
    });
  }

  function updateStatus() {
    if (finalStarted) return;
    if (signal) signal.textContent = pick(statusSignals);
    if (archiveStatus) archiveStatus.textContent = pick(archiveModes);
    if (renderStatus) renderStatus.textContent = pick(renderModes);
    setTimeout(updateStatus, randInt(SETTINGS.statusUpdateMin, SETTINGS.statusUpdateMax));
  }

  function beginFinalScene(reason) {
    if (finalStarted) return;
    finalStarted = true;
    if (finalTimer) {
      clearTimeout(finalTimer);
      finalTimer = null;
    }
    if (cmdInput) cmdInput.textContent = "";
    appendCmdLine("final transition: " + reason, "warn");
    document.body.classList.add("finalizing");
    if (finalScreen) finalScreen.setAttribute("aria-hidden", "false");
    setTimeout(function () { if (finalWelcome) finalWelcome.classList.add("show"); }, 250);
    setTimeout(function () { if (finalBrandWrap) finalBrandWrap.classList.add("show"); }, 650);
    setTimeout(function () { if (finalBrand) finalBrand.classList.add("ignite"); }, 1100);
  }

  function requestFinalScene(reason) {
    if (finalStarted || finalTimer) return;

    var elapsed = Date.now() - startedAt;
    var remaining = SETTINGS.minLiveSceneTime - elapsed;
    if (remaining <= 0) {
      beginFinalScene(reason);
      return;
    }

    appendCmdLine("final queued: " + reason, "dim");
    finalTimer = setTimeout(function () {
      finalTimer = null;
      beginFinalScene(reason);
    }, remaining);
  }

  function maybeTriggerFromStatus(statusText) {
    var text = String(statusText || "").toLowerCase();
    if (/sending client info|client info|spawnmenu|initializing game ui|game ui|sending signon buffer/.test(text)) {
      requestFinalScene(text);
    }
  }

  window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode) {
    addCmdLine("server: " + servername, "dim");
    addCmdLine("map: " + mapname + " // mode: " + gamemode, "dim");
  };

  window.SetStatusChanged = function (status) {
    if (!finalStarted) {
      addCmdLine("status: " + status, "warn");
      maybeTriggerFromStatus(status);
    }
  };

  window.DownloadingFile = function (fileName) {
    addCmdLine("downloading: " + fileName, "dim");
  };

  window.SetFilesTotal = function (total) {
    addCmdLine("files total: " + total, "dim");
  };

  window.SetFilesNeeded = function (needed) {
    addCmdLine("files needed: " + needed, "dim");
    if (Number(needed) === 0) {
      requestFinalScene("files ready");
    }
  };

  addCmdLine("initializing Garry's Mod shell ... ok", "dim");
  addCmdLine("connecting to NOVGOROD server profile ... ok", "dim");
  addCmdLine("render profile: monochrome cmd", "dim");
  addCmdLine("background mode: disabled for stable loading", "warn");
  addCmdLine("awaiting final stage ...", "dim");

  commandLoop();
  updateStatus();
  setTimeout(function () {
    beginFinalScene("fallback timer");
  }, SETTINGS.finalFallbackDelay);
})();
