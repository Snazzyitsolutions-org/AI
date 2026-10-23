import { useState, useMemo, useRef, useEffect } from 'react'

export type EmojiItem = {
  char: string
  name: string
  keywords?: string[]
}

export type EmojiCategory = {
  id: string
  label: string
  icon: string
  emojis: EmojiItem[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    label: 'Smileys & Emotion',
    icon: '😀',
    emojis: [
      { char: '😀', name: 'Grinning Face', keywords: ['happy', 'smile'] },
      { char: '😃', name: 'Grinning Face with Big Eyes', keywords: ['happy', 'joy'] },
      { char: '😄', name: 'Grinning Face with Smiling Eyes', keywords: ['laugh'] },
      { char: '😁', name: 'Beaming Face with Smiling Eyes', keywords: ['grin'] },
      { char: '😆', name: 'Grinning Squinting Face', keywords: ['laugh', 'lol'] },
      { char: '😅', name: 'Grinning Face with Sweat', keywords: ['relief', 'sweat'] },
      { char: '😂', name: 'Face with Tears of Joy', keywords: ['lol', 'crying', 'laugh'] },
      { char: '🤣', name: 'Rolling on the Floor Laughing', keywords: ['rofl', 'lol'] },
      { char: '😊', name: 'Smiling Face with Smiling Eyes', keywords: ['blush', 'proud'] },
      { char: '😇', name: 'Smiling Face with Halo', keywords: ['angel', 'innocent'] },
      { char: '🙂', name: 'Slightly Smiling Face', keywords: ['smile', 'mild'] },
      { char: '🙃', name: 'Upside-Down Face', keywords: ['silly', 'sarcasm'] },
      { char: '🫠', name: 'Melting Face', keywords: ['melt', 'hot', 'awkward'] },
      { char: '😉', name: 'Winking Face', keywords: ['wink', 'flirt'] },
      { char: '😌', name: 'Relieved Face', keywords: ['peace', 'calm'] },
      { char: '😍', name: 'Smiling Face with Heart-Eyes', keywords: ['love', 'crush'] },
      { char: '🥰', name: 'Smiling Face with Hearts', keywords: ['love', 'adore'] },
      { char: '😘', name: 'Face Blowing a Kiss', keywords: ['kiss', 'love'] },
      { char: '😗', name: 'Kissing Face', keywords: ['kiss'] },
      { char: '😙', name: 'Kissing Face with Smiling Eyes', keywords: ['kiss'] },
      { char: '😚', name: 'Kissing Face with Closed Eyes', keywords: ['kiss'] },
      { char: '😋', name: 'Face Savoring Food', keywords: ['yum', 'delicious'] },
      { char: '😛', name: 'Face with Tongue', keywords: ['tongue', 'silly'] },
      { char: '😜', name: 'Winking Face with Tongue', keywords: ['crazy', 'joke'] },
      { char: '🤪', name: 'Zany Face', keywords: ['crazy', 'wild'] },
      { char: '😝', name: 'Squinting Face with Tongue', keywords: ['playful'] },
      { char: '🤑', name: 'Money-Mouth Face', keywords: ['money', 'rich', 'cash'] },
      { char: '🤗', name: 'Smiling Face with Open Hands', keywords: ['hug'] },
      { char: '🤭', name: 'Face with Hand Over Mouth', keywords: ['oops', 'gasp'] },
      { char: '🫢', name: 'Face with Open Eyes and Hand Over Mouth', keywords: ['shock', 'surprised'] },
      { char: '🫣', name: 'Face with Peeking Eye', keywords: ['peek', 'scared', 'shy'] },
      { char: '🤫', name: 'Shushing Face', keywords: ['quiet', 'secret'] },
      { char: '🤔', name: 'Thinking Face', keywords: ['think', 'wonder'] },
      { char: '🫡', name: 'Saluting Face', keywords: ['salute', 'respect', 'yes sir'] },
      { char: '🤐', name: 'Zipper-Mouth Face', keywords: ['sealed', 'mute'] },
      { char: '🤨', name: 'Face with Raised Eyebrow', keywords: ['skeptical', 'suspicious'] },
      { char: '😐', name: 'Neutral Face', keywords: ['meh', 'straight'] },
      { char: '😑', name: 'Expressionless Face', keywords: ['blank'] },
      { char: '😶', name: 'Face Without Mouth', keywords: ['silent'] },
      { char: '🫥', name: 'Dotted Line Face', keywords: ['invisible', 'ghost'] },
      { char: '😏', name: 'Smirking Face', keywords: ['smirk', 'flirt'] },
      { char: '😒', name: 'Unamused Face', keywords: ['bored', 'unimpressed'] },
      { char: '🙄', name: 'Face with Rolling Eyes', keywords: ['eyeroll'] },
      { char: '😬', name: 'Grimacing Face', keywords: ['awkward', 'nervous'] },
      { char: '🤥', name: 'Lying Face', keywords: ['pinocchio', 'lie'] },
      { char: '😌', name: 'Pensive Face', keywords: ['thoughtful'] },
      { char: '😴', name: 'Sleeping Face', keywords: ['sleep', 'zzz'] },
      { char: '🤤', name: 'Drooling Face', keywords: ['drool', 'craving'] },
      { char: '😪', name: 'Sleepy Face', keywords: ['tired', 'snooze'] },
      { char: '😷', name: 'Face with Medical Mask', keywords: ['mask', 'sick'] },
      { char: '🤒', name: 'Face with Thermometer', keywords: ['fever', 'sick'] },
      { char: '🤕', name: 'Face with Head-Bandage', keywords: ['hurt', 'injured'] },
      { char: '🤢', name: 'Nauseated Face', keywords: ['gross', 'sick'] },
      { char: '🤮', name: 'Face Vomiting', keywords: ['puke', 'gross'] },
      { char: '🤧', name: 'Sneezing Face', keywords: ['cold', 'flu'] },
      { char: '🥵', name: 'Hot Face', keywords: ['heat', 'sweat'] },
      { char: '🥶', name: 'Cold Face', keywords: ['freezing', 'ice'] },
      { char: '🥴', name: 'Woozy Face', keywords: ['drunk', 'dizzy'] },
      { char: '😵', name: 'Face with Crossed-Out Eyes', keywords: ['ko', 'dead'] },
      { char: '😵‍💫', name: 'Face with Spiral Eyes', keywords: ['dizzy', 'hypnotized'] },
      { char: '🤯', name: 'Exploding Head', keywords: ['mind blown', 'shock'] },
      { char: '🤠', name: 'Cowboy Hat Face', keywords: ['cowboy', 'yeehaw'] },
      { char: '🥳', name: 'Partying Face', keywords: ['party', 'celebrate'] },
      { char: '🥸', name: 'Disguised Face', keywords: ['glasses', 'spy'] },
      { char: '😎', name: 'Smiling Face with Sunglasses', keywords: ['cool', 'shades'] },
      { char: '🤓', name: 'Nerd Face', keywords: ['geek', 'smart'] },
      { char: '🧐', name: 'Face with Monocle', keywords: ['classy', 'investigate'] },
      { char: '😕', name: 'Confused Face', keywords: ['puzzled'] },
      { char: '🫤', name: 'Face with Diagonal Mouth', keywords: ['unsure', 'skeptical'] },
      { char: '😟', name: 'Worried Face', keywords: ['concerned'] },
      { char: '🙁', name: 'Slightly Frowning Face', keywords: ['sad'] },
      { char: '😮', name: 'Face with Open Mouth', keywords: ['surprise'] },
      { char: '😯', name: 'Hushed Face', keywords: ['quiet', 'stunned'] },
      { char: '😲', name: 'Astonished Face', keywords: ['shocked'] },
      { char: '😳', name: 'Flushed Face', keywords: ['embarrassed'] },
      { char: '🥺', name: 'Pleading Face', keywords: ['puppy eyes', 'please'] },
      { char: '🥹', name: 'Face Holding Back Tears', keywords: ['emotional', 'gratitude', 'happy cry'] },
      { char: '😦', name: 'Frowning Face with Open Mouth', keywords: ['sad'] },
      { char: '😧', name: 'Anguished Face', keywords: ['stunned'] },
      { char: '😨', name: 'Fearful Face', keywords: ['scared', 'afraid'] },
      { char: '😰', name: 'Anxious Face with Sweat', keywords: ['nervous'] },
      { char: '😥', name: 'Sad but Relieved Face', keywords: ['whew'] },
      { char: '😢', name: 'Crying Face', keywords: ['tear', 'sad'] },
      { char: '😭', name: 'Loudly Crying Face', keywords: ['sob', 'tears'] },
      { char: '😱', name: 'Face Screaming in Fear', keywords: ['munch', 'scream'] },
      { char: '😖', name: 'Confounded Face', keywords: ['frustrated'] },
      { char: '😣', name: 'Persevering Face', keywords: ['struggling'] },
      { char: '😞', name: 'Disappointed Face', keywords: ['letdown'] },
      { char: '😓', name: 'Downcast Face with Sweat', keywords: ['stress'] },
      { char: '😩', name: 'Weary Face', keywords: ['tired'] },
      { char: '😫', name: 'Tired Face', keywords: ['exhausted'] },
      { char: '🥱', name: 'Yawning Face', keywords: ['sleepy', 'bored'] },
      { char: '😤', name: 'Face with Steam From Nose', keywords: ['angry', 'triumph'] },
      { char: '😡', name: 'Enraged Face', keywords: ['furious', 'red'] },
      { char: '😠', name: 'Angry Face', keywords: ['mad'] },
      { char: '🤬', name: 'Face with Symbols on Mouth', keywords: ['swear', 'cuss'] },
      { char: '😈', name: 'Smiling Face with Horns', keywords: ['devil', 'evil'] },
      { char: '👿', name: 'Angry Face with Horns', keywords: ['demon'] },
      { char: '💀', name: 'Skull', keywords: ['dead', 'skeleton', 'danger'] },
      { char: '☠️', name: 'Skull and Crossbones', keywords: ['danger', 'pirate'] },
      { char: '💩', name: 'Pile of Poo', keywords: ['poop', 'crappy'] },
      { char: '🤡', name: 'Clown Face', keywords: ['circus', 'fool'] },
      { char: '👹', name: 'Ogre', keywords: ['monster', 'japan'] },
      { char: '👺', name: 'Goblin', keywords: ['mask', 'tengu'] },
      { char: '👻', name: 'Ghost', keywords: ['spooky', 'halloween'] },
      { char: '👽', name: 'Alien', keywords: ['ufo', 'space'] },
      { char: '👾', name: 'Alien Monster', keywords: ['game', 'retro'] },
      { char: '🤖', name: 'Robot', keywords: ['bot', 'ai', 'tech'] },
      { char: '😺', name: 'Grinning Cat', keywords: ['cat', 'smile'] },
      { char: '😸', name: 'Grinning Cat with Smiling Eyes', keywords: ['cat'] },
      { char: '😹', name: 'Cat with Tears of Joy', keywords: ['cat', 'lol'] },
      { char: '😻', name: 'Smiling Cat with Heart-Eyes', keywords: ['cat', 'love'] },
      { char: '😼', name: 'Cat with Wry Smile', keywords: ['cat', 'smirk'] },
      { char: '😽', name: 'Kissing Cat', keywords: ['cat', 'kiss'] },
      { char: '🙀', name: 'Weary Cat', keywords: ['cat', 'shocked'] },
      { char: '😿', name: 'Crying Cat', keywords: ['cat', 'sad'] },
      { char: '😾', name: 'Pouting Cat', keywords: ['cat', 'angry'] },
      { char: '🙈', name: 'See-No-Evil Monkey', keywords: ['blind', 'shy'] },
      { char: '🙉', name: 'Hear-No-Evil Monkey', keywords: ['deaf'] },
      { char: '🙊', name: 'Speak-No-Evil Monkey', keywords: ['hush', 'quiet'] },
    ],
  },
  {
    id: 'gestures',
    label: 'People & Gestures',
    icon: '👋',
    emojis: [
      { char: '👋', name: 'Waving Hand', keywords: ['hello', 'bye', 'hi'] },
      { char: '🤚', name: 'Raised Back of Hand', keywords: ['stop', 'high five'] },
      { char: '🖐️', name: 'Hand with Fingers Splayed', keywords: ['five'] },
      { char: '✋', name: 'Raised Hand', keywords: ['stop', 'halt'] },
      { char: '🖖', name: 'Vulcan Salute', keywords: ['spock', 'live long'] },
      { char: '🫱', name: 'Rightwards Hand', keywords: ['reach', 'hand'] },
      { char: '🫲', name: 'Leftwards Hand', keywords: ['reach', 'hand'] },
      { char: '🫳', name: 'Palm Down Hand', keywords: ['drop', 'dismiss'] },
      { char: '🫴', name: 'Palm Up Hand', keywords: ['offer', 'catch', 'beckon'] },
      { char: '👌', name: 'OK Hand', keywords: ['perfect', 'good'] },
      { char: '🤌', name: 'Pinched Fingers', keywords: ['italian', 'what'] },
      { char: '🤏', name: 'Pinching Hand', keywords: ['small', 'tiny'] },
      { char: '✌️', name: 'Victory Hand', keywords: ['peace', 'two'] },
      { char: '🤞', name: 'Crossed Fingers', keywords: ['luck', 'hope'] },
      { char: '🫰', name: 'Hand with Index Finger and Thumb Crossed', keywords: ['kpop', 'heart', 'money'] },
      { char: '🤟', name: 'Love-You Gesture', keywords: ['ily', 'sign'] },
      { char: '🤘', name: 'Sign of the Horns', keywords: ['rock', 'metal'] },
      { char: '🤙', name: 'Call Me Hand', keywords: ['shaka', 'phone'] },
      { char: '👈', name: 'Backhand Index Pointing Left', keywords: ['left'] },
      { char: '👉', name: 'Backhand Index Pointing Right', keywords: ['right'] },
      { char: '👆', name: 'Backhand Index Pointing Up', keywords: ['up'] },
      { char: '🖕', name: 'Middle Finger', keywords: ['rude', 'finger'] },
      { char: '👇', name: 'Backhand Index Pointing Down', keywords: ['down'] },
      { char: '☝️', name: 'Index Pointing Up', keywords: ['one', 'point'] },
      { char: '🫵', name: 'Index Pointing at the Viewer', keywords: ['you', 'point'] },
      { char: '👍', name: 'Thumbs Up', keywords: ['like', 'approve', 'yes'] },
      { char: '👎', name: 'Thumbs Down', keywords: ['dislike', 'no'] },
      { char: '✊', name: 'Raised Fist', keywords: ['power', 'solidarity'] },
      { char: '👊', name: 'Oncoming Fist', keywords: ['fist bump', 'punch'] },
      { char: '🤛', name: 'Left-Facing Fist', keywords: ['bump'] },
      { char: '🤜', name: 'Right-Facing Fist', keywords: ['bump'] },
      { char: '👏', name: 'Clapping Hands', keywords: ['applause', 'praise', 'bravo'] },
      { char: '🙌', name: 'Raising Hands', keywords: ['celebrate', 'praise'] },
      { char: '🫶', name: 'Heart Hands', keywords: ['love', 'care', 'support'] },
      { char: '👐', name: 'Open Hands', keywords: ['welcome'] },
      { char: '🤲', name: 'Palms Up Together', keywords: ['dua', 'pray'] },
      { char: '🤝', name: 'Handshake', keywords: ['deal', 'agreement', 'partner'] },
      { char: '🙏', name: 'Folded Hands', keywords: ['please', 'thank you', 'namaste'] },
      { char: '✍️', name: 'Writing Hand', keywords: ['write', 'note'] },
      { char: '💅', name: 'Nail Polish', keywords: ['slay', 'care'] },
      { char: '🤳', name: 'Selfie', keywords: ['camera', 'phone'] },
      { char: '💪', name: 'Flexed Biceps', keywords: ['strong', 'power', 'gym'] },
      { char: '🦾', name: 'Mechanical Arm', keywords: ['prosthetic', 'cyborg'] },
      { char: '🦿', name: 'Mechanical Leg', keywords: ['prosthetic'] },
      { char: '🦵', name: 'Leg', keywords: ['limb'] },
      { char: '🦶', name: 'Foot', keywords: ['kick', 'walk'] },
      { char: '👂', name: 'Ear', keywords: ['hear', 'listen'] },
      { char: '🦻', name: 'Ear with Hearing Aid', keywords: ['audio'] },
      { char: '👃', name: 'Nose', keywords: ['smell'] },
      { char: '🧠', name: 'Brain', keywords: ['smart', 'intellect', 'mind'] },
      { char: '🫀', name: 'Anatomical Heart', keywords: ['cardiology', 'pulse'] },
      { char: '🫁', name: 'Lungs', keywords: ['breathe'] },
      { char: '🦷', name: 'Tooth', keywords: ['dentist'] },
      { char: '🦴', name: 'Bone', keywords: ['skeleton'] },
      { char: '👀', name: 'Eyes', keywords: ['look', 'see', 'watch'] },
      { char: '👁️', name: 'Eye', keywords: ['vision'] },
      { char: '👅', name: 'Tongue', keywords: ['taste'] },
      { char: '👄', name: 'Mouth', keywords: ['lips'] },
      { char: '🫦', name: 'Biting Lip', keywords: ['flirt', 'nervous'] },
      { char: '👶', name: 'Baby', keywords: ['child', 'infant'] },
      { char: '🧒', name: 'Child', keywords: ['kid'] },
      { char: '👦', name: 'Boy', keywords: ['young'] },
      { char: '👧', name: 'Girl', keywords: ['young'] },
      { char: '🧑', name: 'Person', keywords: ['human', 'user'] },
      { char: '👱', name: 'Person with Blond Hair', keywords: ['blonde'] },
      { char: '👨', name: 'Man', keywords: ['adult'] },
      { char: '🧔', name: 'Person with Beard', keywords: ['beard'] },
      { char: '👩', name: 'Woman', keywords: ['adult', 'female'] },
      { char: '🧓', name: 'Older Person', keywords: ['elder'] },
      { char: '👴', name: 'Old Man', keywords: ['grandpa'] },
      { char: '👵', name: 'Old Woman', keywords: ['grandma'] },
      { char: '👨‍💼', name: 'Man Office Worker', keywords: ['corporate', 'business', 'suit'] },
      { char: '👩‍💼', name: 'Woman Office Worker', keywords: ['executive', 'manager'] },
      { char: '👨‍💻', name: 'Man Technologist', keywords: ['coder', 'developer', 'programmer'] },
      { char: '👩‍💻', name: 'Woman Technologist', keywords: ['developer', 'software'] },
      { char: '👨‍🎓', name: 'Man Student', keywords: ['grad', 'college'] },
      { char: '👩‍🎓', name: 'Woman Student', keywords: ['grad', 'university'] },
      { char: '👨‍⚕️', name: 'Man Health Worker', keywords: ['doctor', 'nurse'] },
      { char: '👩‍⚕️', name: 'Woman Health Worker', keywords: ['doctor', 'medic'] },
      { char: '🧑‍🤝‍🧑', name: 'People Holding Hands', keywords: ['couple', 'together'] },
      { char: '🫂', name: 'People Hugging', keywords: ['hug', 'care', 'support'] },
      { char: '🗣️', name: 'Speaking Head', keywords: ['talk', 'voice', 'speak'] },
      { char: '👤', name: 'Bust in Silhouette', keywords: ['user', 'contact'] },
      { char: '👥', name: 'Busts in Silhouette', keywords: ['group', 'team'] },
    ],
  },
  {
    id: 'animals',
    label: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      { char: '🐶', name: 'Dog Face', keywords: ['puppy', 'pet'] },
      { char: '🐕', name: 'Dog', keywords: ['canine'] },
      { char: '🦮', name: 'Guide Dog', keywords: ['assistance'] },
      { char: '🐩', name: 'Poodle', keywords: ['dog'] },
      { char: '🐺', name: 'Wolf', keywords: ['wild'] },
      { char: '🦊', name: 'Fox', keywords: ['cunning'] },
      { char: '🦝', name: 'Raccoon', keywords: ['trash panda'] },
      { char: '🐱', name: 'Cat Face', keywords: ['kitty', 'pet'] },
      { char: '🐈', name: 'Cat', keywords: ['feline'] },
      { char: '🐈‍⬛', name: 'Black Cat', keywords: ['halloween'] },
      { char: '🦁', name: 'Lion', keywords: ['king', 'roar'] },
      { char: '🐯', name: 'Tiger Face', keywords: ['wild'] },
      { char: '🐅', name: 'Tiger', keywords: ['stripes'] },
      { char: '🐆', name: 'Leopard', keywords: ['cheetah'] },
      { char: '🐴', name: 'Horse Face', keywords: ['pony'] },
      { char: '🐎', name: 'Horse', keywords: ['racing'] },
      { char: '🦄', name: 'Unicorn', keywords: ['magic', 'fantasy'] },
      { char: '🦓', name: 'Zebra', keywords: ['stripes'] },
      { char: '🦌', name: 'Deer', keywords: ['nature'] },
      { char: '🐮', name: 'Cow Face', keywords: ['moo'] },
      { char: '🐂', name: 'Ox', keywords: ['bull'] },
      { char: '🐃', name: 'Water Buffalo', keywords: ['animal'] },
      { char: '🐄', name: 'Cow', keywords: ['milk'] },
      { char: '🐷', name: 'Pig Face', keywords: ['oink'] },
      { char: '🐖', name: 'Pig', keywords: ['farm'] },
      { char: '🐗', name: 'Boar', keywords: ['wild'] },
      { char: '🐽', name: 'Pig Nose', keywords: ['snout'] },
      { char: '🐏', name: 'Ram', keywords: ['sheep'] },
      { char: '🐑', name: 'Ewe', keywords: ['sheep', 'wool'] },
      { char: '🐐', name: 'Goat', keywords: ['greatest'] },
      { char: '🐪', name: 'Camel', keywords: ['desert'] },
      { char: '🐫', name: 'Two-Hump Camel', keywords: ['desert'] },
      { char: '🦙', name: 'Llama', keywords: ['alpaca'] },
      { char: '🦒', name: 'Giraffe', keywords: ['tall'] },
      { char: '🐘', name: 'Elephant', keywords: ['india', 'mammoth'] },
      { char: '🦏', name: 'Rhinoceros', keywords: ['horn'] },
      { char: '🦛', name: 'Hippopotamus', keywords: ['hippo'] },
      { char: '🐭', name: 'Mouse Face', keywords: ['rodent'] },
      { char: '🐁', name: 'Mouse', keywords: ['cheese'] },
      { char: '🐀', name: 'Rat', keywords: ['rodent'] },
      { char: '🐹', name: 'Hamster', keywords: ['cute'] },
      { char: '🐰', name: 'Rabbit Face', keywords: ['bunny'] },
      { char: '🐇', name: 'Rabbit', keywords: ['easter'] },
      { char: '🐿️', name: 'Chipmunk', keywords: ['squirrel', 'nuts'] },
      { char: '🦔', name: 'Hedgehog', keywords: ['spines'] },
      { char: '🦇', name: 'Bat', keywords: ['night'] },
      { char: '🐻', name: 'Bear', keywords: ['grizzly'] },
      { char: '🐨', name: 'Koala', keywords: ['australia'] },
      { char: '🐼', name: 'Panda', keywords: ['bamboo', 'china'] },
      { char: '🦥', name: 'Sloth', keywords: ['lazy', 'slow'] },
      { char: '🦦', name: 'Otter', keywords: ['river'] },
      { char: '🦨', name: 'Skunk', keywords: ['stink'] },
      { char: '🦘', name: 'Kangaroo', keywords: ['australia', 'hop'] },
      { char: '🦡', name: 'Badger', keywords: ['honey'] },
      { char: '🦃', name: 'Turkey', keywords: ['thanksgiving'] },
      { char: '🐔', name: 'Chicken', keywords: ['hen'] },
      { char: '🐓', name: 'Rooster', keywords: ['morning'] },
      { char: '🐣', name: 'Hatching Chick', keywords: ['baby'] },
      { char: '🐤', name: 'Baby Chick', keywords: ['yellow'] },
      { char: '🐥', name: 'Front-Facing Baby Chick', keywords: ['cute'] },
      { char: '🐦', name: 'Bird', keywords: ['fly'] },
      { char: '🐧', name: 'Penguin', keywords: ['ice', 'antarctica'] },
      { char: '🕊️', name: 'Dove', keywords: ['peace'] },
      { char: '🦅', name: 'Eagle', keywords: ['bird', 'usa'] },
      { char: '🦆', name: 'Duck', keywords: ['quack'] },
      { char: '🦢', name: 'Swan', keywords: ['grace'] },
      { char: '🦉', name: 'Owl', keywords: ['wise', 'night'] },
      { char: '🦤', name: 'Dodo', keywords: ['extinct'] },
      { char: '🪶', name: 'Feather', keywords: ['light', 'quill'] },
      { char: '🦩', name: 'Flamingo', keywords: ['pink'] },
      { char: '🦚', name: 'Peacock', keywords: ['feather', 'india'] },
      { char: '🦜', name: 'Parrot', keywords: ['talk'] },
      { char: '🐸', name: 'Frog', keywords: ['croak'] },
      { char: '🐊', name: 'Crocodile', keywords: ['alligator'] },
      { char: '🐢', name: 'Turtle', keywords: ['tortoise', 'slow'] },
      { char: '🦎', name: 'Lizard', keywords: ['gecko'] },
      { char: '🐍', name: 'Snake', keywords: ['serpent'] },
      { char: '🐲', name: 'Dragon Face', keywords: ['myth'] },
      { char: '🐉', name: 'Dragon', keywords: ['fantasy'] },
      { char: '🦕', name: 'Sauropod', keywords: ['dinosaur'] },
      { char: '🦖', name: 'T-Rex', keywords: ['dinosaur'] },
      { char: '🐳', name: 'Spouting Whale', keywords: ['ocean'] },
      { char: '🐋', name: 'Whale', keywords: ['sea'] },
      { char: '🐬', name: 'Dolphin', keywords: ['smart', 'ocean'] },
      { char: '🦭', name: 'Seal', keywords: ['sea'] },
      { char: '🐟', name: 'Fish', keywords: ['water'] },
      { char: '🐠', name: 'Tropical Fish', keywords: ['nemo'] },
      { char: '🐡', name: 'Blowfish', keywords: ['puffer'] },
      { char: '🦈', name: 'Shark', keywords: ['predator'] },
      { char: '🐙', name: 'Octopus', keywords: ['tentacles'] },
      { char: '🐚', name: 'Spiral Shell', keywords: ['beach'] },
      { char: '🐌', name: 'Snail', keywords: ['slow'] },
      { char: '🦋', name: 'Butterfly', keywords: ['caterpillar'] },
      { char: '🐛', name: 'Bug', keywords: ['insect'] },
      { char: '🐜', name: 'Ant', keywords: ['work'] },
      { char: '🐝', name: 'Honeybee', keywords: ['honey', 'buzz'] },
      { char: '🪲', name: 'Beetle', keywords: ['bug'] },
      { char: '🐞', name: 'Lady Beetle', keywords: ['luck'] },
      { char: '🦗', name: 'Cricket', keywords: ['chirp'] },
      { char: '🕷️', name: 'Spider', keywords: ['web'] },
      { char: '🕸️', name: 'Spider Web', keywords: ['cobweb'] },
      { char: '🦂', name: 'Scorpion', keywords: ['sting'] },
      { char: '💐', name: 'Bouquet', keywords: ['flowers', 'gift'] },
      { char: '🌸', name: 'Cherry Blossom', keywords: ['sakura', 'flower'] },
      { char: '💮', name: 'White Flower', keywords: ['japan'] },
      { char: '🏵️', name: 'Rosette', keywords: ['decoration'] },
      { char: '🌹', name: 'Rose', keywords: ['love', 'romantic'] },
      { char: '🥀', name: 'Wilted Flower', keywords: ['sad'] },
      { char: '🌺', name: 'Hibiscus', keywords: ['tropical'] },
      { char: '🌻', name: 'Sunflower', keywords: ['summer', 'bright'] },
      { char: '🌼', name: 'Blossom', keywords: ['flower'] },
      { char: '🌷', name: 'Tulip', keywords: ['spring'] },
      { char: '🪷', name: 'Lotus', keywords: ['pure', 'india', 'buddhism'] },
      { char: '🌱', name: 'Seedling', keywords: ['grow', 'plant'] },
      { char: '🪴', name: 'Potted Plant', keywords: ['home', 'green'] },
      { char: '🌲', name: 'Evergreen Tree', keywords: ['pine'] },
      { char: '🌳', name: 'Deciduous Tree', keywords: ['nature'] },
      { char: '🌴', name: 'Palm Tree', keywords: ['beach', 'vacation'] },
      { char: '🌵', name: 'Cactus', keywords: ['desert'] },
      { char: '🌾', name: 'Sheaf of Rice', keywords: ['wheat', 'crop'] },
      { char: '🌿', name: 'Herb', keywords: ['leaf'] },
      { char: '☘️', name: 'Shamrock', keywords: ['ireland'] },
      { char: '🍀', name: 'Four Leaf Clover', keywords: ['luck'] },
      { char: '🍁', name: 'Maple Leaf', keywords: ['canada', 'autumn'] },
      { char: '🍂', name: 'Fallen Leaf', keywords: ['fall'] },
      { char: '🍃', name: 'Leaf Fluttering in Wind', keywords: ['breeze'] },
    ],
  },
  {
    id: 'food',
    label: 'Food & Drinks',
    icon: '🍔',
    emojis: [
      { char: '🍏', name: 'Green Apple', keywords: ['fruit'] },
      { char: '🍎', name: 'Red Apple', keywords: ['fruit'] },
      { char: '🍐', name: 'Pear', keywords: ['fruit'] },
      { char: '🍊', name: 'Tangerine', keywords: ['orange', 'citrus'] },
      { char: '🍋', name: 'Lemon', keywords: ['sour'] },
      { char: '🍌', name: 'Banana', keywords: ['fruit'] },
      { char: '🍉', name: 'Watermelon', keywords: ['summer'] },
      { char: '🍇', name: 'Grapes', keywords: ['wine'] },
      { char: '🍓', name: 'Strawberry', keywords: ['berry'] },
      { char: '🫐', name: 'Blueberries', keywords: ['berry'] },
      { char: '🍈', name: 'Melon', keywords: ['cantaloupe'] },
      { char: '🍒', name: 'Cherries', keywords: ['fruit'] },
      { char: '🍑', name: 'Peach', keywords: ['fruit'] },
      { char: '🥭', name: 'Mango', keywords: ['tropical', 'india'] },
      { char: '🍍', name: 'Pineapple', keywords: ['tropical'] },
      { char: '🥥', name: 'Coconut', keywords: ['palm'] },
      { char: '🥝', name: 'Kiwi Fruit', keywords: ['fruit'] },
      { char: '🍅', name: 'Tomato', keywords: ['salad'] },
      { char: '🥑', name: 'Avocado', keywords: ['guac'] },
      { char: '🥦', name: 'Broccoli', keywords: ['green', 'healthy'] },
      { char: '🥒', name: 'Cucumber', keywords: ['salad'] },
      { char: '🌶️', name: 'Hot Pepper', keywords: ['spicy', 'chili'] },
      { char: '🫑', name: 'Bell Pepper', keywords: ['capsicum'] },
      { char: '🌽', name: 'Ear of Corn', keywords: ['maize'] },
      { char: '🥕', name: 'Carrot', keywords: ['vegetable'] },
      { char: '🧄', name: 'Garlic', keywords: ['flavor'] },
      { char: '🧅', name: 'Onion', keywords: ['vegetable'] },
      { char: '🥔', name: 'Potato', keywords: ['fries', 'carb'] },
      { char: '🥐', name: 'Croissant', keywords: ['bakery', 'french'] },
      { char: '🥖', name: 'Baguette Bread', keywords: ['french'] },
      { char: '🥨', name: 'Pretzel', keywords: ['snack'] },
      { char: '🥯', name: 'Bagel', keywords: ['breakfast'] },
      { char: '🍞', name: 'Bread', keywords: ['toast'] },
      { char: '🧀', name: 'Cheese Wedge', keywords: ['dairy'] },
      { char: '🥚', name: 'Egg', keywords: ['breakfast'] },
      { char: '🍳', name: 'Cooking', keywords: ['fried egg'] },
      { char: '🧈', name: 'Butter', keywords: ['dairy'] },
      { char: '🥞', name: 'Pancakes', keywords: ['syrup'] },
      { char: '🧇', name: 'Waffle', keywords: ['breakfast'] },
      { char: '🥓', name: 'Bacon', keywords: ['meat'] },
      { char: '🥩', name: 'Cut of Meat', keywords: ['steak'] },
      { char: '🍗', name: 'Poultry Leg', keywords: ['chicken drumstick'] },
      { char: '🍖', name: 'Meat on Bone', keywords: ['meat'] },
      { char: '🌭', name: 'Hot Dog', keywords: ['sausage'] },
      { char: '🍔', name: 'Hamburger', keywords: ['burger', 'fast food'] },
      { char: '🍟', name: 'French Fries', keywords: ['fries'] },
      { char: '🍕', name: 'Pizza', keywords: ['cheese', 'slice'] },
      { char: '🥪', name: 'Sandwich', keywords: ['lunch'] },
      { char: '🥙', name: 'Stuffed Flatbread', keywords: ['shawarma', 'kebab'] },
      { char: '🧆', name: 'Falafel', keywords: ['arabic'] },
      { char: '🌮', name: 'Taco', keywords: ['mexican'] },
      { char: '🌯', name: 'Burrito', keywords: ['mexican'] },
      { char: '🥗', name: 'Green Salad', keywords: ['healthy'] },
      { char: '🥘', name: 'Shallow Pan of Food', keywords: ['paella', 'curry'] },
      { char: '🍝', name: 'Spaghetti', keywords: ['pasta'] },
      { char: '🍜', name: 'Steaming Bowl', keywords: ['noodles', 'ramen'] },
      { char: '🍲', name: 'Pot of Food', keywords: ['stew', 'soup'] },
      { char: '🍛', name: 'Curry Rice', keywords: ['indian', 'spicy'] },
      { char: '🍣', name: 'Sushi', keywords: ['japanese'] },
      { char: '🍱', name: 'Bento Box', keywords: ['japanese lunch'] },
      { char: '🥟', name: 'Dumpling', keywords: ['momo', 'dim sum'] },
      { char: '🍤', name: 'Fried Shrimp', keywords: ['seafood'] },
      { char: '🍙', name: 'Rice Ball', keywords: ['onigiri'] },
      { char: '🍚', name: 'Cooked Rice', keywords: ['bowl'] },
      { char: '🍘', name: 'Rice Cracker', keywords: ['snack'] },
      { char: '🍢', name: 'Oden', keywords: ['skewer'] },
      { char: '🍡', name: 'Dango', keywords: ['sweet skewer'] },
      { char: '🍧', name: 'Shaved Ice', keywords: ['gola', 'dessert'] },
      { char: '🍨', name: 'Ice Cream', keywords: ['dessert'] },
      { char: '🍦', name: 'Soft Ice Cream', keywords: ['cone'] },
      { char: '🥧', name: 'Pie', keywords: ['dessert'] },
      { char: '🧁', name: 'Cupcake', keywords: ['sweet'] },
      { char: '🍰', name: 'Shortcake', keywords: ['dessert'] },
      { char: '🎂', name: 'Birthday Cake', keywords: ['bday', 'party'] },
      { char: '🍮', name: 'Custard', keywords: ['pudding'] },
      { char: '🍭', name: 'Lollipop', keywords: ['candy'] },
      { char: '🍬', name: 'Candy', keywords: ['sweet'] },
      { char: '🍫', name: 'Chocolate Bar', keywords: ['candy'] },
      { char: '🍿', name: 'Popcorn', keywords: ['movie', 'snack'] },
      { char: '🍩', name: 'Doughnut', keywords: ['donut'] },
      { char: '🍪', name: 'Cookie', keywords: ['biscuit'] },
      { char: '☕', name: 'Hot Beverage', keywords: ['coffee', 'tea'] },
      { char: '🍵', name: 'Teacup Without Handle', keywords: ['matcha', 'green tea', 'chai'] },
      { char: '🧋', name: 'Bubble Tea', keywords: ['boba'] },
      { char: '🥤', name: 'Cup with Straw', keywords: ['soda', 'drink'] },
      { char: '🧃', name: 'Beverage Box', keywords: ['juice'] },
      { char: '🥛', name: 'Glass of Milk', keywords: ['dairy'] },
      { char: '🍺', name: 'Beer Mug', keywords: ['drink', 'pub'] },
      { char: '🍻', name: 'Clinking Beer Mugs', keywords: ['cheers'] },
      { char: '🥂', name: 'Clinking Glasses', keywords: ['celebrate', 'toast'] },
      { char: '🍷', name: 'Wine Glass', keywords: ['alcohol'] },
      { char: '🍸', name: 'Cocktail Glass', keywords: ['drink'] },
      { char: '🍹', name: 'Tropical Drink', keywords: ['cocktail'] },
      { char: '🍾', name: 'Bottle with Popping Cork', keywords: ['champagne'] },
    ],
  },
  {
    id: 'activities',
    label: 'Activities & Sports',
    icon: '⚽',
    emojis: [
      { char: '⚽', name: 'Soccer Ball', keywords: ['football'] },
      { char: '🏀', name: 'Basketball', keywords: ['nba'] },
      { char: '🏈', name: 'American Football', keywords: ['nfl'] },
      { char: '⚾', name: 'Baseball', keywords: ['mlb'] },
      { char: '🥎', name: 'Softball', keywords: ['ball'] },
      { char: '🎾', name: 'Tennis', keywords: ['racket'] },
      { char: '🏐', name: 'Volleyball', keywords: ['beach'] },
      { char: '🏉', name: 'Rugby Football', keywords: ['sport'] },
      { char: '🥏', name: 'Flying Disc', keywords: ['frisbee'] },
      { char: '🎱', name: 'Pool 8 Ball', keywords: ['billiards'] },
      { char: '🪀', name: 'Yo-Yo', keywords: ['toy'] },
      { char: '🏓', name: 'Ping Pong', keywords: ['table tennis'] },
      { char: '🏸', name: 'Badminton', keywords: ['shuttlecock'] },
      { char: '🏒', name: 'Ice Hockey', keywords: ['puck'] },
      { char: '🏑', name: 'Field Hockey', keywords: ['sport'] },
      { char: '🏏', name: 'Cricket Game', keywords: ['bat', 'india', 'ipl'] },
      { char: '🪃', name: 'Boomerang', keywords: ['australia'] },
      { char: '🥅', name: 'Goal Net', keywords: ['soccer'] },
      { char: '⛳', name: 'Flag in Hole', keywords: ['golf'] },
      { char: '🪁', name: 'Kite', keywords: ['wind', 'patang'] },
      { char: '🏹', name: 'Bow and Arrow', keywords: ['archery'] },
      { char: '🎣', name: 'Fishing Pole', keywords: ['fish'] },
      { char: '🤿', name: 'Diving Mask', keywords: ['scuba'] },
      { char: '🥊', name: 'Boxing Glove', keywords: ['fight'] },
      { char: '🥋', name: 'Martial Arts Uniform', keywords: ['karate', 'judo'] },
      { char: '🛹', name: 'Skateboard', keywords: ['skate'] },
      { char: '🛼', name: 'Roller Skate', keywords: ['skating'] },
      { char: '🏆', name: 'Trophy', keywords: ['winner', 'prize', 'champion'] },
      { char: '🥇', name: '1st Place Medal', keywords: ['gold', 'first'] },
      { char: '🥈', name: '2nd Place Medal', keywords: ['silver'] },
      { char: '🥉', name: '3rd Place Medal', keywords: ['bronze'] },
      { char: '🏅', name: 'Sports Medal', keywords: ['award'] },
      { char: '🎖️', name: 'Military Medal', keywords: ['honor'] },
      { char: '🎫', name: 'Ticket', keywords: ['cinema', 'concert'] },
      { char: '🎟️', name: 'Admission Tickets', keywords: ['show'] },
      { char: '🎪', name: 'Circus Tent', keywords: ['carnival'] },
      { char: '🎭', name: 'Performing Arts', keywords: ['theater', 'drama'] },
      { char: '🎨', name: 'Artist Palette', keywords: ['art', 'design', 'paint'] },
      { char: '🎬', name: 'Clapper Board', keywords: ['movie', 'film'] },
      { char: '🎤', name: 'Microphone', keywords: ['sing', 'voice', 'podcast'] },
      { char: '🎧', name: 'Headphone', keywords: ['music', 'listen'] },
      { char: '🎼', name: 'Musical Score', keywords: ['notes'] },
      { char: '🎹', name: 'Musical Keyboard', keywords: ['piano'] },
      { char: '🥁', name: 'Drum', keywords: ['beats'] },
      { char: '🎷', name: 'Saxophone', keywords: ['jazz'] },
      { char: '🎺', name: 'Trumpet', keywords: ['brass'] },
      { char: '🎸', name: 'Guitar', keywords: ['rock', 'acoustic'] },
      { char: '🎻', name: 'Violin', keywords: ['classical'] },
      { char: '🎲', name: 'Game Die', keywords: ['dice', 'luck'] },
      { char: '♟️', name: 'Chess Pawn', keywords: ['strategy'] },
      { char: '🎯', name: 'Direct Hit', keywords: ['target', 'goal', 'bullseye'] },
      { char: '🎳', name: 'Bowling', keywords: ['strike'] },
      { char: '🎮', name: 'Video Game', keywords: ['controller', 'gaming'] },
      { char: '🎰', name: 'Slot Machine', keywords: ['casino', 'jackpot'] },
      { char: '🧩', name: 'Puzzle Piece', keywords: ['problem', 'fit'] },
    ],
  },
  {
    id: 'travel',
    label: 'Travel & Places',
    icon: '✈️',
    emojis: [
      { char: '✈️', name: 'Airplane', keywords: ['flight', 'travel'] },
      { char: '🛫', name: 'Airplane Departure', keywords: ['takeoff'] },
      { char: '🛬', name: 'Airplane Arrival', keywords: ['landing'] },
      { char: '🛩️', name: 'Small Airplane', keywords: ['jet'] },
      { char: '🚁', name: 'Helicopter', keywords: ['chopper'] },
      { char: '🚀', name: 'Rocket', keywords: ['launch', 'blast off', 'fast'] },
      { char: '🛸', name: 'Flying Saucer', keywords: ['ufo'] },
      { char: '🚗', name: 'Automobile', keywords: ['car'] },
      { char: '🚕', name: 'Taxi', keywords: ['cab'] },
      { char: '🚙', name: 'Sport Utility Vehicle', keywords: ['suv'] },
      { char: '🚌', name: 'Bus', keywords: ['transit'] },
      { char: '🚎', name: 'Trolleybus', keywords: ['public'] },
      { char: '🏎️', name: 'Racing Car', keywords: ['speed', 'f1'] },
      { char: '🚓', name: 'Police Car', keywords: ['cop'] },
      { char: '🚑', name: 'Ambulance', keywords: ['medical', 'hospital'] },
      { char: '🚒', name: 'Fire Engine', keywords: ['emergency'] },
      { char: '🚐', name: 'Minibus', keywords: ['van'] },
      { char: '🛻', name: 'Pickup Truck', keywords: ['cargo'] },
      { char: '🚚', name: 'Delivery Truck', keywords: ['shipping', 'order'] },
      { char: '🚛', name: 'Articulated Lorry', keywords: ['freight'] },
      { char: '🚜', name: 'Tractor', keywords: ['farm'] },
      { char: '🛵', name: 'Motor Scooter', keywords: ['vespa'] },
      { char: '🏍️', name: 'Motorcycle', keywords: ['bike'] },
      { char: '🛺', name: 'Auto Rickshaw', keywords: ['tuk tuk', 'india'] },
      { char: '🚲', name: 'Bicycle', keywords: ['cycling'] },
      { char: '🛴', name: 'Kick Scooter', keywords: ['ride'] },
      { char: '🚂', name: 'Locomotive', keywords: ['train', 'steam'] },
      { char: '🚆', name: 'Train', keywords: ['railway'] },
      { char: '🚇', name: 'Metro', keywords: ['subway'] },
      { char: '🚊', name: 'Tram', keywords: ['transit'] },
      { char: '🚉', name: 'Station', keywords: ['platform'] },
      { char: '🚢', name: 'Ship', keywords: ['cruise', 'boat'] },
      { char: '⛵', name: 'Sailboat', keywords: ['sailing'] },
      { char: '🚤', name: 'Speedboat', keywords: ['fast boat'] },
      { char: '🛳️', name: 'Passenger Ship', keywords: ['liner'] },
      { char: '⛴️', name: 'Ferry', keywords: ['boat'] },
      { char: '⚓', name: 'Anchor', keywords: ['navy'] },
      { char: '⛽', name: 'Fuel Pump', keywords: ['gas', 'petrol'] },
      { char: '🚨', name: 'Police Car Light', keywords: ['siren', 'emergency', 'alert'] },
      { char: '🚦', name: 'Traffic Light', keywords: ['signal'] },
      { char: '🚧', name: 'Construction', keywords: ['warning', 'roadwork'] },
      { char: '🏠', name: 'House', keywords: ['home'] },
      { char: '🏡', name: 'House with Garden', keywords: ['real estate'] },
      { char: '🏢', name: 'Office Building', keywords: ['workplace', 'company'] },
      { char: '🏬', name: 'Department Store', keywords: ['mall', 'shopping'] },
      { char: '🏭', name: 'Factory', keywords: ['industry'] },
      { char: '🏥', name: 'Hospital', keywords: ['clinic', 'health'] },
      { char: '🏦', name: 'Bank', keywords: ['finance'] },
      { char: '🏨', name: 'Hotel', keywords: ['stay', 'vacation'] },
      { char: '🏛️', name: 'Classical Building', keywords: ['institution'] },
      { char: '⛪', name: 'Church', keywords: ['worship'] },
      { char: '🕌', name: 'Mosque', keywords: ['islam'] },
      { char: '🛕', name: 'Hindu Temple', keywords: ['mandir'] },
      { char: '🕍', name: 'Synagogue', keywords: ['jewish'] },
      { char: '⛩️', name: 'Shinto Shrine', keywords: ['torii', 'japan'] },
      { char: '🕋', name: 'Kaaba', keywords: ['mecca', 'hajj'] },
      { char: '⛲', name: 'Fountain', keywords: ['water'] },
      { char: '🏰', name: 'Castle', keywords: ['palace'] },
      { char: '🗼', name: 'Tokyo Tower', keywords: ['eiffel'] },
      { char: '🗽', name: 'Statue of Liberty', keywords: ['nyc', 'usa'] },
      { char: '🌉', name: 'Bridge at Night', keywords: ['bridge'] },
      { char: '🌆', name: 'Cityscape at Dusk', keywords: ['city', 'sunset'] },
      { char: '🌍', name: 'Globe Showing Europe-Africa', keywords: ['world', 'earth'] },
      { char: '🌎', name: 'Globe Showing Americas', keywords: ['earth'] },
      { char: '🌏', name: 'Globe Showing Asia-Australia', keywords: ['earth'] },
      { char: '🗺️', name: 'World Map', keywords: ['geography', 'international'] },
    ],
  },
  {
    id: 'objects',
    label: 'Objects & Tech',
    icon: '💼',
    emojis: [
      { char: '💼', name: 'Briefcase', keywords: ['business', 'work'] },
      { char: '📱', name: 'Mobile Phone', keywords: ['smartphone', 'cell'] },
      { char: '📲', name: 'Mobile Phone with Arrow', keywords: ['call', 'incoming'] },
      { char: '💻', name: 'Laptop', keywords: ['computer', 'tech'] },
      { char: '🖥️', name: 'Desktop Computer', keywords: ['pc', 'monitor'] },
      { char: '⌨️', name: 'Keyboard', keywords: ['type'] },
      { char: '🖱️', name: 'Computer Mouse', keywords: ['click'] },
      { char: '🖨️', name: 'Printer', keywords: ['print', 'paper'] },
      { char: '📷', name: 'Camera', keywords: ['photo'] },
      { char: '📸', name: 'Camera with Flash', keywords: ['snap'] },
      { char: '📹', name: 'Video Camera', keywords: ['record'] },
      { char: '📺', name: 'Television', keywords: ['tv'] },
      { char: '📻', name: 'Radio', keywords: ['broadcast'] },
      { char: '🔋', name: 'Battery', keywords: ['power', 'charge'] },
      { char: '🔌', name: 'Electric Plug', keywords: ['power'] },
      { char: '💡', name: 'Light Bulb', keywords: ['idea', 'insight'] },
      { char: '🔦', name: 'Flashlight', keywords: ['torch'] },
      { char: '🕯️', name: 'Candle', keywords: ['flame'] },
      { char: '⏱️', name: 'Stopwatch', keywords: ['timer', 'speed'] },
      { char: '⏰', name: 'Alarm Clock', keywords: ['reminder', 'alert'] },
      { char: '⏳', name: 'Hourglass Not Done', keywords: ['wait', 'pending'] },
      { char: '⌛', name: 'Hourglass Done', keywords: ['time up'] },
      { char: '📡', name: 'Satellite Antenna', keywords: ['signal', 'network'] },
      { char: '✉️', name: 'Envelope', keywords: ['mail', 'letter'] },
      { char: '📧', name: 'E-Mail', keywords: ['email', 'send'] },
      { char: '📨', name: 'Incoming Envelope', keywords: ['inbox'] },
      { char: '📩', name: 'Envelope with Arrow', keywords: ['outbox'] },
      { char: '📦', name: 'Package', keywords: ['box', 'delivery', 'shipping'] },
      { char: '📫', name: 'Closed Mailbox with Raised Flag', keywords: ['mail'] },
      { char: '📜', name: 'Scroll', keywords: ['ancient', 'document'] },
      { char: '📄', name: 'Page Facing Up', keywords: ['document', 'file'] },
      { char: '📑', name: 'Bookmark Tabs', keywords: ['tabs'] },
      { char: '📊', name: 'Bar Chart', keywords: ['analytics', 'stats'] },
      { char: '📈', name: 'Chart Increasing', keywords: ['growth', 'profit', 'sales'] },
      { char: '📉', name: 'Chart Decreasing', keywords: ['loss', 'down'] },
      { char: '📋', name: 'Clipboard', keywords: ['tasks', 'list', 'crm'] },
      { char: '📌', name: 'Pushpin', keywords: ['pin', 'note'] },
      { char: '📍', name: 'Round Pushpin', keywords: ['location', 'map'] },
      { char: '📎', name: 'Paperclip', keywords: ['attachment', 'link'] },
      { char: '🖇️', name: 'Linked Paperclips', keywords: ['chain'] },
      { char: '📏', name: 'Straight Ruler', keywords: ['measure'] },
      { char: '📐', name: 'Triangular Ruler', keywords: ['math'] },
      { char: '✂️', name: 'Scissors', keywords: ['cut'] },
      { char: '📝', name: 'Memo', keywords: ['note', 'draft'] },
      { char: '📁', name: 'File Folder', keywords: ['directory'] },
      { char: '📂', name: 'Open File Folder', keywords: ['files'] },
      { char: '📅', name: 'Calendar', keywords: ['schedule', 'date'] },
      { char: '📆', name: 'Tear-Off Calendar', keywords: ['meeting'] },
      { char: '🗑️', name: 'Wastebasket', keywords: ['trash', 'delete'] },
      { char: '🔒', name: 'Locked', keywords: ['secure', 'privacy'] },
      { char: '🔓', name: 'Unlocked', keywords: ['access', 'open'] },
      { char: '🔑', name: 'Key', keywords: ['password', 'solution'] },
      { char: '🗝️', name: 'Old Key', keywords: ['secret'] },
      { char: '🔨', name: 'Hammer', keywords: ['build', 'tool'] },
      { char: '🪓', name: 'Axe', keywords: ['chop'] },
      { char: '🛠️', name: 'Hammer and Wrench', keywords: ['settings', 'fix'] },
      { char: '🔧', name: 'Wrench', keywords: ['repair'] },
      { char: '🔩', name: 'Nut and Bolt', keywords: ['hardware'] },
      { char: '⚙️', name: 'Gear', keywords: ['settings', 'cog'] },
      { char: '🧲', name: 'Magnet', keywords: ['attract', 'lead'] },
      { char: '🪜', name: 'Ladder', keywords: ['climb', 'growth'] },
      { char: '🛡️', name: 'Shield', keywords: ['security', 'protect'] },
      { char: '🔔', name: 'Bell', keywords: ['notification', 'alert'] },
      { char: '📢', name: 'Loudspeaker', keywords: ['announcement', 'broadcast'] },
      { char: '📣', name: 'Megaphone', keywords: ['campaign', 'promo'] },
      { char: '🏷️', name: 'Label', keywords: ['tag', 'price'] },
      { char: '🛍️', name: 'Shopping Bags', keywords: ['store', 'retail'] },
      { char: '🛒', name: 'Shopping Cart', keywords: ['ecommerce', 'buy'] },
      { char: '💳', name: 'Credit Card', keywords: ['payment', 'buy'] },
      { char: '💰', name: 'Money Bag', keywords: ['cash', 'revenue'] },
      { char: '💵', name: 'Dollar Banknote', keywords: ['currency', 'usd'] },
      { char: '🪙', name: 'Coin', keywords: ['crypto', 'credits'] },
      { char: '🧾', name: 'Receipt', keywords: ['invoice', 'bill'] },
      { char: '🎁', name: 'Wrapped Gift', keywords: ['present', 'offer'] },
      { char: '🎈', name: 'Balloon', keywords: ['celebrate', 'fun'] },
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols & Hearts',
    icon: '❤️',
    emojis: [
      { char: '❤️', name: 'Red Heart', keywords: ['love'] },
      { char: '🧡', name: 'Orange Heart', keywords: ['warmth'] },
      { char: '💛', name: 'Yellow Heart', keywords: ['friendship'] },
      { char: '💚', name: 'Green Heart', keywords: ['whatsapp', 'nature'] },
      { char: '💙', name: 'Blue Heart', keywords: ['peace', 'trust'] },
      { char: '💜', name: 'Purple Heart', keywords: ['honor'] },
      { char: '🖤', name: 'Black Heart', keywords: ['dark'] },
      { char: '🤍', name: 'White Heart', keywords: ['pure'] },
      { char: '🤎', name: 'Brown Heart', keywords: ['earth'] },
      { char: '💔', name: 'Broken Heart', keywords: ['sad', 'breakup'] },
      { char: '❤️‍🔥', name: 'Heart on Fire', keywords: ['passion', 'burn'] },
      { char: '❤️‍🩹', name: 'Mending Heart', keywords: ['healing'] },
      { char: '❣️', name: 'Heart Exclamation', keywords: ['alert', 'love'] },
      { char: '💕', name: 'Two Hearts', keywords: ['affection'] },
      { char: '💞', name: 'Revolving Hearts', keywords: ['romance'] },
      { char: '💓', name: 'Beating Heart', keywords: ['pulse'] },
      { char: '💗', name: 'Growing Heart', keywords: ['love'] },
      { char: '💖', name: 'Sparkling Heart', keywords: ['shine'] },
      { char: '💘', name: 'Heart with Arrow', keywords: ['cupid'] },
      { char: '💝', name: 'Heart with Ribbon', keywords: ['gift'] },
      { char: '💟', name: 'Heart Decoration', keywords: ['ornament'] },
      { char: '💯', name: 'Hundred Points', keywords: ['perfect', 'score', '100'] },
      { char: '🔥', name: 'Fire', keywords: ['hot', 'lit', 'popular', 'trend'] },
      { char: '✨', name: 'Sparkles', keywords: ['magic', 'new', 'clean', 'ai'] },
      { char: '🌟', name: 'Glowing Star', keywords: ['star', 'bright'] },
      { char: '⭐', name: 'Star', keywords: ['favorite', 'rating'] },
      { char: '💥', name: 'Collision', keywords: ['boom', 'blast'] },
      { char: '💢', name: 'Anger Sign', keywords: ['mad'] },
      { char: '💫', name: 'Dizzy', keywords: ['star'] },
      { char: '💬', name: 'Speech Balloon', keywords: ['chat', 'message'] },
      { char: '👁️‍🗨️', name: 'Eye in Speech Bubble', keywords: ['witness'] },
      { char: '🗯️', name: 'Right Anger Bubble', keywords: ['shout'] },
      { char: '💭', name: 'Thought Balloon', keywords: ['idea', 'think'] },
      { char: '💤', name: 'Zzz', keywords: ['sleep'] },
      { char: '✅', name: 'Check Mark Button', keywords: ['done', 'yes', 'verified'] },
      { char: '✔️', name: 'Check Mark', keywords: ['correct', 'tick'] },
      { char: '☑️', name: 'Check Box with Check', keywords: ['tick'] },
      { char: '❌', name: 'Cross Mark', keywords: ['no', 'cancel'] },
      { char: '❎', name: 'Cross Mark Button', keywords: ['cancel'] },
      { char: '➕', name: 'Plus', keywords: ['add'] },
      { char: '➖', name: 'Minus', keywords: ['subtract'] },
      { char: '➗', name: 'Division', keywords: ['math'] },
      { char: '✖️', name: 'Multiply', keywords: ['times'] },
      { char: '⚡', name: 'High Voltage', keywords: ['fast', 'electric', 'quick'] },
      { char: '🎉', name: 'Party Popper', keywords: ['celebrate', 'congrats'] },
      { char: '🎊', name: 'Confetti Ball', keywords: ['party'] },
      { char: '⚠️', name: 'Warning', keywords: ['alert', 'caution'] },
      { char: '⛔', name: 'No Entry', keywords: ['stop', 'forbidden'] },
      { char: '🚫', name: 'Prohibited', keywords: ['no', 'ban'] },
      { char: '🛑', name: 'Stop Sign', keywords: ['halt'] },
      { char: '❕', name: 'White Exclamation Mark', keywords: ['alert'] },
      { char: '❗️', name: 'Red Exclamation Mark', keywords: ['important'] },
      { char: '❓', name: 'Question Mark', keywords: ['ask', 'help'] },
      { char: '❔', name: 'White Question Mark', keywords: ['help'] },
      { char: '‼️', name: 'Double Exclamation Mark', keywords: ['urgent'] },
      { char: '⁉️', name: 'Exclamation Question Mark', keywords: ['what'] },
      { char: '♻️', name: 'Recycling Symbol', keywords: ['eco', 'green'] },
      { char: '❇️', name: 'Sparkle', keywords: ['clean'] },
      { char: '✳️', name: 'Eight-Spoked Asterisk', keywords: ['star'] },
      { char: '✴️', name: 'Eight-Pointed Star', keywords: ['shine'] },
      { char: '🌐', name: 'Globe with Meridians', keywords: ['web', 'internet', 'url'] },
      { char: '💠', name: 'Diamond with a Dot', keywords: ['cute'] },
      { char: '🔘', name: 'Radio Button', keywords: ['select'] },
      { char: '🔴', name: 'Red Circle', keywords: ['record', 'dot'] },
      { char: '🟠', name: 'Orange Circle', keywords: ['dot'] },
      { char: '🟡', name: 'Yellow Circle', keywords: ['dot'] },
      { char: '🟢', name: 'Green Circle', keywords: ['online', 'active', 'whatsapp'] },
      { char: '🔵', name: 'Blue Circle', keywords: ['dot'] },
      { char: '🟣', name: 'Purple Circle', keywords: ['dot'] },
      { char: '⚫', name: 'Black Circle', keywords: ['dot'] },
      { char: '⚪', name: 'White Circle', keywords: ['dot'] },
      { char: '🟥', name: 'Red Square', keywords: ['box'] },
      { char: '🟧', name: 'Orange Square', keywords: ['box'] },
      { char: '🟨', name: 'Yellow Square', keywords: ['box'] },
      { char: '🟩', name: 'Green Square', keywords: ['box'] },
      { char: '🟦', name: 'Blue Square', keywords: ['box'] },
      { char: '🟪', name: 'Purple Square', keywords: ['box'] },
      { char: '⬛', name: 'Black Large Square', keywords: ['box'] },
      { char: '⬜', name: 'White Large Square', keywords: ['box'] },
      { char: '🔷', name: 'Large Blue Diamond', keywords: ['jewel'] },
      { char: '🔶', name: 'Large Orange Diamond', keywords: ['jewel'] },
      { char: '🔹', name: 'Small Blue Diamond', keywords: ['bullet'] },
      { char: '🔸', name: 'Small Orange Diamond', keywords: ['bullet'] },
      { char: '🔺', name: 'Red Triangle Pointed Up', keywords: ['up'] },
      { char: '🔻', name: 'Red Triangle Pointed Down', keywords: ['down'] },
      { char: '▶️', name: 'Play Button', keywords: ['start', 'video'] },
      { char: '⏸️', name: 'Pause Button', keywords: ['stop'] },
      { char: '⏯️', name: 'Play or Pause Button', keywords: ['toggle'] },
      { char: '⏹️', name: 'Stop Button', keywords: ['halt'] },
      { char: '⏺️', name: 'Record Button', keywords: ['rec'] },
      { char: '⏭️', name: 'Next Track Button', keywords: ['forward'] },
      { char: '⏮️', name: 'Last Track Button', keywords: ['previous'] },
      { char: '⏩', name: 'Fast-Forward Button', keywords: ['speed'] },
      { char: '⏪', name: 'Fast Reverse Button', keywords: ['rewind'] },
      { char: '🔀', name: 'Shuffle Tracks Button', keywords: ['random'] },
      { char: '🔁', name: 'Repeat Button', keywords: ['loop'] },
      { char: '🔂', name: 'Repeat Single Button', keywords: ['loop 1'] },
      { char: '➡️', name: 'Right Arrow', keywords: ['next', 'direction'] },
      { char: '⬅️', name: 'Left Arrow', keywords: ['back'] },
      { char: '⬆️', name: 'Up Arrow', keywords: ['upwards'] },
      { char: '⬇️', name: 'Down Arrow', keywords: ['downwards'] },
      { char: '↗️', name: 'Up-Right Arrow', keywords: ['diagonal'] },
      { char: '↘️', name: 'Down-Right Arrow', keywords: ['diagonal'] },
      { char: '↙️', name: 'Down-Left Arrow', keywords: ['diagonal'] },
      { char: '↖️', name: 'Up-Left Arrow', keywords: ['diagonal'] },
      { char: '🔄', name: 'Counterclockwise Arrows Button', keywords: ['refresh', 'reload'] },
      { char: '🆕', name: 'NEW Button', keywords: ['new', 'fresh'] },
      { char: '🆙', name: 'UP! Button', keywords: ['level up'] },
      { char: '🆗', name: 'OK Button', keywords: ['agree'] },
      { char: '🆒', name: 'COOL Button', keywords: ['cool'] },
      { char: '🆘', name: 'SOS Button', keywords: ['emergency', 'help'] },
      { char: '0️⃣', name: 'Keycap 0', keywords: ['zero'] },
      { char: '1️⃣', name: 'Keycap 1', keywords: ['one'] },
      { char: '2️⃣', name: 'Keycap 2', keywords: ['two'] },
      { char: '3️⃣', name: 'Keycap 3', keywords: ['three'] },
      { char: '4️⃣', name: 'Keycap 4', keywords: ['four'] },
      { char: '5️⃣', name: 'Keycap 5', keywords: ['five'] },
      { char: '6️⃣', name: 'Keycap 6', keywords: ['six'] },
      { char: '7️⃣', name: 'Keycap 7', keywords: ['seven'] },
      { char: '8️⃣', name: 'Keycap 8', keywords: ['eight'] },
      { char: '9️⃣', name: 'Keycap 9', keywords: ['nine'] },
      { char: '🔟', name: 'Keycap 10', keywords: ['ten'] },
      { char: '#️⃣', name: 'Keycap Number Sign', keywords: ['hash', 'tag'] },
      { char: '*️⃣', name: 'Keycap Asterisk', keywords: ['star'] },
    ],
  },
  {
    id: 'flags',
    label: 'Flags',
    icon: '🚩',
    emojis: [
      { char: '🚩', name: 'Triangular Flag', keywords: ['post', 'red flag'] },
      { char: '🏁', name: 'Chequered Flag', keywords: ['finish', 'race'] },
      { char: '🎌', name: 'Crossed Flags', keywords: ['celebrate'] },
      { char: '🏴', name: 'Black Flag', keywords: ['pirate'] },
      { char: '🏳️', name: 'White Flag', keywords: ['peace', 'surrender'] },
      { char: '🏳️‍🌈', name: 'Rainbow Flag', keywords: ['pride'] },
      { char: '🏴‍☠️', name: 'Pirate Flag', keywords: ['skull'] },
      { char: '🇮🇳', name: 'Flag: India', keywords: ['bharat', 'hindustan', 'in'] },
      { char: '🇺🇸', name: 'Flag: United States', keywords: ['usa', 'america'] },
      { char: '🇬🇧', name: 'Flag: United Kingdom', keywords: ['uk', 'britain', 'london'] },
      { char: '🇦🇪', name: 'Flag: United Arab Emirates', keywords: ['uae', 'dubai'] },
      { char: '🇸🇦', name: 'Flag: Saudi Arabia', keywords: ['saudi', 'riyadh'] },
      { char: '🇨🇦', name: 'Flag: Canada', keywords: ['ca'] },
      { char: '🇦🇺', name: 'Flag: Australia', keywords: ['aus'] },
      { char: '🇩🇪', name: 'Flag: Germany', keywords: ['de'] },
      { char: '🇫🇷', name: 'Flag: France', keywords: ['paris', 'french'] },
      { char: '🇮🇹', name: 'Flag: Italy', keywords: ['rome'] },
      { char: '🇯🇵', name: 'Flag: Japan', keywords: ['tokyo'] },
      { char: '🇨🇳', name: 'Flag: China', keywords: ['beijing'] },
      { char: '🇧🇷', name: 'Flag: Brazil', keywords: ['rio'] },
      { char: '🇸🇬', name: 'Flag: Singapore', keywords: ['sg'] },
      { char: '🇲🇾', name: 'Flag: Malaysia', keywords: ['kuala lumpur'] },
      { char: '🇮🇩', name: 'Flag: Indonesia', keywords: ['bali'] },
      { char: '🇹🇭', name: 'Flag: Thailand', keywords: ['bangkok'] },
      { char: '🇻🇳', name: 'Flag: Vietnam', keywords: ['hanoi'] },
      { char: '🇧🇩', name: 'Flag: Bangladesh', keywords: ['dhaka'] },
      { char: '🇵🇰', name: 'Flag: Pakistan', keywords: ['pk'] },
      { char: '🇳🇵', name: 'Flag: Nepal', keywords: ['kathmandu'] },
      { char: '🇱🇰', name: 'Flag: Sri Lanka', keywords: ['colombo'] },
      { char: '🇰🇷', name: 'Flag: South Korea', keywords: ['seoul', 'kpop'] },
      { char: '🇷🇺', name: 'Flag: Russia', keywords: ['moscow'] },
      { char: '🇪🇸', name: 'Flag: Spain', keywords: ['madrid'] },
      { char: '🇲🇽', name: 'Flag: Mexico', keywords: ['mexico'] },
      { char: '🇿🇦', name: 'Flag: South Africa', keywords: ['africa'] },
      { char: '🇳🇬', name: 'Flag: Nigeria', keywords: ['lagos'] },
      { char: '🇪🇬', name: 'Flag: Egypt', keywords: ['cairo', 'pyramid'] },
      { char: '🇹🇷', name: 'Flag: Turkey', keywords: ['istanbul'] },
      { char: '🇳🇱', name: 'Flag: Netherlands', keywords: ['amsterdam'] },
      { char: '🇨🇭', name: 'Flag: Switzerland', keywords: ['swiss'] },
      { char: '🇸🇪', name: 'Flag: Sweden', keywords: ['stockholm'] },
      { char: '🇦🇷', name: 'Flag: Argentina', keywords: ['buenos aires', 'messi'] },
      { char: '🇵🇹', name: 'Flag: Portugal', keywords: ['lisbon', 'ronaldo'] },
    ],
  },
]

