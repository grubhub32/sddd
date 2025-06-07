const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token } = require('./config.js'); 

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

// Load prefixes
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

// Hangman words
const hangmanWords = ['javascript', 'discord', 'developer', 'bot', 'programming', 'hangman', 'computer', 'hello', 'Owner', 'abyssfral', 'better', 'Discord'];

// Improved Hangman drawing
function getHangmanDrawing(incorrectGuesses) {
    const stages = [
        `
          _______
         |/      |
         |      
         |      
         |       
         |      
         |
        _|___
        `,
        `
          _______
         |/      |
         |      (_)
         |      
         |       
         |      
         |
        _|___
        `,
        `
          _______
         |/      |
         |      (_)
         |       |
         |       |
         |      
         |
        _|___
        `,
        `
          _______
         |/      |
         |      (_)
         |      \\|
         |       |
         |      
         |
        _|___
        `,
        `
          _______
         |/      |
         |      (_)
         |      \\|/
         |       |
         |      
         |
        _|___
        `,
        `
          _______
         |/      |
         |      (_)
         |      \\|/
         |       |
         |      / 
         |
        _|___
        `,
        `
          _______
         |/      |
         |      (_)
         |      \\|/
         |       |
         |      / \\
         |
        _|___
        `
    ];
    return stages[incorrectGuesses];
}

