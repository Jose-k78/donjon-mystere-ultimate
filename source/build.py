import pathlib
src = pathlib.Path(__file__).parent / "src"
order = ["data.js", "data_ch2.js", "data_v3.js", "data_story.js", "data_liens.js", "data_sprites.js", "engine.js", "art.js", "storage.js", "sync.js", "donjons.js", "ui.js", "scenes.js", "menus.js", "media.js", "dungeon.js", "wheel.js", "tournoi.js", "royaume.js", "chapitre2.js", "decors3.js", "systemes.js", "histoire.js", "minijeux.js", "parametres.js", "atelier.js", "atelier2.js", "main.js"]
js = "\n".join((src / f).read_text() for f in order)
css = (src / "style.css").read_text()
tpl = (src / "template.html").read_text()
out = tpl.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
dist = pathlib.Path(__file__).parent / "dist"
dist.mkdir(exist_ok=True)
(dist / "donjon-mystere-ultimate.html").write_text(out)
# version de test locale (avec squelette complet)
dbg = '''
window.__dbg = { get G(){return G}, get R(){return R}, hero, partner, heroMove, heroAttack, endTurn, dungeonAct, blocked, stepToward, adjacentFoes, heroOnStairs, goDown, useItem, TL, DG, get SHEET(){return SHEET_OPEN}, get DIALOG(){return DIALOG_OPEN}, closeSheet, enterDungeon, goMap, get LOC(){return LOC}, isUnlocked, maxHP, openMoves, openBag, openTeam, openPause, get SCREEN(){return SCREEN}, unitMoves, ATK: () => ATK, cheb, isVisible, get LOGBUF(){return LOGBUF}, readSpriteFiles, loadSpriteDoc, SPRITES, Store, openAtelier, editMonster, goHub, goMap, goTitle, continueGame, playChapter1End, get BOOT(){return BOOT}, finishBoot, get SC(){return SC}, openHeroMenu, onTap, onLongPress, screenTile, hubAction, openSettings, unitAt, enemyLevel, newGame, makeUnit, pickThieves, renderSlot, mediaSlots, slotFile, slotPixelSize, slugName, drawMonster, monById, get DATA(){return DATA}, openStudio, get MEDIA(){return MEDIA}, loadAllMedia, get MUSIC(){return MUSIC}, setMusic, mapTap, showScreen, playRoom, sleepUntilTomorrow, openQuestBoard, questsToday, genUnknown, freeModeEndRoll, seqRecruitOffer, openAllyBag, openDorm, openBestiary, openSkillShop, teachMove, castMid, get ITEMS(){return ITEMS}, applyItemOutside, statOf, handleKO, stepUnit, isWall, unitAt, endRun, themeOf, locById, goMap, throwItem, useItem, rarityOf, editItem, renderTypeChart, makeWish, typeMult, get MAP_POS(){return MAP_POS}, sceneReset, actor, goRoyaume, get RM(){return RM}, townTap, talkTo, playChapter2Intro, playRegistration, playChapter2End, tourTeam, get WHEEL(){return WHEEL}, openWheel, wheelOptions, chooseWheel, dropItem, pickUpHere, itemUnderHero, seqTourFinal, tourTick, initTournament, rivalAct, doRecruit, arenaDesk, openShop, openInn, partner, recruit, openAtelier, renderAtelier, get ATL(){return ATL}, parseAttackPrompt, fuseAttacks, optimizeStats, importCreatureFiles, Store, SYNC, syncCfg, syncSaveCfg, syncNow, syncBoot, syncStats, syncDownloadAll, syncMarkDirty, syncPushAll, syncCacheInfo, openSettings, renderSettingsTab, SETTINGS, get MEDIA(){return MEDIA}, get SPRITES(){return SPRITES}, get MODS(){return MODS}, get OPTS(){return OPTS}, saveOpts, applyMods, lsGet, lsSet, DONJONS, donjonsTemplate, donjonsSetLocal, donjonsSetRepo, donjonsCheck, donjonsAll, pickSpawn, enemyLevel, enemyPool, storyLoc, genUnknown, currentMods, st3, storyNext, startStoryMission, playCh3Intro, playArc, openGuildMissions, playIceCall, playCh3End, playCh4Intro, playMissionIntro, playCh4Palace, playCh5Intro, playEpilogue, storyCleared, raskUnit, bondAdd, bondRank, talkBond, openBonds, openOathCall, callFriend, canCallOath, openFishing, openGamesHall, playMemory, openWhack, openQuiz, openPrizes, openInvocations, doInvoc, checkTrophies, openTrophies, openSaveSheet, importSaveText, hoopaRing, openQG, palaceFreeMode, GUILD_ARCS, STORY_MISSIONS, CH3, CH4, CH5, EPI, get MINI(){return MINI}, closeMini, catchFish, FISH, enterDungeon, goDown, seqCleared, storyTurnHook, hasOrder, emotionTile, paintPortrait, SPRITE_CONFIG, storyObjectiveTap, townObjective, openFishBook, talkFisher, folkRecruit, castKeyMid };
'''
test_out = out.replace('})();\n</script>', dbg + '})();\n</script>')
assert test_out != out
test = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + test_out + '</body></html>'
(dist / "test.html").write_text(test)
print(len(out), "octets")

# version autonome pour l'ordinateur (sans outils de test)
standalone = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style></head><body>' + out + '</body></html>'
(dist / "DonjonMystereUltimate.html").write_text(standalone)

# application installable (PWA) : index.html + manifest + service worker + icônes
import time, shutil, json as _json
app = dist / "app"; app.mkdir(exist_ok=True)
ver = time.strftime("%Y%m%d-%H%M")
reg = ('<script>window.DMU_VERSION="' + ver + '";if("serviceWorker"in navigator&&location.protocol==="https:"){addEventListener("load",function(){navigator.serviceWorker.register("sw.js").then(function(r){r.update&&r.update();}).catch(function(){});});}</script>')
head = ('<meta name="theme-color" content="#12304a"><link rel="manifest" href="manifest.webmanifest">'
        '<link rel="apple-touch-icon" href="icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes">'
        '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Donjon Mystère">')
appage = standalone.replace('</head>', head + '</head>', 1).replace('</body>', reg + '</body>', 1)
(app / "index.html").write_text(appage)
for f in ["manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png"]:
    shutil.copy(pathlib.Path(__file__).parent / "app" / f, app / f)
(app / "sw.js").write_text((pathlib.Path(__file__).parent / "app" / "sw.js").read_text().replace("__VERSION__", ver))
(app / "version.json").write_text(_json.dumps({"version": ver}))
print("app ->", app, ver)
