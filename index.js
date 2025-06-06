require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Initialize client
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildModeration
    ]
});

// Configuration
const defaultPrefix = 'k!';
const prefixFilePath = path.join(__dirname, 'prefixes.json');
let prefixes = {};

// Load prefixes from file
try {
    if (fs.existsSync(prefixFilePath)) {
        prefixes = JSON.parse(fs.readFileSync(prefixFilePath));
    }
} catch (err) {
    console.error('Error loading prefixes:', err);
}

// Auto-moderation config
const autoModConfig = {
    bannedWords: ['2g1c', '2 girls 1 cup', 'acrotomophilia', 'alabama hot pocket', 'alaskan pipeline', 'anal', 'anilingus', 'anus', 'apeshit', 'arsehole', 'ass', 'asshole', 'assmunch', 'auto erotic', 'autoerotic', 'babeland', 'baby batter', 'baby juice', 'ball gag', 'ball gravy', 'ball kicking', 'ball licking', 'ball sack', 'ball sucking', 'bangbros', 'bangbus', 'bareback', 'barely legal', 'barenaked', 'bastard', 'bastardo', 'bastinado', 'bbw', 'bdsm', 'beaner', 'beaners', 'beaver cleaver', 'beaver lips', 'beastiality', 'bestiality', 'big black', 'big breasts', 'big knockers', 'big tits', 'bimbos', 'birdlock', 'bitch', 'bitches', 'black cock', 'blonde action', 'blonde on blonde action', 'blowjob', 'blow job', 'blow your load', 'blue waffle', 'blumpkin', 'bollocks', 'bondage', 'boner', 'boob', 'boobs', 'booty call', 'brown showers', 'brunette action', 'bukkake', 'bulldyke', 'bullet vibe', 'bullshit', 'bung hole', 'bunghole', 'busty', 'butt', 'buttcheeks', 'butthole', 'camel toe', 'camgirl', 'camslut', 'camwhore', 'carpet muncher', 'carpetmuncher', 'chocolate rosebuds', 'cialis', 'circlejerk', 'cleveland steamer', 'clit', 'clitoris', 'clover clamps', 'clusterfuck', 'cock', 'cocks', 'coprolagnia', 'coprophilia', 'cornhole', 'coon', 'coons', 'creampie', 'cum', 'cumming', 'cumshot', 'cumshots', 'cunnilingus', 'cunt', 'darkie', 'date rape', 'daterape', 'deep throat', 'deepthroat', 'dendrophilia', 'dick', 'dildo', 'dingleberry', 'dingleberries', 'dirty pillows', 'dirty sanchez', 'doggie style', 'doggiestyle', 'doggy style', 'doggystyle', 'dog style', 'dolcett', 'domination', 'dominatrix', 'dommes', 'donkey punch', 'double dong', 'double penetration', 'dp action', 'dry hump', 'dvda', 'eat my ass', 'ecchi', 'ejaculation', 'erotic', 'erotism', 'escort', 'eunuch', 'fag', 'faggot', 'fecal', 'felch', 'fellatio', 'feltch', 'female squirting', 'femdom', 'figging', 'fingerbang', 'fingering', 'fisting', 'foot fetish', 'footjob', 'frotting', 'fuck', 'fuck buttons', 'fuckin', 'fucking', 'fucktards', 'fudge packer', 'fudgepacker', 'futanari', 'gangbang', 'gang bang', 'gay sex', 'genitals', 'giant cock', 'girl on', 'girl on top', 'girls gone wild', 'goatcx', 'goatse', 'god damn', 'gokkun', 'golden shower', 'goodpoop', 'goo girl', 'goregasm', 'grope', 'group sex', 'g-spot', 'guro', 'hand job', 'handjob', 'hard core', 'hardcore', 'hentai', 'homoerotic', 'honkey', 'hooker', 'horny', 'hot carl', 'hot chick', 'how to kill', 'how to murder', 'huge fat', 'humping', 'incest', 'intercourse', 'jack off', 'jail bait', 'jailbait', 'jelly donut', 'jerk off', 'jigaboo', 'jiggaboo', 'jiggerboo', 'jizz', 'juggs', 'kike', 'kinbaku', 'kinkster', 'kinky', 'knobbing', 'leather restraint', 'leather straight jacket', 'lemon party', 'livesex', 'lolita', 'lovemaking', 'make me come', 'male squirting', 'masturbate', 'masturbating', 'masturbation', 'menage a trois', 'milf', 'missionary position', 'mong', 'motherfucker', 'mound of venus', 'mr hands', 'muff diver', 'muffdiving', 'nambla', 'nawashi', 'negro', 'neonazi', 'nigga', 'nigger', 'nig nog', 'nimphomania', 'nipple', 'nipples', 'nsfw', 'nsfw images', 'nude', 'nudity', 'nutten', 'nympho', 'nymphomania', 'octopussy', 'omorashi', 'one cup two girls', 'one guy one jar', 'orgasm', 'orgy', 'paedophile', 'paki', 'panties', 'panty', 'pedobear', 'pedophile', 'pegging', 'penis', 'phone sex', 'piece of shit', 'pikey', 'pissing', 'piss pig', 'pisspig', 'playboy', 'pleasure chest', 'pole smoker', 'ponyplay', 'poof', 'poon', 'poontang', 'punany', 'poop chute', 'poopchute', 'porn', 'porno', 'pornography', 'prince albert piercing', 'pthc', 'pubes', 'pussy', 'queaf', 'queef', 'quim', 'raghead', 'raging boner', 'rape', 'raping', 'rapist', 'rectum', 'reverse cowgirl', 'rimjob', 'rimming', 'rosy palm', 'rosy palm and her 5 sisters', 'rusty trombone', 'sadism', 'santorum', 'scat', 'schlong', 'scissoring', 'semen', 'sex', 'sexcam', 'sexo', 'sexy', 'sexual', 'sexually', 'sexuality', 'shaved beaver', 'shaved pussy', 'shemale', 'shibari', 'shit', 'shitblimp', 'shitty', 'shota', 'shrimping', 'skeet', 'slanteye', 'slut', 's&m', 'smut', 'snatch', 'snowballing', 'sodomize', 'sodomy', 'spastic', 'spic', 'splooge', 'splooge moose', 'spooge', 'spread legs', 'spunk', 'strap on', 'strapon', 'strappado', 'strip club', 'style doggy', 'suck', 'sucks', 'suicide girls', 'sultry women', 'swastika', 'swinger', 'tainted love', 'taste my', 'tea bagging', 'threesome', 'throating', 'thumbzilla', 'tied up', 'tight white', 'tit', 'tits', 'titties', 'titty', 'tongue in a', 'topless', 'tosser', 'towelhead', 'tranny', 'tribadism', 'tub girl', 'tubgirl', 'tushy', 'twat', 'twink', 'twinkie', 'two girls one cup', 'undressing', 'upskirt', 'urethra play', 'urophilia', 'vagina', 'venus mound', 'viagra', 'vibrator', 'violet wand', 'vorarephilia', 'voyeur', 'voyeurweb', 'voyuer', 'vulva', 'wank', 'wetback', 'wet dream', 'white power', 'whore', 'worldsex', 'wrapping men', 'wrinkled starfish', 'xx', 'xxx', 'yaoi', 'yellow showers', 'yiffy', 'zoophilia'],
    spamThreshold: 5,
    spamWindow: 5000,
    maxMentions: 5,
    maxLinks: 2,
    maxAttachments: 3,
    maxCapsRatio: 0.7,
    muteDuration: 300,
    warnThreshold: 3,
    exemptRoles: ['', ''],
    exemptChannels: ['']
};

