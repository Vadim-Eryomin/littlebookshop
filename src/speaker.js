import "kaplay/global";

export default async function sayText(say, spriteName) {
    play(spriteName)
    let back = add([
        sprite("speaker-bg", {width: width() - 50, height: 200}),
        pos(25, height() - 220),
        "dialog"
    ])

    let spriteBack = back.add([
        rect(100, 100),
        color(200, 200, 200),
        anchor("center"),
        pos(50, -50),
        mask("intersect")
    ])

    let label = back.add([
        text(say, {width: width() - 100}),
        color(0, 0, 0),
        pos(50, 40),
    ])

    let speaker = spriteBack.add([
        anchor("center"),
        sprite(spriteName, {width: 100}),
    ])

    await new Promise(async resolve => {
        await wait(0.1)
        onMousePress(async () => {
            back.trigger("speakEnd")
            back.destroy()

            resolve();
        })

        onKeyPress(async () => {
            back.trigger("speakEnd")
            back.destroy()

            resolve();
        })
    })
}