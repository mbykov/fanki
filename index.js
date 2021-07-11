// const inquirer = require('inquirer');
const log = console.log
const fse = require('fs-extra')
const path = require("path")
const JSON5 = require('json5')


const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    // console.log(`You pressed the "${str}" key`);
    // console.log();
    // console.log('_KEY', key);
    // console.log();

    if (key.name == 'down' && key.shift) {
      console.log('_Shift+Down');
    } else if (key.name == 'down') {
      console.log('_Down');
    } else if (key.name == 'up') {
      console.log('_Up');
    } else if (key.name == 'left') {
      console.log('_Left');
    } else if (key.name == 'right') {
      console.log('_Right');
    }

  }
});
console.log('Press any key...');


// let config = readConf()
// log('_CONF', config)

// let heapPath = path.resolve(__dirname, config.heap)
// log('_heapPath', heapPath)

// let cards = getCards(heapPath)
// cards = cards.slice(-5)
// log('_CARDS', cards)

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

// function getCards(heapPath) {
//   try {
//     heapPath = path.resolve(heapPath, 'Greek/lushing-01.md')
//     let str = fse.readFileSync(heapPath).toString().trim()
//     let rows = str.trim().split('\n')
//     let cards = [], card
//     let comm = ''
//     rows.forEach(row=> {
//       if (!row) return
//       let tmp = row.slice(0,2)
//       if (tmp == '# ') {
//         comm = ''
//         return
//       } else if (tmp == '##') {
//         comm = row
//       }  else {
//         card = row.trim().split(' = ')
//         if (comm) card.push(comm)
//       }
//       cards.push(card)
//     })
//     return cards
//   } catch (err) {
//     log('_ERR CARDS')
//   }
// }

// function readConf() {
//   try {
//     let str = fse.readFileSync('./config.json').toString()
//     let conf = JSON5.parse(str)
//     return conf
//   } catch (err) {
//     log('_ERR CONF')
//   }
// }
