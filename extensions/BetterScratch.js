/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(async function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = {};


    if (!Scratch.extensions.unsandboxed) {
        alert("This extension needs to be unsandboxed to run!")
        return
    }

    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "id": "betterscratch16fixed",
                "name": "Better Scratch V1.6 (Fixed)",
                "color1": "#0088ff",
                "color2": "#0063ba",
                "tbShow": true,
                "blocks": blocks,
                "menus": menus
            }
        }
    }
    blocks.push({
        opcode: "ifelsereporter",
        blockType: Scratch.BlockType.REPORTER,
        text: "if [BOOL] return [ONE] else [TWO]",
        arguments: {
            "BOOL": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
            "ONE": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'True!',
            },
            "TWO": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'False!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["ifelsereporter"] = async (args, util) => {
        if (Boolean((args["BOOL"] == true))) {
            return args["ONE"]

        } else {
            return args["TWO"]

        };
    };

    blocks.push({
        opcode: "hexofcolor",
        blockType: Scratch.BlockType.REPORTER,
        text: "HEX of [COLOR]",
        arguments: {
            "COLOR": {
                type: Scratch.ArgumentType.COLOR,
                defaultValue: '#ff0000',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["hexofcolor"] = async (args, util) => {
        return args["COLOR"]
    };

    blocks.push({
        opcode: "notequals",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[ONE]≠[TWO]",
        arguments: {
            "ONE": {
                type: Scratch.ArgumentType.STRING,
            },
            "TWO": {
                type: Scratch.ArgumentType.STRING,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["notequals"] = async (args, util) => {
        return !(args["ONE"] == args["TWO"])
    };

    blocks.push({
        opcode: "waitsomemins",
        blockType: Scratch.BlockType.COMMAND,
        text: "wait [MINS] minutes",
        arguments: {
            "MINS": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["waitsomemins"] = async (args, util) => {
        await new Promise(resolve => setTimeout(resolve, (args["MINS"] * 60000)))
    };

    blocks.push({
        opcode: "waitsomems",
        blockType: Scratch.BlockType.COMMAND,
        text: "wait [NUMBER] ms",
        arguments: {
            "NUMBER": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: '1000',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["waitsomems"] = async (args, util) => {
        await new Promise(resolve => setTimeout(resolve, args["NUMBER"]))
    };

    blocks.push({
        opcode: "unixtimestamp",
        blockType: Scratch.BlockType.REPORTER,
        text: "UNIX timestamp",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["unixtimestamp"] = async (args, util) => {
        return Date.now() * 1 / 1000
    };

    blocks.push({
        opcode: "strandcomment",
        blockType: Scratch.BlockType.REPORTER,
        text: "[TEXTORNUM] // [COMMENT]",
        arguments: {
            "TEXTORNUM": {
                type: Scratch.ArgumentType.STRING,
            },
            "COMMENT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'This is a comment. Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["strandcomment"] = async (args, util) => {
        return args["TEXTORNUM"]
    };

    blocks.push({
        opcode: "boolandcomment",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[BOOLEAN] // [COMMENT]",
        arguments: {
            "BOOLEAN": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
            "COMMENT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'This is a comment. Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["boolandcomment"] = async (args, util) => {
        return args["BOOLEAN"]
    };

    blocks.push({
        opcode: "trueblock",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "true",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["trueblock"] = async (args, util) => {
        return true
    };

    blocks.push({
        opcode: "trueorfalserandom",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "random",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["trueorfalserandom"] = async (args, util) => {
        if (Boolean((Math.floor(Math.random() * (2 - 1 + 1) + 1) == '1'))) {
            return true

        } else {
            return false

        };
    };

    blocks.push({
        opcode: "falseblock",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "false",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["falseblock"] = async (args, util) => {
        return false
    };

    blocks.push({
        opcode: "nullblock",
        blockType: Scratch.BlockType.REPORTER,
        text: "null",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["nullblock"] = async (args, util) => {
        return 'null'
    };

    blocks.push({
        opcode: "booltonum",
        blockType: Scratch.BlockType.REPORTER,
        text: "[BOOL] to number",
        arguments: {
            "BOOL": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["booltonum"] = async (args, util) => {
        if (Boolean((args["BOOL"] == true))) {
            return 1

        } else {
            return 0

        };
    };

    blocks.push({
        opcode: "strtobool",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[STR] to boolean",
        arguments: {
            "STR": {
                type: Scratch.ArgumentType.STRING,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["strtobool"] = async (args, util) => {
        return args["STR"]
    };

    blocks.push({
        opcode: "booltostr",
        blockType: Scratch.BlockType.REPORTER,
        text: "[BOOL] to string",
        arguments: {
            "BOOL": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["booltostr"] = async (args, util) => {
        return args["BOOL"]
    };

    blocks.push({
        opcode: "fetchtourl",
        blockType: Scratch.BlockType.REPORTER,
        text: "Fetch [URL]",
        arguments: {
            "URL": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://example.com',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["fetchtourl"] = async (args, util) => {
        return fetch(args.URL).then(response => response.text()).then(text => text).catch(error => alert('Fetch failed: ' + error));
    };

    blocks.push({
        opcode: "popup",
        blockType: Scratch.BlockType.COMMAND,
        text: "Popup URL: [URL] with width: [WIDTH] and height: [HEIGHT]",
        arguments: {
            "URL": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://example.com',
            },
            "WIDTH": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 400,
            },
            "HEIGHT": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 300,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["popup"] = async (args, util) => {
        window.open(args.URL, 'popup', `width=${args.WIDTH},height=${args.HEIGHT}`);;
    };

    blocks.push({
        opcode: "comment",
        blockType: Scratch.BlockType.COMMAND,
        text: "// [TEXT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'This is a comment. Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["comment"] = async (args, util) => {};

    blocks.push({
        opcode: "jointhreethings",
        blockType: Scratch.BlockType.REPORTER,
        text: "join [ONE] [TWO] [THREE]",
        arguments: {
            "ONE": {
                type: Scratch.ArgumentType.STRING,
            },
            "TWO": {
                type: Scratch.ArgumentType.STRING,
            },
            "THREE": {
                type: Scratch.ArgumentType.STRING,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["jointhreethings"] = async (args, util) => {
        return (args["ONE"] + (args["TWO"] + args["THREE"]))
    };

    blocks.push({
        opcode: "deyxordey",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[DEYONE] xor [DEYTWO]",
        arguments: {
            "DEYONE": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
            "DEYTWO": {
                type: Scratch.ArgumentType.BOOLEAN,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["deyxordey"] = async (args, util) => {
        return Boolean(args["DEYONE"] ^ args["DEYTWO"])
    };

    blocks.push({
        opcode: "equequequ",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[DEYONE] === [DEYTWO]",
        arguments: {
            "DEYONE": {
                type: Scratch.ArgumentType.STRING,
            },
            "DEYTWO": {
                type: Scratch.ArgumentType.STRING,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["equequequ"] = async (args, util) => {
        return (args["DEYONE"] === args["DEYTWO"])
    };

    blocks.push({
        opcode: "isleapyear",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "is leap year?",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["isleapyear"] = async (args, util) => {
        return ((new Date(new Date(Date.now()).getYear(), 1, 29)).getDate() === 29)
    };

    blocks.push({
        opcode: "currentyear",
        blockType: Scratch.BlockType.REPORTER,
        text: "current year",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["currentyear"] = async (args, util) => {
        return (new Date(Date.now()).getFullYear())
    };

    blocks.push({
        opcode: "msfrom",
        blockType: Scratch.BlockType.REPORTER,
        text: "time (ms) since 1970",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["msfrom"] = async (args, util) => {
        return Date.now()
    };

    blocks.push({
        opcode: "geturlparameter",
        blockType: Scratch.BlockType.REPORTER,
        text: "Get URL parameter [NAME]",
        arguments: {
            "NAME": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'parameter',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["geturlparameter"] = async (args, util) => {
        return new URLSearchParams(window.location.search).get("url");
    };

    blocks.push({
        opcode: "pagerefresh",
        blockType: Scratch.BlockType.COMMAND,
        text: "Refresh page",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["pagerefresh"] = async (args, util) => {
        location.reload();;
    };

    blocks.push({
        opcode: "isaleapyear",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "is [YEAR] a leap year?",
        arguments: {
            "YEAR": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2024,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["isaleapyear"] = async (args, util) => {
        return (args.YEAR % 4 === 0 && args.YEAR % 100 !== 0) || args.YEAR % 400 === 0;
    };

    blocks.push({
        opcode: "soundurl",
        blockType: Scratch.BlockType.COMMAND,
        text: "Play sound link [LINK]",
        arguments: {
            "LINK": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://go.shr.lc/3XxaN9p',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["soundurl"] = async (args, util) => {
        new Audio(args.LINK).play();;
    };

    blocks.push({
        opcode: "getstorage",
        blockType: Scratch.BlockType.REPORTER,
        text: "Get storage [STORAGE]",
        arguments: {
            "STORAGE": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Storage 1',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["getstorage"] = async (args, util) => {
        return localStorage.getItem(args["STORAGE"])
    };

    blocks.push({
        opcode: "store",
        blockType: Scratch.BlockType.COMMAND,
        text: "Store [VALUE] value to [STORAGE] storage",
        arguments: {
            "VALUE": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
            "STORAGE": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Storage 1',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["store"] = async (args, util) => {
        localStorage.setItem(args["STORAGE"], args["VALUE"])
    };

    blocks.push({
        opcode: "pi",
        blockType: Scratch.BlockType.REPORTER,
        text: "π",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["pi"] = async (args, util) => {
        return '3.14159265359'
    };

    blocks.push({
        opcode: "eiler",
        blockType: Scratch.BlockType.REPORTER,
        text: "e",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["eiler"] = async (args, util) => {
        return '2.71828182846'
    };

    blocks.push({
        opcode: "consoleerror",
        blockType: Scratch.BlockType.COMMAND,
        text: "Error [TEXT] to console",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["consoleerror"] = async (args, util) => {
        console.error(args["TEXT"]);
    };

    blocks.push({
        opcode: "consolewarn",
        blockType: Scratch.BlockType.COMMAND,
        text: "Warn [TEXT] to console",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["consolewarn"] = async (args, util) => {
        console.warn(args["TEXT"]);
    };

    blocks.push({
        opcode: "consolelog",
        blockType: Scratch.BlockType.COMMAND,
        text: "Log [TEXT] to console",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["consolelog"] = async (args, util) => {
        console.log(args["TEXT"]);
    };

    blocks.push({
        opcode: "urlforward",
        blockType: Scratch.BlockType.COMMAND,
        text: "Redirect to forward URL",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["urlforward"] = async (args, util) => {
        history.forward();;
    };

    blocks.push({
        opcode: "urlback",
        blockType: Scratch.BlockType.COMMAND,
        text: "Redirect to previous URL",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["urlback"] = async (args, util) => {
        history.back();;
    };

    blocks.push({
        opcode: "jsreporter",
        blockType: Scratch.BlockType.REPORTER,
        text: "Run [CODE] with JS",
        arguments: {
            "CODE": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'prompt(\"How are you?\")',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["jsreporter"] = async (args, util) => {
        return eval(args.CODE);
    };

    blocks.push({
        opcode: "jsblock",
        blockType: Scratch.BlockType.COMMAND,
        text: "Run [CODE] with JS",
        arguments: {
            "CODE": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'alert(\"Hello, World!\")',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["jsblock"] = async (args, util) => {
        eval(args.CODE);;
    };

    blocks.push({
        opcode: "confirm",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "Confirm [TEXT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Is a green apple green?',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["confirm"] = async (args, util) => {
        return confirm(args["TEXT"])
    };

    blocks.push({
        opcode: "prompt",
        blockType: Scratch.BlockType.REPORTER,
        text: "Prompt [TEXT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Is a green apple green?',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["prompt"] = async (args, util) => {
        return prompt(args["TEXT"])
    };

    blocks.push({
        opcode: "alert",
        blockType: Scratch.BlockType.COMMAND,
        text: "Alert [TEXT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["alert"] = async (args, util) => {
        alert(args["TEXT"])
    };

    blocks.push({
        opcode: "urlmanagement",
        blockType: Scratch.BlockType.COMMAND,
        text: "[REORTAB] [URI]",
        arguments: {
            "REORTAB": {
                type: Scratch.ArgumentType.STRING,
                menu: 'REORTAB'
            },
            "URI": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://example.com',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["urlmanagement"] = async (args, util) => {
        if (Boolean((args["REORTAB"] == 'Redirect'))) {
            window.location.href = args.URI;;

        } else {
            if (Boolean((args["REORTAB"] == 'New tab'))) {
                window.open(args.URI, '_blank');;
            };

        };
    };

    blocks.push({
        opcode: "wordsintext",
        blockType: Scratch.BlockType.REPORTER,
        text: "amount of words in [TEXT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["wordsintext"] = async (args, util) => {
        return String(args.TEXT).split(/\s+/).filter(word => word !== '').length;
    };

    menus["REORTAB"] = {
        acceptReporters: false,
        items: [...[...[], 'Redirect'], 'New tab']
    }

    blocks.push({
        opcode: "lessorequal",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[ONE]≤[TWO]",
        arguments: {
            "ONE": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: '1',
            },
            "TWO": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: '2',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["lessorequal"] = async (args, util) => {
        return ((args["ONE"] == args["TWO"]) || (args["ONE"] < args["TWO"]))
    };

    blocks.push({
        opcode: "greaterorequal",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[ONE]≥[TWO]",
        arguments: {
            "ONE": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2,
            },
            "TWO": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["greaterorequal"] = async (args, util) => {
        return ((args["ONE"] == args["TWO"]) || (args["ONE"] > args["TWO"]))
    };

    blocks.push({
        opcode: "jsboolean",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "Run [CODE] with JS",
        arguments: {
            "CODE": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'confirm(\"Is a green apple green?\")',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["jsboolean"] = async (args, util) => {
        return eval(args.CODE);
    };

    menus["infinityselection"] = {
        acceptReporters: false,
        items: [...[...[], 'Positive'], 'Negative']
    }

    blocks.push({
        opcode: "removelocal",
        blockType: Scratch.BlockType.COMMAND,
        text: "Remove local storage [STORAGE]",
        arguments: {
            "STORAGE": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Storage 1',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["removelocal"] = async (args, util) => {
        localStorage.removeItem(args.STORAGE);;
    };

    blocks.push({
        opcode: "promptwithdefault",
        blockType: Scratch.BlockType.REPORTER,
        text: "Prompt [TEXT] with default: [DEFAULT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'How are you?',
            },
            "DEFAULT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'I\'m okay.',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["promptwithdefault"] = async (args, util) => {
        return prompt(args.TEXT, args.DEFAULT)
    };

    blocks.push({
        opcode: "totitlecase",
        blockType: Scratch.BlockType.REPORTER,
        text: "[TEXT] to title case",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello, world!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["totitlecase"] = async (args, util) => {
        return String(args.TEXT).toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    blocks.push({
        opcode: "infinity",
        blockType: Scratch.BlockType.REPORTER,
        text: "[POSORNEG] Infinity",
        arguments: {
            "POSORNEG": {
                type: Scratch.ArgumentType.STRING,
                menu: 'infinityselection'
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["infinity"] = async (args, util) => {
        if (Boolean((args["POSORNEG"] == 'Positive'))) {
            return 'Infinity'

        } else {
            return '-Infinity'

        };
    };

    blocks.push({
        opcode: "lowercasetext",
        blockType: Scratch.BlockType.REPORTER,
        text: "[TEXT] to lowercase",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'HELLO, WORLD!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["lowercasetext"] = async (args, util) => {
        return String(args.TEXT).toLowerCase();
    };

    blocks.push({
        opcode: "uppercasetext",
        blockType: Scratch.BlockType.REPORTER,
        text: "[TEXT] to uppercase",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello, world!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["uppercasetext"] = async (args, util) => {
        return String(args.TEXT).toUpperCase();
    };

    blocks.push({
        opcode: "endWith",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[TEXT] ends with [SUFFIX]?",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
            "SUFFIX": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'd!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["endWith"] = async (args, util) => {
        return String(args.TEXT).endsWith(String(args.SUFFIX));
    };

    blocks.push({
        opcode: "startWith",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[TEXT] starts with [PREFIX]?",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
            "PREFIX": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'He',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["startWith"] = async (args, util) => {
        return String(args.TEXT).startsWith(String(args.PREFIX));
    };

    blocks.push({
        opcode: "replacetext",
        blockType: Scratch.BlockType.REPORTER,
        text: "Replace [OLD] with [NEW] in [TEXT]",
        arguments: {
            "OLD": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'World',
            },
            "NEW": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Scratch',
            },
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["replacetext"] = async (args, util) => {
        return String(args.TEXT).replace(String(args.OLD), String(args.NEW));
    };

    blocks.push({
        opcode: "trimwhitespacefromtext",
        blockType: Scratch.BlockType.REPORTER,
        text: "Trim whitespace from [TEXT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '  Hello, World!  ',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["trimwhitespacefromtext"] = async (args, util) => {
        return String(args.TEXT).trim();
    };

    blocks.push({
        opcode: "substringtext",
        blockType: Scratch.BlockType.REPORTER,
        text: "Substring of [TEXT] from [START] to [END]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
            "START": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
            },
            "END": {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5,
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["substringtext"] = async (args, util) => {
        const start = Math.max(0, args.START);;
        const end = Math.min(args.TEXT.length, args.END);;
        return String(args.TEXT).substring(start, end);
    };

    blocks.push({
        opcode: "reversetext",
        blockType: Scratch.BlockType.REPORTER,
        text: "Reverse [TEXT]",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '!dlroW ,olleH',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["reversetext"] = async (args, util) => {
        return String(args.TEXT).split('').reverse().join('');
    };

    blocks.push({
        opcode: "tosentencecase",
        blockType: Scratch.BlockType.REPORTER,
        text: "[TEXT] to sentence case",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello, World!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["tosentencecase"] = async (args, util) => {
        return String(args.TEXT).charAt(0).toUpperCase() + String(args.TEXT).slice(1).toLowerCase();
    };

    blocks.push({
        opcode: "startWithIgnoreCase",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "[TEXT] starts with [PREFIX] (ignore case)?",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
            "PREFIX": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'he',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["startWithIgnoreCase"] = async (args, util) => {
        const text = String(args.TEXT).toLowerCase();;
        const prefix = String(args.PREFIX).toLowerCase();;
        return text.startsWith(prefix);
    };

    blocks.push({
        opcode: "endWithIgnoreCase",
        blockType: Scratch.BlockType.REPORTER,
        text: "[TEXT] ends with [SUFFIX] (ignore case)?",
        arguments: {
            "TEXT": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
            },
            "SUFFIX": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'D!',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["endWithIgnoreCase"] = async (args, util) => {
        const text = String(args.TEXT).toLowerCase();;
        const suffix = String(args.SUFFIX).toLowerCase();;
        return text.endsWith(suffix);
    };

    Scratch.extensions.register(new Extension());
})(Scratch);