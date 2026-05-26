(function () {
  "use strict";
  var SETTINGS = {
    phraseDelayMin: 1200,
    phraseDelayMax: 2500,
    phraseLifeMin: 4200,
    phraseLifeMax: 7600,
    cmdTypeSpeedMin: 24,
    cmdTypeSpeedMax: 48,
    cmdPauseMin: 700,
    cmdPauseMax: 1600,
    finalFallbackDelay: 17000,
    bgSwapMin: 4200,
    bgSwapMax: 7600
  };
  var phrases = [
    "GARRY'S MOD", "SANDBOX", "GM_CONSTRUCT", "PHYSGUN READY", "TOOLGUN READY",
    "WORKSHOP MOUNTED", "LOADING LUA", "MISSING TEXTURE", "PRESS Q TO SPAWN",
    "PROP SPAWNED", "NPC LIMIT", "RAGDOLL ACTIVE", "ENTITY REMOVED", "NOCLIP ENABLED",
    "DUPES LOADED", "ADVANCED DUPLICATOR", "ULX LOADED", "NEXTBOT ACTIVE",
    "SERVER CONTENT", "MOUNTING ADDONS", "MAP CLEANUP", "PHYSICS INITIALIZED",
    "SPAWNLIST READY", "HALF-LIFE 2 CONTENT", "SENT CREATED", "SWEP DEPLOYED", "NOVGOROD SERVER"
  ];
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
  var cmdWindow = document.getElementById("cmdWindow");
  var cmdHeader = document.getElementById("cmdHeader");
  var cmdLines = document.getElementById("cmdLines");
  var cmdInput = document.getElementById("cmdInput");
  var phraseLayer = document.getElementById("phraseLayer");
  var signal = document.getElementById("signal");
  var archiveStatus = document.getElementById("archiveStatus");
  var renderStatus = document.getElementById("renderStatus");
  var finalScreen = document.getElementById("finalScreen");
  var finalWelcome = document.getElementById("finalWelcome");
  var finalBrandWrap = document.getElementById("finalBrandWrap");
  var finalBrand = document.getElementById("finalBrand");
  var backgrounds = Array.prototype.slice.call(document.querySelectorAll('.bg-media'));
  var activeBackgroundIndex = 0;
  var finalStarted = false;
  var dragState = null;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function appendCmdLine(text, cls) {
    var el = document.createElement("div");
    el.className = "cmd-line" + (cls ? " " + cls : "");
    el.textContent = text;
    cmdLines.appendChild(el);
    while (cmdLines.children.length > 17) cmdLines.removeChild(cmdLines.firstChild);
  }
  function addCmdLine(text, cls) { if (!finalStarted) appendCmdLine(text, cls); }

  function typePrompt(text, done) {
    if (finalStarted) return;
    cmdInput.textContent = "";
    var i = 0;
    (function step() {
      if (finalStarted) return;
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
      if (Math.random() > 0.88) addCmdLine("warning: missing addon dependency detected", "err");
      cmdInput.textContent = "";
      setTimeout(commandLoop, randInt(SETTINGS.cmdPauseMin, SETTINGS.cmdPauseMax));
    });
  }

  function showPhrase() {
    if (finalStarted) return;
    var el = document.createElement("div");
    el.className = "bg-phrase show";
    el.textContent = pick(phrases);
    el.style.left = rand(4, 86).toFixed(1) + "%";
    el.style.top = rand(4, 90).toFixed(1) + "%";
    el.style.setProperty("--rot", rand(-5, 5).toFixed(1) + "deg");
    var life = rand(SETTINGS.phraseLifeMin, SETTINGS.phraseLifeMax);
    el.style.setProperty("--life", life + "ms");
    el.style.fontSize = randInt(10, 17) + "px";
    phraseLayer.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, life + 500);
    setTimeout(showPhrase, rand(SETTINGS.phraseDelayMin, SETTINGS.phraseDelayMax));
  }

  function updateStatus() {
    if (finalStarted) return;
    signal.textContent = pick(statusSignals);
    archiveStatus.textContent = pick(["addons", "workshop", "lua", "spawnmenu", "content"]);
    renderStatus.textContent = pick(renderModes);
    setTimeout(updateStatus, randInt(1200, 2600));
  }

  function rotateBackground() {
    if (finalStarted || backgrounds.length < 2) return;
    backgrounds[activeBackgroundIndex].classList.remove('active');
    activeBackgroundIndex = (activeBackgroundIndex + 1) % backgrounds.length;
    backgrounds[activeBackgroundIndex].classList.add('active');
    setTimeout(rotateBackground, randInt(SETTINGS.bgSwapMin, SETTINGS.bgSwapMax));
  }

  function beginFinalScene(reason) {
    if (finalStarted) return;
    appendCmdLine("final transition: " + reason, "warn");
    finalStarted = true;
    cmdInput.textContent = "";
    document.body.classList.add("finalizing");
    finalScreen.setAttribute("aria-hidden", "false");
    setTimeout(function () { finalWelcome.classList.add("show"); }, 250);
    setTimeout(function () { finalBrandWrap.classList.add("show"); }, 650);
    setTimeout(function () { finalBrand.classList.add("ignite"); }, 1100);
  }

  function maybeTriggerFromStatus(statusText) {
    var text = String(statusText || "").toLowerCase();
    if (/starting lua|sending client info|client info|spawnmenu|initializing game ui|game ui|sending signon buffer|precaching|lua started/.test(text)) beginFinalScene(text);
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function moveWindowTo(left, top) {
    var width = cmdWindow.offsetWidth;
    var height = cmdWindow.offsetHeight;
    var maxLeft = Math.max(0, window.innerWidth - width);
    var maxTop = Math.max(0, window.innerHeight - height);
    var clampedLeft = clamp(left, 0, maxLeft);
    var clampedTop = clamp(top, 0, maxTop);
    cmdWindow.style.left = clampedLeft + 'px';
    cmdWindow.style.top = clampedTop + 'px';
    cmdWindow.style.transform = 'none';
  }

  function onDragMove(event) {
    if (!dragState || finalStarted) return;
    moveWindowTo(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
  }

  function stopDrag() {
    if (!dragState) return;
    dragState = null;
    cmdWindow.classList.remove('dragging');
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', stopDrag);
  }

  cmdHeader.addEventListener('mousedown', function (event) {
    if (finalStarted) return;
    var rect = cmdWindow.getBoundingClientRect();
    dragState = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    cmdWindow.classList.add('dragging');
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', stopDrag);
  });

  window.addEventListener('resize', function () {
    if (cmdWindow.style.transform === 'none') {
      var rect = cmdWindow.getBoundingClientRect();
      moveWindowTo(rect.left, rect.top);
    }
  });

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
  window.DownloadingFile = function (fileName) { addCmdLine("downloading: " + fileName, "dim"); };
  window.SetFilesTotal = function (total) { addCmdLine("files total: " + total, "dim"); };
  window.SetFilesNeeded = function (needed) {
    addCmdLine("files needed: " + needed, "dim");
    if (Number(needed) === 0) beginFinalScene("files ready");
  };

  addCmdLine("initializing Garry's Mod shell ... ok", "dim");
  addCmdLine("connecting to NOVGOROD server profile ... ok", "dim");
  addCmdLine("render profile: monochrome cmd + multi bg", "dim");
  addCmdLine("background pack: vietnam weapons // 5 images", "warn");
  addCmdLine("hint: drag the cmd window by the top bar", "dim");

  commandLoop();
  setTimeout(showPhrase, 700);
  updateStatus();
  if (backgrounds.length > 1) setTimeout(rotateBackground, randInt(SETTINGS.bgSwapMin, SETTINGS.bgSwapMax));
  setTimeout(function () { beginFinalScene("fallback timer"); }, SETTINGS.finalFallbackDelay);
})();
