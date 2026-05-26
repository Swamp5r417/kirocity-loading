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
    bgSwapMin: 7000,
    bgSwapMax: 11000,
    minLiveSceneTime: 9000,
    finalFallbackDelay: 17000
  };

  var phrases = [
    "GARRY'S MOD", "SANDBOX", "GM_CONSTRUCT", "PHYSGUN READY", "TOOLGUN READY",
    "WORKSHOP MOUNTED", "LOADING LUA", "MISSING TEXTURE", "PRESS Q TO SPAWN",
    "PROP SPAWNED", "NPC LIMIT", "RAGDOLL ACTIVE", "ENTITY REMOVED", "NOCLIP ENABLED",
    "DUPES LOADED", "ADVANCED DUPLICATOR", "ULX LOADED", "GMOD TOWER", "NEXTBOT ACTIVE",
    "SERVER CONTENT", "MOUNTING ADDONS", "MAP CLEANUP", "PHYSICS INITIALIZED",
    "SPAWNLIST READY", "HALF-LIFE 2 CONTENT", "SENT CREATED", "SWEP DEPLOYED", "KIROCITY SERVER"
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
    "connect kirocity.net",
    "changegamemode sandbox",
    "load addons\\server_content",
    "load materials\\missing_texture",
    "sv_allowcslua 1",
    "retry workshop_mount",
    "status"
  ];

  var statusSignals = ["weak", "stable", "online", "synced", "ready"];
  var renderModes = ["cmd", "shell", "gmod", "console"];

  var cmdLines = document.getElementById("cmdLines");
  var cmdInput = document.getElementById("cmdInput");
  var phraseLayer = document.getElementById("phraseLayer");
  var signal = document.getElementById("signal");
  var archiveStatus = document.getElementById("archiveStatus");
  var renderStatus = document.getElementById("renderStatus");
  var bgItems = Array.prototype.slice.call(document.querySelectorAll(".bg-media"));
  var finalScreen = document.getElementById("finalScreen");
  var finalWelcome = document.getElementById("finalWelcome");
  var finalBrandWrap = document.getElementById("finalBrandWrap");
  var finalBrand = document.getElementById("finalBrand");
  var activeBgIndex = 0;
  var finalStarted = false;
  var finalTimer = null;
  var startedAt = Date.now();

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function addCmdLine(text, cls) {
    if (finalStarted) return;
    var el = document.createElement("div");
    el.className = "cmd-line" + (cls ? " " + cls : "");
    el.textContent = text;
    cmdLines.appendChild(el);
    while (cmdLines.children.length > 17) {
      cmdLines.removeChild(cmdLines.firstChild);
    }
  }

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
      addCmdLine("C:\\GarrysMod\\KIROCITY>" + cmd, "dim");
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
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, life + 500);
    setTimeout(showPhrase, rand(SETTINGS.phraseDelayMin, SETTINGS.phraseDelayMax));
  }

  function updateStatus() {
    if (finalStarted) return;
    signal.textContent = pick(statusSignals);
    archiveStatus.textContent = pick(["addons", "workshop", "lua", "spawnmenu", "content"]);
    renderStatus.textContent = pick(renderModes);
    setTimeout(updateStatus, randInt(1200, 2600));
  }

  function ensureVideoPlayback() {
    bgItems.forEach(function (item) {
      if (item.tagName === 'VIDEO') {
        item.muted = true;
        item.setAttribute("muted", "");
        item.defaultMuted = true;
        item.autoplay = true;
        item.loop = true;

        function attemptPlay() {
          var playPromise = item.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }

        if (item.readyState >= 2) {
          attemptPlay();
        } else {
          item.addEventListener("loadeddata", attemptPlay, { once: true });
          item.addEventListener("canplay", attemptPlay, { once: true });
        }
      }
    });
  }

  function setInitialBackground() {
    var firstVideoIndex = -1;
    bgItems.forEach(function (item, index) {
      item.classList.remove("active");
      if (firstVideoIndex === -1 && item.tagName === "VIDEO") {
        firstVideoIndex = index;
      }
    });

    activeBgIndex = firstVideoIndex !== -1 ? firstVideoIndex : 0;
    if (bgItems[activeBgIndex]) {
      bgItems[activeBgIndex].classList.add("active");
    }
  }

  function rotateBackground() {
    if (finalStarted || !bgItems.length) return;
    bgItems[activeBgIndex].classList.remove('active');
    activeBgIndex = (activeBgIndex + 1) % bgItems.length;
    bgItems[activeBgIndex].classList.add('active');
    setTimeout(rotateBackground, randInt(SETTINGS.bgSwapMin, SETTINGS.bgSwapMax));
  }

  function beginFinalScene(reason) {
    if (finalStarted) return;
    finalStarted = true;
    if (finalTimer) {
      clearTimeout(finalTimer);
      finalTimer = null;
    }
    cmdInput.textContent = "";
    addCmdLine("final transition: " + reason, "warn");
    document.body.classList.add("finalizing");
    finalScreen.setAttribute("aria-hidden", "false");
    setTimeout(function () { finalWelcome.classList.add("show"); }, 250);
    setTimeout(function () { finalBrandWrap.classList.add("show"); }, 650);
    setTimeout(function () { finalBrand.classList.add("ignite"); }, 1100);
  }

  function requestFinalScene(reason) {
    if (finalStarted || finalTimer) return;
    var elapsed = Date.now() - startedAt;
    var remaining = SETTINGS.minLiveSceneTime - elapsed;
    if (remaining <= 0) {
      beginFinalScene(reason);
      return;
    }

    addCmdLine("final queued: " + reason, "dim");
    finalTimer = setTimeout(function () {
      finalTimer = null;
      beginFinalScene(reason);
    }, remaining);
  }

  function maybeTriggerFromStatus(statusText) {
    var text = String(statusText || "").toLowerCase();
    if (/starting lua|sending client info|client info|spawnmenu|initializing game ui|game ui|sending signon buffer|precaching|lua started/.test(text)) {
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
  addCmdLine("connecting to KIROCITY server profile ... ok", "dim");
  addCmdLine("render profile: monochrome cmd + media bg", "dim");
  addCmdLine("awaiting final stage ...", "warn");

  setInitialBackground();
  ensureVideoPlayback();
  commandLoop();
  setTimeout(showPhrase, 700);
  updateStatus();
  setTimeout(rotateBackground, randInt(SETTINGS.bgSwapMin, SETTINGS.bgSwapMax));
  setTimeout(function () { beginFinalScene("fallback timer"); }, SETTINGS.finalFallbackDelay);
})();
