const InputEvent = require('../');

const KEY_1 = 2
const KEY_2 = 3
const KEY_3 = 4
const KEY_4 = 5
const KEY_5 = 6
const KEY_6 = 7
const KEY_7 = 8
const KEY_8 = 9
const KEY_9 = 10
const KEY_0 = 11
const KEY_ENTER = 28

const keyboard = new InputEvent.Keyboard(process.argv[2]);
// keyboard.on('data'    , console.log);
// keyboard.on('keyup'   , console.log);
// keyboard.on('keydown' , console.log);
let buf = []
keyboard.on('keypress', (ev) => {
  switch (ev.code) {
    case KEY_1:
      buf.push(1)
      break
    case KEY_2:
      buf.push(2)
      break
    case KEY_3:
      buf.push(3)
      break
    case KEY_4:
      buf.push(4)
      break
    case KEY_5:
      buf.push(5)
      break
    case KEY_6:
      buf.push(6)
      break
    case KEY_7:
      buf.push(7)
      break
    case KEY_8:
      buf.push(8)
      break
    case KEY_9:
      buf.push(9)
      break
    case KEY_0:
      buf.push(0)
      break
    case KEY_ENTER:
      console.log('scanned: %j', buf.join(''))
      break
  }
})