type WhatsAppEmojiPickerProps = {
  onSelectEmoji: (emoji: string) => void
  onClose: () => void
}

export function WhatsAppEmojiPicker({ onSelectEmoji, onClose }: WhatsAppEmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('smileys')
  const [hoveredEmoji, setHoveredEmoji] = useState<EmojiItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Close on Escape or click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Filter emojis based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return EMOJI_CATEGORIES

    const query = searchQuery.toLowerCase().trim()
    return EMOJI_CATEGORIES.map((category) => {
      const matchingEmojis = category.emojis.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.char === query ||
          e.keywords?.some((k) => k.toLowerCase().includes(query)),
      )
      return {
        ...category,
        emojis: matchingEmojis,
      }
    }).filter((category) => category.emojis.length > 0)
  }, [searchQuery])

  // Smooth scroll to category
  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
    const element = categoryRefs.current[categoryId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full mb-3 left-2 z-50 w-[350px] sm:w-[410px] h-[410px] bg-[#f0f2f5] border border-[#d1d7db] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none"
      style={{
        boxShadow: '0 14px 40px -4px rgba(11, 20, 26, 0.22), 0 0 0 1px rgba(11, 20, 26, 0.06)',
      }}
    >
      {/* Top Search Bar */}
      <div className="p-2.5 pb-2 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center gap-2">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-[#54656f] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search emoji (e.g. smile, love, clap, car, flag)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-7 py-1.5 bg-white text-xs sm:text-sm text-ink placeholder-[#667781] rounded-lg outline-none border border-transparent focus:border-whatsapp-500 transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-ink cursor-pointer p-0.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#54656f] hover:text-ink hover:bg-[#e9edef] rounded-full transition-colors cursor-pointer"
          title="Close emoji panel"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Category Tabs (WhatsApp Web style with smooth horizontal scroll) */}
      {!searchQuery && (
        <div className="flex items-center gap-0.5 px-2 py-1 bg-[#f0f2f5] border-b border-[#e9edef] text-sm overflow-x-auto no-scrollbar">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategory(cat.id)}
              className={`p-1.5 px-2 rounded-lg text-lg transition-all cursor-pointer relative shrink-0 ${
                activeCategory === cat.id
                  ? 'text-whatsapp-700 bg-white shadow-2xs'
                  : 'text-[#54656f] hover:text-ink hover:bg-[#e2e7ea]'
              }`}
              title={cat.label}
            >
              <span>{cat.icon}</span>
              {activeCategory === cat.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-whatsapp-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable Emoji Grid Container */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 no-scrollbar">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#667781] text-xs">
            <span className="text-3xl mb-2">🔍</span>
            <span>No emojis found for &ldquo;{searchQuery}&rdquo;</span>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              ref={(el) => {
                categoryRefs.current[category.id] = el
              }}
              className="space-y-1.5"
            >
              <h4 className="text-[11px] font-bold text-[#667781] uppercase tracking-wider sticky top-0 bg-[#f0f2f5]/95 backdrop-blur-xs py-1 z-10">
                {category.label}
              </h4>
              <div className="grid grid-cols-8 gap-1">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji.char + emoji.name}
                    type="button"
                    onClick={() => onSelectEmoji(emoji.char)}
                    onMouseEnter={() => setHoveredEmoji(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-white rounded-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    title={emoji.name}
                  >
                    <span>{emoji.char}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* WhatsApp Hover Preview Bottom Bar */}
      <div className="px-3 py-2 bg-[#f0f2f5] border-t border-[#e9edef] flex items-center gap-2.5 h-10 text-xs text-[#54656f]">
        {hoveredEmoji ? (
          <>
            <span className="text-2xl leading-none">{hoveredEmoji.char}</span>
            <span className="font-medium text-ink truncate">{hoveredEmoji.name}</span>
          </>
        ) : (
          <span className="text-[11px] text-[#8696a0]">Hover over an emoji or click to insert</span>
        )}
      </div>
    </div>
  )
}
