// const inquirer = require('inquirer');
const log = console.log
const fse = require('fs-extra')
const path = require("path")
const JSON5 = require('json5')


let config = readConf()
log('_CONF', config)

let heapPath = path.resolve(__dirname, config.heap)
log('_heapPath', heapPath)

let cards = getCards(heapPath)
log('_CARDS_', cards.length)

// =========== HOME
process.env['HOME']

let card = {
  current: 'a',

  show() {
    let desc = this.current[this.step]
    if (!desc) {
      log('_RANDOM-CARD')
      this.random()
    } else {
      log('_DESC:', desc)
    }
  },

  nextStep() {
    this.step += 1
    this.show()
  },

  prevStep() {
    this.step -= 1
    this.show()
  },

  random() {
    let idx = getRandomInt(cards.length)
    this.current = cards[idx]
    this.step = 0
    this.show()
  }
}

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    if (key.name == 'down' && key.shift) {
      console.log('_Shift+Down');
    } else if (key.name == 'down') {
      console.log('_Down');
      card.random()
    } else if (key.name == 'up') {
      console.log('_Up');
      card.random()
    } else if (key.name == 'left') {
      console.log('_Left');
      card.prevStep()
    } else if (key.name == 'right') {
      console.log('_Right');
      card.nextStep()
    }
  }
});

function showCard(step) {
  let idx = getRandomInt(cards.length)
  let card = cards[idx]
  if (step) log('_CARD', card[1])
  else log('_CARD', card[0])
}

card.random()
console.log('Press any key...');

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


function getCards(heapPath) {
  try {
    heapPath = path.resolve(heapPath, 'Greek/lushing-01.md')
    let str = fse.readFileSync(heapPath).toString().trim()
    let rows = str.trim().split('\n')
    let cards = [], card
    let comm = ''
    rows.forEach(row=> {
      if (!row) return
      let tmp = row.slice(0,2)
      if (tmp == '# ') {
        comm = ''
        return
      } else if (tmp == '##') {
        comm = row
      }  else {
        card = row.trim().split(' = ')
        if (comm) card.push(comm)
      }
      cards.push(card)
    })
    return cards
  } catch (err) {
    log('_ERR CARDS')
  }
}

function readConf() {
  try {
    let str = fse.readFileSync('./config.json').toString()
    let conf = JSON5.parse(str)
    return conf
  } catch (err) {
    log('_ERR CONF')
  }
}

// inquirer
//   .prompt([
//     {
//       type: 'list',
//       name: 'size',
//       message: 'What size do you need?',
//       choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro'],
//       filter(val) {
//         return val.toLowerCase();
//       },
//     },
//   ])
//   .then((answers) => {
//     // Use user feedback for... whatever!!
//     log(JSON.stringify(answers, null, '  '));
//   })
//   .catch((error) => {
//     if (error.isTtyError) {
//       console.log('_ERR TTY');
//     } else {
//       console.log('_ERR');
//     }
//   });
