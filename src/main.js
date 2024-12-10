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

scene("level_01", async () => {
    add([
        sprite("city", {width: width(), height: height()})
    ])


    function house(say, right, spriteName, posArr) {
        let a = add([
            sprite(spriteName, {width: 200}),
            anchor("center"),
            pos(posArr[0], posArr[1]),
            area()
        ])

        a.onClick(async () => {
            if (talking) return
            if (a.is("disabled")) return;

            a.use("disabled")
            a.use(color(50, 50, 50))
            talking = true
            await sayText(say, "aunt")
            talking = false
            if (right) {
                a.trigger("right")
            }
        })
        return a
    }

    house("Я думаю, парикмахерская не лучший вариант. Тебе нужны первичные навыки, поскольку работников сразу не наймешь. Давай попробуем другой вариант", false, "hair", [center().x - 150, center().y - 150])
    house("Кафе звучит здорово, но подумай, сколько мороки: чистота кухни, санитарные книжки - жуть. Давай попробуем другой вариант", false, "cafe", [center().x - 150, center().y + 150])
    house("Ты можешь заработать много с брендовой одежды, но не здесь, дорогой", false, "dress", [center().x + 150, center().y - 150])
    let bookshop = house("Книжный магазин? Хорошая идея: просто, прибыльно и интересно, а самое главное - ты можешь передать свою любовь к чтению другим!", true, "book", [center().x + 150, center().y + 150])
    bookshop.on("right", async () => {
        await sayText("Уфф, я лучше сделаю кафе, их тут много, значит прибыльно", "friend")
        await goWithFade("level_02")
    })

    talking = true
    await sayText("Для начала выберем индустрию, в которой откроем свое\nдело!", "aunt")
    talking = false
})

scene("level_02", async () => {
    let bg = add([
        sprite("shop-empty", {width: width(), height: height()})
    ])


    let mainPile = add([
        rect(600, 250),
        area(),
        color(40, 80, 80),
        pos(center().x - 300, 100),
        pile(() => true),
        hbox(),
        pileCounter("money", "Запасы: ")
    ])

    let aPile = add([
        rect(300, 200),
        area(),
        color(40, 80, 80),
        pos(center().x - 150 - 300 - 70, 450),
        pile(() => true),
        hbox(),
        pileCounter("money", "Помещение: ")
    ])

    let bPile = add([
        rect(300, 200),
        area(),
        color(40, 80, 80),
        pos(center().x - 150, 450),
        pile(() => true),
        hbox(),
        pileCounter("money", "Книги: ")
    ])

    let cPile = add([
        rect(300, 200),
        area(),
        color(40, 80, 80),
        pos(center().x - 150 + 300 + 70, 450),
        pile(() => true),
        hbox(),
        pileCounter("money", "Наём: ")
    ])


    function createMoney(spr, sum) {
        currentPile = mainPile
        let e = make([
            sprite(spr, {width: 142}),
            pos(50, 50),
            area(),
            drag(),
            anchor("center"),
            money(sum),
            rotate(90)
        ])
        e.onDragEnd()

        currentPile = null
        return e
    }

    add(createMoney("200", 200000))
    add(createMoney("50", 50000))

    for (let i = 0; i < 11; i++)
        add(createMoney("100", 100000))

    for (let i = 0; i < 6; i++)
        add(createMoney("25", 25000))


    let checkButton = add([
        pos(center().x, height() - 100),
        sprite("button", {width: 250}),
        anchor("center"),
        area(),
    ])
    checkButton.add([
        text("Проверить", {width: 250, align: "center"}),
        anchor("center"),
        color(0, 0, 0),
    ])

    checkButton.onClick(() => {
        checkButton.trigger("check")
    })


    onMouseDown(() => {
        get("drag").forEach(e => e.onDrag())
    })

    onMouseRelease(() => {
        if (currentDragging)
            currentDragging.onDragEnd()
        currentDragging = null
    })

    checkButton.on("check", async () => {
        talking = true;

        if (mainPile.money() === 75000 && aPile.money() === 1050000 && bPile.money() === 225000 && cPile.money() === 150000) {
            bg.sprite = "shop-full"
            await sayText("Хмм... Выглдяит правильно! Так держать", "aunt")
            await sayText("Да ну, все вложу в продукты и помещение, так быстрее окуплюсь", "friend")
            await sayText("Ну-ну, посмотрим", "aunt")
            goWithFade("level_03")
        } else {
            await sayText("Хмм... Кажется, ты где-то ошибся в расчетах", "aunt")
            await sayText("Давай ещё раз: 70% на помещение, 15% на первые книги, 10% на наём сотрудников и 5% оставить на всякий случай", "aunt")
        }

        talking = false
    })
    talking = true
    await sayText("Теперь давай перейдём к финансированию", "aunt")
    await sayText("Ты ведь знаешь, насколько важно правильно распределить бюджет, чтобы твой бизнес имел хорошие шансы на успех?", "aunt")
    await sayText("Да, я понимаю, что выбор распределения бюджета будет критически важен. Как мы распределим финансы?", "me")
    await sayText("Хороший вопрос! Сначала давай подумаем о самой аренде. Я рекомендую выделить не более 70% на аренду.", "aunt")
    await sayText("Это позволит тебе иметь финансовую подушку на случай непредвиденных расходов.", "aunt")
    await sayText("Это звучит разумно. А сколько же нам выделить на товар и остальные нужды?", "me")
    await sayText("Вот тут главная часть. Отведи 15% на товары, которые ты собираешься продавать, и 10% на наём.", "aunt")
    await sayText("Это даст тебе возможность быстро адаптироваться, если что-то пойдёт не так.", "aunt")
    await sayText("У меня есть 1,5 млн. рублей и мне нужно распределить эти финансы ...", "aunt")
    talking = false

})



