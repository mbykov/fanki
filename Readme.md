# Fanki

yet another Anki clone, console app with blackjack

helper module for the **diglossa**: https://github.com/mbykov/diglossa.git

absolutely easily, in a minute, you can create a unit of Anki-like tests and dictionaries for them. And use them right in the console

![fanki](https://github.com/mbykov/fanki/blob/master/resources/fanki.png?raw=true "Fanki")


# Install

```
$ sudo npm install fanki --global
```
clone or create some fanki-heap, example: https://github.com/mbykov/fanki-heap

```
$ git clone https://github.com/mbykov/fanki-heap
```

describe path to your fanki-heap in an options file ".fankiconf.json" in ~, i.e. homedir, or in a current dir

```
.fankiconf.json
{
  input: '~/fanki-heap'
}
```

start fanki with several substrings to select unit you wish:

```
$ fanki lush 02
```

or

```
$ fanki zho yoyo 15
```

or

```
$ fanki lush 02 -i ~/fanki-heap
```

## use arrows

**left / right** - to move along the card

**down** - next card

**shift down** - change card color from green to red, (from raw to ripe)

**shift left / right** - move along a line to press \'d\', \'s\' or  \'v\'

## controls

d - wordform dictionary search

s - symbol search (useful for chinese)

h - help

ctrl+a - jump to beginning of a line

ctrl+l - clear screen

ctrl+k - clear line

v - (**not ctrl-v!**) - past arbitrary text

## colors

green - raw, show often

yellow - show less often

red - ripe, do not show, eat

## dictionaries

dictionaries have the same format of rows

```
好 = hǎo = good; well
来 = lái = to come
```

but dictionaries should have "-dict" in a file name

the closer to the file with the unit of tests, the earlier the dictionary is processed. Dictionaries at the heap root are processed last. Therefore, duplicate values in later (upper) dictionaries will not be counted.

## note

although you can see the names of the languages in the funky heap example, the application does not use this in any way. These names are for my convenience only, to group test units.

The program does not know anything about the test language, and only works with strings. Therefore, it is possible to request information about the "c" symbol for the European language, but there will be no result, however.