// Data stores
const hangmanGames = new Map();
const tttGames = new Map();
const rpsGames = new Map();
const userWarnings = new Collection();
const spamDetection = new Collection();

// Hangman words and drawing function (same as before)
// ...

// Utility Commands
const utilityCommands = {
    help: {
        execute: (message) => {
            const currentPrefix = prefixes[message.guild.id] || defaultPrefix;
            const embed = new EmbedBuilder()
                .setTitle('Bot Commands')
                .setColor('#0099ff')
                .addFields(
                    { name: 'Utility', value: `\`${currentPrefix}help\`, \`${currentPrefix}userinfo\`, \`${currentPrefix}serverinfo\`, \`${currentPrefix}ping\`, \`${currentPrefix}setprefix\`` },
                    { name: 'Games', value: `\`${currentPrefix}hangman\`, \`${currentPrefix}tictactoe\`, \`${currentPrefix}rps\`` },
                    { name: 'Moderation', value: `\`${currentPrefix}ban\`, \`${currentPrefix}kick\`, \`${currentPrefix}timeout\`, \`${currentPrefix}clear\` (Admin only)` }
                );
            message.channel.send({ embeds: [embed] });
        }
    },
    setprefix: {
        execute: (message, args) => {
            if (!message.member.permissions.has('Administrator')) {
                return message.reply('You need administrator permissions to change the prefix!');
            }
            
            if (!args[0]) {
                return message.reply('Please specify a new prefix!');
            }
            
            const newPrefix = args[0];
            prefixes[message.guild.id] = newPrefix;
            
            fs.writeFile(prefixFilePath, JSON.stringify(prefixes), (err) => {
                if (err) {
                    console.error(err);
                    return message.reply('Failed to save the new prefix!');
                }
                message.reply(`Prefix successfully set to \`${newPrefix}\``);
            });
        }
    },
    // ... other utility commands ...
};