scene("level_05", async () => {
    let map = add([
        sprite("big-city", {width: width(), height: height()})
    ])

    function createData(print, tag, description, position) {
        let button = make([
            sprite("button", {width: 200, height: 150}),
            area(),
            pos(position),
            anchor("center"),
            scale(0.7),
            tag
        ])

        let txt = button.add([
            text(print, {width: 140, align: "center", size: 22}),
            anchor("center"),
            color(0, 0, 0),
            pos(0, -40)
        ])

        let desc = button.add([
            text(description, {width: 175, align: "center", size: 16}),
            anchor("center"),
            color(0, 0, 0),
            pos(0, 10)
        ])

        button.onClick(() => {
            if (talking) return
            if (button.is("disabled")) return

            map.trigger(tag)
        })

        return button
    }add(createData("Лыкино", "far", "В этой области нет книжных магазинов", vec2(250, 75)))
    add(createData("Пуськино", "far", "В этой области нет книжных магазинов", vec2(800, 140)))
    add(createData("Черепушкино", "more", "В этой области 5 книжных магазинов", vec2(600, 350)))
    add(createData("Панки", "good", "В этой области 1 книжный магазин", vec2(650, 550)))
    add(createData("Бубульки", "more", "В этой области 4 книжных магазина", vec2(260, 350)))
    add(createData("Пасека", "more", "В этой области 8 книжных магазинов", vec2(500, 700)))
    add(createData("Дублинки", "good", "В этой области нет книжных магазинов", vec2(200, 700)))
    add(createData("Порт", "far", "В этой области нет книжных магазинов", vec2(900, 700)))
    add(createData("Огарёво", "far", "В этой области нет книжных магазинов", vec2(width() - 100, 250)))


    map.on("far", async () => {
        get("far").forEach(e => {
            e.use("disabled")
            e.use(color(50, 50, 50))
        })
        talking = true
        await sayText("Прекрасное место, но пока у тебя нет управляющего, будет сложно следить за столь отдаленным местом", "aunt")
        talking = false
    })

    map.on("more", async () => {
        get("more").forEach(e => {
            e.use("disabled")
            e.use(color(50, 50, 50))
        })

        talking = true
        await sayText("Здесь уже очень много книжных магазинов, в том числе крупных брендов", "aunt")
        await sayText("Конкуренция вряд ли пойдет нам на пользу первое время", "aunt")
        talking = false
    })

    map.on("good", async () => {
        talking = true
        await sayText("Хм... Выглядит здорово!", "aunt")
        await sayText("И конкуренции мало, и место недалеко", "aunt")
        await sayText("Думаю это хороший выбор!", "aunt")
        await sayText("Что вы делаете?", "friend")
        await sayText("Ого, уже второй магазин???", "friend")
        await sayText("Сомневаюсь, что сделаю так же: мое кафе работает только в убыток", "friend")
        await sayText("Потому что нужно делать все по уму", "aunt")
        talking = false

        goWithFade("level_total")
    })
})

scene("level_total", async () => {
    add([
        sprite("shop-full", {width: width(), height: height()})
    ])

    await sayText("Фух, ну и дел мы с тобой переделали", "aunt")
    await sayText("Да, не думал, что бизнес открыть на самом деле просто", "me")
    await sayText("Конечно просто, но только если знать все подводные камни!", "aunt")
    await sayText("После такого мне нужно отдохнуть", "aunt")
    await sayText("Я на Бали, как твой бизнес наладится и пойдут хорошие деньги - прилетай ко мне!", "aunt")
    await sayText("Только не забывай про зарплаты, налоги и управляющего", "aunt")
    await sayText("Хорошо тётя Мэри, я все сделаю как нужно!", "me")
    await sayText("Благодаря тебе, я умею вести бизнес!", "me")
    await sayText("Эм... Возьмешь меня на работу?", "friend")
    await sayText("Я подумаю", "me")
    goWithFade("menu")
})

goWithFade("menu")
