import kaplay from "kaplay";
import "kaplay/global";
import sayText from "./speaker.js";

kaplay();
loadSprite("me", "png/buisnas_man_icon.png")
loadSprite("aunt", "png/helper_icon.png")
loadSprite("friend", "png/vrag_icon.png")

loadSprite("speaker-bg", "png/dialog_window.png")
loadSprite("city", "png/city.png")
loadSprite("shop-empty", "png/knnigni_magazin_pustioi.png")
loadSprite("shop-full", "png/knnigini_magazin_polni.png")
loadSprite("up", "sprites/strelka_vverh.png")
loadSprite("big-city", "png/city_map.png")
loadSprite("logo", "png/menu.png")

loadSprite("200", "png/200K.png")
loadSprite("100", "png/100K.png")
loadSprite("50", "png/50K.png")
loadSprite("25", "png/25K.png")

loadSprite("card-back", "rezume/rezume.png")
loadSprite("vasya", "rezume/skuf.png")
loadSprite("petya", "rezume/shavelij.png")
loadSprite("masha", "rezume/WOMANHAHA.png")
loadSprite("dasha", "rezume/babka_granny.png")
loadSprite("kirill", "rezume/pank.png")

loadSprite("amogus", "gazeta/amogus.png")
loadSprite("aviasales", "gazeta/aviasales.png")
loadSprite("gazeta", "gazeta/gazeta.png")
loadSprite("gorod", "gazeta/gorod.png")
loadSprite("grafik", "gazeta/grafik.png")
loadSprite("hamburger", "gazeta/hamburger.png")
loadSprite("krug", "gazeta/krug.png")
loadSprite("ruki", "gazeta/ruki.png")

loadSprite("hair", "png/haircut.png")
loadSprite("cafe", "png/coffe.png")
loadSprite("dress", "png/odezda.png")
loadSprite("book", "png/bookshop.png")
loadSprite("button", "png/button.png")

loadFont("basic", "zelda.ttf")
loadMusic("bg-music", "audio/music.wav")

loadSound("button", "audio/button.wav")
loadSound("click", "audio/click.wav")
loadSound("bad", "audio/bad.wav")
loadSound("good", "audio/good.wav")
loadSound("me", "audio/man_vox.wav")
loadSound("aunt", "audio/woman_vox.wav")
loadSound("friend", "audio/man_vox.wav")

let currentDragging = null;
let currentPile = null;
let talking = false;

function money(sum) {
    return {
        id: "money",
        money() {
            return sum;
        }
    }
}

function pile(canAttachPredicate) {
    let children = [];

    return {
        id: "pile",
        require: ["area"],
        add() {
            this.onHover(() => currentPile = this)

            this.onHoverEnd(() => {
                if (currentPile === this)
                    currentPile = null;
            })
        },
        canAttach(elem) {
            return canAttachPredicate(elem)
        },
        attach(elem) {
            elem.pile = this
            children.push(elem);
        },
        detach(elem) {
            children = children.filter(e => e !== elem)
            console.log(this, children)
        },
        getChildren() {
            return children;
        },
        money() {
            return this.getChildren().map(e => e.money()).reduce((a, b) => a + b, 0);
        }
    }
}

function drag() {
    let offset = null;
    let pile = null;

    return {
        id: "drag",
        require: ["area", "pos"],
        onDrag() {
            if (currentDragging)
                return;

            if (!this.isClicked())
                return;

            readd(this)

            currentDragging = this
            offset = mousePos().sub(this.pos)

            this.use("dragging")
        },
        onDragEnd() {
            if (currentPile !== null && currentPile !== pile && currentPile.canAttach(this)) {
                if (pile)
                    pile.detach(this)
                pile = currentPile
                pile.attach(this)
            }

            this.unuse("dragging")
        },
        update() {
            if (currentDragging === this)
                this.pos = mousePos().sub(offset)
        }
    }
}

function hbox() {
    return {
        id: "hbox",
        require: ["pile"],

        update() {

            let children = this.getChildren().filter(e => !e.is("dragging"))
            let offset = this.width / (children.length + 3)

            for (let i = 0; i < children.length; i++) {
                let c = children[i];
                c.pos.y = this.pos.y + this.height / 2
                c.pos.x = this.pos.x + this.width / 2 - ((children.length - 1) / 2 - i) * offset;
            }
        }
    }
}

function pileCounter(propName, label = "") {
    let counter = null;

    return {
        id: "pileCounter",
        require: ["pile"],
        add() {
            counter = make([
                text("", {width: this.width - 50, align: "center"}),
                pos(this.pos.x + this.width / 2, this.pos.y - 40),
                anchor("center"),
                z(1),
                color(0, 0, 0)
            ])
            add(counter)
        },
        update() {
            counter.text = label
            if (typeof this[propName] === "function") {
                counter.text += this[propName]();
            } else {
                counter.text += this[propName];
            }
        },
        destroy() {
            counter.destroy()
        }
    }
}

let fader = add([
    opacity(1),
    rect(width(), height()),
    color(0, 0, 0),
    stay(),
    timer(),
    z(100000),
    "fader",
])

async function goWithFade(scene, ...args) {
    fader.trigger("beforeSceneLeave")
    await wait(0.5)
    go(scene, ...args)
}

fader.on("beforeSceneLeave", () => fader.tween(0, 1, 0.5, v => fader.opacity = v))
fader.on("sceneEnter", () => fader.tween(1, 0, 0.5, v => fader.opacity = v))

scene("menu", async () => {
    add([
        sprite("logo", {width: width(), height: height()}),
    ])

    let button = add([
        sprite("button", {width: 300}),
        area(),
        pos(300, center().y - 50),
        anchor("center"),
        "button"
    ])

    button.add([
        text("Начать игру"),
        anchor("center"),
        color(0, 0, 0),
    ])

    button.onClick(async () => {
        play("bg-music", {loop: true})
        get("button").forEach(e => e.destroy())
        await sayText("Привет, дорогой, я приехала!", "aunt")
        await sayText("Тётя Мэри! Как давно не виделись!", "me")
        await sayText("Здравствуйте", "friend")
        await sayText("О, и твой друг здесь", "aunt")
        await sayText("Сегодня мы будем с вами открывать бизнес!", "aunt")
        await sayText("Вау, вот это да!", "me")
        goWithFade("level_01")
    })

    let exit = make([
        sprite("button", {width: 300}),
        area(),
        pos(300, center().y + 50),
        anchor("center"),
        "button"
    ])

    exit.add([
        text("Выйти"),
        anchor("center"),
        color(0, 0, 0),
    ])
})


goWithFade("menu")