// Command collections
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
    ping: {
        execute: (message) => {
            message.channel.send(`Pong! Latency is ${Date.now() - message.createdTimestamp}ms.`);
        }
    },
    userinfo: {
        execute: (message) => {
            const user = message.mentions.users.first() || message.author;
            const member = message.guild.members.cache.get(user.id);
            
            const embed = new EmbedBuilder()
                .setTitle(`User Info - ${user.username}`)
                .setThumbnail(user.displayAvatarURL())
                .setColor('#0099ff')
                .addFields(
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Username', value: user.tag, inline: true },
                    { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
                    { name: 'Account Created', value: user.createdAt.toDateString(), inline: true },
                    { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', '), inline: false }
                );
            message.channel.send({ embeds: [embed] });
        }
    },
    serverinfo: {
        execute: (message) => {
            const guild = message.guild;
            
            const embed = new EmbedBuilder()
                .setTitle(`Server Info - ${guild.name}`)
                .setThumbnail(guild.iconURL())
                .setColor('#0099ff')
                .addFields(
                    { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'Members', value: guild.memberCount.toString(), inline: true },
                    { name: 'Created', value: guild.createdAt.toDateString(), inline: true },
                    { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
                    { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
                    { name: 'Boost Level', value: guild.premiumTier.toString(), inline: true }
                );
            message.channel.send({ embeds: [embed] });
        }
    }
};

const gameCommands = {
    hangman: {
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
    },
    tictactoe: {
        execute: (message) => {
            // ... [existing tictactoe implementation] ...
        }
    },
    rps: {
        execute: (message) => {
            // ... [existing rps implementation] ...
        }
    }
};

const moderationCommands = {
    // ... [existing moderation commands] ...
};

// Auto-moderation functions
async function handleAutoModeration(message) {
    if (message.author.bot) return false;
    
    const member = message.member;
    const hasExemptRole = member.roles.cache.some(role => autoModConfig.exemptRoles.includes(role.name));
    const isExemptChannel = autoModConfig.exemptChannels.includes(message.channel.name);
    
    if (hasExemptRole || isExemptChannel) return false;
    
    const content = message.content.toLowerCase();
    const userId = message.author.id;
    
    // Banned words detection
    const foundWord = autoModConfig.bannedWords.find(word => content.includes(word));
    if (foundWord) {
        message.delete();
        message.channel.send(`${message.author}, your message contained inappropriate content.`)
            .then(msg => setTimeout(() => msg.delete(), 5000));
        warnUser(message.author, 'Used banned word');
        return true;
    }
    
    // Spam detection
    const userMessages = spamDetection.get(userId) || [];
    userMessages.push(Date.now());
    spamDetection.set(userId, userMessages.filter(t => Date.now() - t < autoModConfig.spamWindow));
    
    if (spamDetection.get(userId).length >= autoModConfig.spamThreshold) {
        message.channel.send(`${message.author}, please don't spam!`)
            .then(msg => setTimeout(() => msg.delete(), 3000));
        warnUser(message.author, 'Spamming messages');
        return true;
    }
    
    // ... [other auto-mod checks] ...
    
    return false;
}

function warnUser(user, reason) {
    const warnings = userWarnings.get(user.id) || [];
    warnings.push({ timestamp: Date.now(), reason });
    userWarnings.set(user.id, warnings);
    
    if (warnings.length >= autoModConfig.warnThreshold) {
        message.member.timeout(autoModConfig.muteDuration * 1000, 'Exceeded warning threshold')
            .then(() => message.channel.send(`${user} has been muted for ${autoModConfig.muteDuration / 60} minutes due to repeated violations.`))
            .catch(console.error);
        userWarnings.delete(user.id);
    }
}

// Hangman game handler
async function handleHangmanGame(message) {
    const userId = message.author.id;
    if (!hangmanGames.has(userId)) return;
    
    const game = hangmanGames.get(userId);
    
    if (message.content.length !== 1 || !/[a-z]/i.test(message.content)) {
        message.reply('Please guess a single letter!').then(msg => setTimeout(() => msg.delete(), 3000));
        return;
    }
    
    const guess = message.content.toLowerCase();
    
    if (game.guessedLetters.includes(guess)) {
        message.reply('You already guessed that letter!').then(msg => setTimeout(() => msg.delete(), 3000));
        return;
    }
    
    game.guessedLetters.push(guess);
    
    let shouldUpdate = false;
    let gameEnded = false;
    
    if (game.word.includes(guess)) {
        let newHidden = game.hiddenWord.split(' ');
        for (let i = 0; i < game.word.length; i++) {
            if (game.word[i] === guess) {
                newHidden[i] = guess;
            }
        }
        game.hiddenWord = newHidden.join(' ');
        shouldUpdate = true;
        
        if (!game.hiddenWord.includes('_')) {
            const winEmbed = new EmbedBuilder()
                .setTitle('Hangman - You Won! 🎉')
                .setDescription(getHangmanDrawing(6 - game.attemptsLeft))
                .addFields(
                    { name: 'The word was', value: game.word },
                    { name: 'Wrong Guesses', value: game.wrongGuesses.length > 0 ? game.wrongGuesses.join(', ') : 'None' }
                )
                .setColor('#00ff00');
            
            try {
                const gameMessage = await message.channel.messages.fetch(game.messageId);
                await gameMessage.edit({ embeds: [winEmbed] });
            } catch (err) {
                console.error('Failed to edit Hangman message:', err);
            }
            
            hangmanGames.delete(userId);
            gameEnded = true;
        }
    } else {
        if (!game.wrongGuesses.includes(guess)) {
            game.wrongGuesses.push(guess);
            game.attemptsLeft--;
            shouldUpdate = true;
            
            if (game.attemptsLeft <= 0) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle('Hangman - You Lost! 😵')
                    .setDescription(getHangmanDrawing(6))
                    .addFields(
                        { name: 'The word was', value: game.word },
                        { name: 'Wrong Guesses', value: game.wrongGuesses.join(', ') }
                    )
                    .setColor('#ff0000');
                
                try {
                    const gameMessage = await message.channel.messages.fetch(game.messageId);
                    await gameMessage.edit({ embeds: [loseEmbed] });
                } catch (err) {
                    console.error('Failed to edit Hangman message:', err);
                }
                
                hangmanGames.delete(userId);
                gameEnded = true;
            }
        }
    }
    
    if (shouldUpdate && !gameEnded) {
        const embed = new EmbedBuilder()
            .setTitle('Hangman Game')
            .setDescription(getHangmanDrawing(6 - game.attemptsLeft))
            .addFields(
                { name: 'Word', value: game.hiddenWord },
                { name: 'Wrong Guesses', value: game.wrongGuesses.length > 0 ? game.wrongGuesses.join(', ') : 'None' },
                { name: 'Attempts Left', value: game.attemptsLeft.toString() }
            )
            .setFooter({ text: 'Type a letter to guess!' });
        
        try {
            const gameMessage = await message.channel.messages.fetch(game.messageId);
            await gameMessage.edit({ embeds: [embed] });
        } catch (err) {
            console.error('Failed to edit Hangman message:', err);
        }
    }
    
    message.delete().catch(console.error);
}

// Message handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // Handle auto-moderation first
    const shouldSkip = await handleAutoModeration(message);
    if (shouldSkip) return;
    
    // Handle Hangman game
    await handleHangmanGame(message);
    
    // Get prefix for this guild
    const currentPrefix = prefixes[message.guild.id] || defaultPrefix;
    
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
    } else {
        message.reply(`Unknown command! Type \`${currentPrefix}help\` for a list of commands.`);
    }
});

// ... [rest of your existing code like button interactions] ...

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`Type ${defaultPrefix}help for commands`);
});

client.login(token);