// Hangman Command with message editing
gameCommands.hangman = {
    execute: async (message) => {
        const userId = message.author.id;
        
        if (hangmanGames.has(userId)) {
            message.reply('You already have an ongoing Hangman game!').then(msg => setTimeout(() => msg.delete(), 3000));
            return;
        }
        
        const word = hangmanWords[Math.floor(Math.random() * hangmanWords.length)].toLowerCase();
        const hiddenWord = '_'.repeat(word.length).split('').join(' ');
        const wrongGuesses = [];
        
        const embed = new EmbedBuilder()
            .setTitle('Hangman Game')
            .setDescription(getHangmanDrawing(0))
            .addFields(
                { name: 'Word', value: hiddenWord },
                { name: 'Wrong Guesses', value: 'None' },
                { name: 'Attempts Left', value: '6' }
            )
            .setFooter({ text: 'Type a letter to guess!' });
            
        const gameMessage = await message.channel.send({ embeds: [embed] });
        
        hangmanGames.set(userId, {
            word,
            hiddenWord,
            wrongGuesses,
            attemptsLeft: 6,
            guessedLetters: [],
            messageId: gameMessage.id
        });
    }
};

// Enhanced Auto-Moderation
async function handleAutoModeration(message) {
    // ... (same auto-moderation implementation as before) ...
}

// Message handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // Get prefix for this guild
    const currentPrefix = prefixes[message.guild.id] || defaultPrefix;
    
    // Handle auto-moderation
    const shouldSkip = await handleAutoModeration(message);
    if (shouldSkip) return;
    
    // Handle Hangman game
    await handleHangmanGame(message);
    
    // Command handling
    if (!message.content.startsWith(currentPrefix)) return;
    
    const args = message.content.slice(currentPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    if (utilityCommands[commandName]) {
        utilityCommands[commandName].execute(message, args);
    } else if (gameCommands[commandName]) {
        gameCommands[commandName].execute(message, args);
    } else if (moderationCommands[commandName]) {
        moderationCommands[commandName].execute(message, args);
    }
});

// ... (rest of the existing code - button interactions, helper functions, etc.) ...

client.login(process.env.DISCORD_TOKEN);
