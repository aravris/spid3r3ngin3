/*

*    ____            _       _   _____          _____                   _           _____ 
    / ___|   _ __   (_)   __| | |___ /   _ __  |___ /   _ __     __ _  (_)  _ __   |___ / 
    \___ \  | '_ \  | |  / _` |   |_ \  | '__|   |_ \  | '_ \   / _` | | | | '_ \    |_ \ 
*    ___) | | |_) | | | | (_| |  ___) | | |     ___) | | | | | | (_| | | | | | | |  ___) |
    |____/  | .__/  |_|  \__,_| |____/  |_|    |____/  |_| |_|  \__, | |_| |_| |_| |____/ 
            |_|                                                 |___/         
            


    version 2! this rewrite has been in the works forever AHAH

    still no docs... sorry yall :(
    made with <3 by addy

*/

// imports

import {default as eventBusClass} from "./components/eventBus.js";
import {default as renderingClass} from "./components/rendering.js";
import {default as objectTypes} from "./components/classes/types.js";

// app

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("#root");

    if (root) {
        const eventBus = new eventBusClass();
        const rendering = new renderingClass(root);
        const types = new objectTypes();

        let randomTxt = [
            "smoke responsibly",
            "a web rendering engine that's not as neat as a spider web",
            "vriska did everything wrong",
            "it's by a girl",
            "i mean you can steal it if you wanna",
            ":P",
            "Hi my name is Snapple",
            "i want love.",
            "shoutout mimi",
            "antlergirl makes cool music"
        ]

        const backdrop = rendering.layers.addLayer("backdrop", [
            new types.rect(
                "backdrop", 
                "#005682", 
                true,
                {scale: 0, offset: 0},
                {scale: 0, offset: 0},
                {scale: 1, offset: 0},
                {scale: 1, offset: 0},
                {x: 0, y: 0}
            )
        ], undefined, true, false, 0)
        const scene = rendering.layers.addLayer("scene", [
            new types.image(
                "label", 
                "/public/img/vriska_plush.png",
                true,
                {scale: 0.5, offset: 0},
                {scale: 0.5, offset: 0},
                {scale: 0.5, offset: 0},
                {scale: 0.5, offset: 0},
                {x: 0.5, y: 0.5},
                1
            ),
            new types.text(
                "title",
                "spid3r3ngin3",
                true,
                {scale: 0.5, offset: 0},
                {scale: 0.75, offset: 16},
                "center",
                "#fff",
                `bold 30px monospace`
            ),
            new types.text(
                "title",
                randomTxt[Math.floor(Math.random() * randomTxt.length)],
                true,
                {scale: 0.5, offset: 0},
                {scale: 0.75, offset: 46},
                "center",
                "#fff",
                `20px monospace`,
                400
            )
        ], undefined, true, true, 1)
    }
})