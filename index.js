require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.commands = new Collection();
const prefix = process.env.PREFIX;

// Auto-moderation variables
const bannedWords = ['bitch', 'nigger', 'nigga', 'ass', 'fuck',]; // Add your own banned words
const spamDetection = new Map();
const MAX_SPAM = 5; // Max messages in 5 seconds
const SPAM_TIME = 5000; // 5 seconds

// Game data stores
const hangmanGames = new Map();
const tttGames = new Map();
const rpsGames = new Map();

// Hangman words
const hangmanWords = ['javascript', 'discord', 'developer', 'bot', 'programming', 'hangman', 'computer', 'joulyxx', 'Best Owner',];
const hangmanStages = [
    `
      +---+
      |   |
          |
          |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
          |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
      |   |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
     /|   |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
     /|\\  |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
     /|\\  |
     /    |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
     /|\\  |
     / \\  |
          |
    =========
    `
];

// Utility Commands
const utilityCommands = {
    help: {
        execute: (message) => {
            const embed = new EmbedBuilder()
                .setTitle('Bot Commands')
                .setColor('#0099ff')
                .addFields(
                    { name: 'Utility', value: '`help`, `userinfo`, `serverinfo`, `ping`' },
                    { name: 'Games', value: '`hangman`, `tictactoe`, `rps`' },
                    { name: 'Moderation', value: '`ban`, `kick`, `timeout`, `clear` (Admin only)' }
                )
                .setFooter({ text: `Prefix: ${prefix}` });
            message.channel.send({ embeds: [embed] });
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

// Game Commands
const gameCommands = {
    hangman: {
        execute: (message) => {
            const userId = message.author.id;
            
            if (hangmanGames.has(userId)) {
                message.reply('You already have an ongoing Hangman game!');
                return;
            }
            
            const word = hangmanWords[Math.floor(Math.random() * hangmanWords.length)].toLowerCase();
            const hiddenWord = word.replace(/./g, '_ ');
            const wrongGuesses = [];
            
            hangmanGames.set(userId, {
                word,
                hiddenWord,
                wrongGuesses,
                attemptsLeft: 6
            });
            
            const embed = new EmbedBuilder()
                .setTitle('Hangman Game')
                .setDescription(hangmanStages[0])
                .addFields(
                    { name: 'Word', value: hiddenWord },
                    { name: 'Wrong Guesses', value: wrongGuesses.length > 0 ? wrongGuesses.join(', ') : 'None' },
                    { name: 'Attempts Left', value: '6' }
                )
                .setFooter({ text: 'Type a letter to guess!' });
                
            message.channel.send({ embeds: [embed] });
        }
    },
    tictactoe: {
        execute: (message) => {
            const mentionedUser = message.mentions.users.first();
            
            if (!mentionedUser) {
                message.reply('Please mention a user to play with!');
                return;
            }
            
            if (mentionedUser.bot) {
                message.reply('You can\'t play with a bot!');
                return;
            }
            
            if (mentionedUser.id === message.author.id) {
                message.reply('You can\'t play with yourself!');
                return;
            }
            
            const gameId = `${message.author.id}-${mentionedUser.id}`;
            
            if (tttGames.has(gameId)) {
                message.reply('There\'s already an ongoing Tic-Tac-Toe game between you two!');
                return;
            }
            
            tttGames.set(gameId, {
                board: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                players: [message.author.id, mentionedUser.id],
                currentPlayer: 0,
                messageId: null
            });
            
            const embed = new EmbedBuilder()
                .setTitle('Tic-Tac-Toe')
                .setDescription(`${message.author.username} (X) vs ${mentionedUser.username} (O)`)
                .addFields(
                    { name: 'Current Board', value: generateTTTBoard(gameId) }
                )
                .setFooter({ text: `It's ${message.author.username}'s turn!` });
                
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ttt_1').setLabel(' ').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ttt_2').setLabel(' ').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ttt_3').setLabel(' ').setStyle(ButtonStyle.Secondary)
            );
            
            const buttons2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ttt_4').setLabel(' ').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ttt_5').setLabel(' ').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ttt_6').setLabel(' ').setStyle(ButtonStyle.Secondary)
            );
            
            const buttons3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ttt_7').setLabel(' ').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ttt_8').setLabel(' ').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ttt_9').setLabel(' ').setStyle(ButtonStyle.Secondary)
            );
            
            message.channel.send({ 
                embeds: [embed], 
                components: [buttons, buttons2, buttons3] 
            }).then(msg => {
                tttGames.get(gameId).messageId = msg.id;
            });
        }
    },
    rps: {
        execute: (message) => {
            const mentionedUser = message.mentions.users.first();
            
            if (!mentionedUser) {
                message.reply('Please mention a user to play with!');
                return;
            }
            
            if (mentionedUser.bot) {
                message.reply('You can\'t play with a bot!');
                return;
            }
            
            if (mentionedUser.id === message.author.id) {
                message.reply('You can\'t play with yourself!');
                return;
            }
            
            const gameId = `${message.author.id}-${mentionedUser.id}`;
            
            if (rpsGames.has(gameId)) {
                message.reply('There\'s already an ongoing Rock-Paper-Scissors game between you two!');
                return;
            }
            
            rpsGames.set(gameId, {
                players: [message.author.id, mentionedUser.id],
                choices: [null, null],
                messageId: null
            });
            
            const embed = new EmbedBuilder()
                .setTitle('Rock-Paper-Scissors')
                .setDescription(`${message.author.username} vs ${mentionedUser.username}`)
                .addFields(
                    { name: 'Status', value: 'Waiting for both players to choose...' }
                );
                
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rps_rock').setLabel('Rock').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('rps_paper').setLabel('Paper').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('rps_scissors').setLabel('Scissors').setStyle(ButtonStyle.Primary)
            );
            
            message.channel.send({ 
                embeds: [embed], 
                components: [buttons] 
            }).then(msg => {
                rpsGames.get(gameId).messageId = msg.id;
            });
        }
    }
};

// Moderation Commands
const moderationCommands = {
    ban: {
        execute: (message) => {
            if (!message.member.permissions.has('BanMembers')) {
                message.reply('You don\'t have permission to ban members!');
                return;
            }
            
            const user = message.mentions.users.first();
            
            if (!user) {
                message.reply('Please mention a user to ban!');
                return;
            }
            
            const member = message.guild.members.cache.get(user.id);
            
            if (!member) {
                message.reply('That user isn\'t in this server!');
                return;
            }
            
            if (!member.bannable) {
                message.reply('I can\'t ban that user!');
                return;
            }
            
            const reason = message.content.split(' ').slice(2).join(' ') || 'No reason provided';
            
            member.ban({ reason })
                .then(() => message.reply(`Successfully banned ${user.tag}`))
                .catch(err => message.reply(`Failed to ban user: ${err}`));
        }
    },
    kick: {
        execute: (message) => {
            if (!message.member.permissions.has('KickMembers')) {
                message.reply('You don\'t have permission to kick members!');
                return;
            }
            
            const user = message.mentions.users.first();
            
            if (!user) {
                message.reply('Please mention a user to kick!');
                return;
            }
            
            const member = message.guild.members.cache.get(user.id);
            
            if (!member) {
                message.reply('That user isn\'t in this server!');
                return;
            }
            
            if (!member.kickable) {
                message.reply('I can\'t kick that user!');
                return;
            }
            
            const reason = message.content.split(' ').slice(2).join(' ') || 'No reason provided';
            
            member.kick(reason)
                .then(() => message.reply(`Successfully kicked ${user.tag}`))
                .catch(err => message.reply(`Failed to kick user: ${err}`));
        }
    },
    timeout: {
        execute: (message) => {
            if (!message.member.permissions.has('ModerateMembers')) {
                message.reply('You don\'t have permission to timeout members!');
                return;
            }
            
            const user = message.mentions.users.first();
            
            if (!user) {
                message.reply('Please mention a user to timeout!');
                return;
            }
            
            const member = message.guild.members.cache.get(user.id);
            
            if (!member) {
                message.reply('That user isn\'t in this server!');
                return;
            }
            
            if (!member.moderatable) {
                message.reply('I can\'t timeout that user!');
                return;
            }
            
            const duration = parseInt(message.content.split(' ')[2]);
            
            if (isNaN(duration) || duration < 1 || duration > 40320) {
                message.reply('Please provide a valid duration in minutes (1-40320)!');
                return;
            }
            
            const reason = message.content.split(' ').slice(3).join(' ') || 'No reason provided';
            
            member.timeout(duration * 60 * 1000, reason)
                .then(() => message.reply(`Successfully timed out ${user.tag} for ${duration} minutes`))
                .catch(err => message.reply(`Failed to timeout user: ${err}`));
        }
    },
    clear: {
        execute: async (message) => {
            if (!message.member.permissions.has('ManageMessages')) {
                message.reply('You don\'t have permission to clear messages!');
                return;
            }
            
            const amount = parseInt(message.content.split(' ')[1]);
            
            if (isNaN(amount)) {
                message.reply('Please provide a valid number of messages to clear!');
                return;
            }
            
            if (amount < 1 || amount > 100) {
                message.reply('You can only clear between 1 and 100 messages at a time!');
                return;
            }
            
            try {
                await message.channel.bulkDelete(amount + 1);
                const reply = await message.channel.send(`Cleared ${amount} messages!`);
                setTimeout(() => reply.delete(), 3000);
            } catch (err) {
                message.reply(`Failed to clear messages: ${err}`);
            }
        }
    }
};

// Helper functions
function generateTTTBoard(gameId) {
    const game = tttGames.get(gameId);
    if (!game) return 'Game not found';
    
    const board = game.board;
    let display = '';
    
    for (let i = 0; i < 9; i += 3) {
        display += `${board[i]} | ${board[i+1]} | ${board[i+2]}\n`;
        if (i < 6) display += '---------\n';
    }
    
    return display;
}

function checkTTTWin(gameId) {
    const game = tttGames.get(gameId);
    const board = game.board;
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] === board[b] && board[b] === board[c]) {
            return board[a];
        }
    }
    
    if (!board.some(cell => !['X', 'O'].includes(cell))) {
        return 'draw';
    }
    
    return null;
}

function determineRPSWinner(gameId) {
    const game = rpsGames.get(gameId);
    const [p1Choice, p2Choice] = game.choices;
    
    if (p1Choice === p2Choice) return 'draw';
    
    if (
        (p1Choice === 'rock' && p2Choice === 'scissors') ||
        (p1Choice === 'paper' && p2Choice === 'rock') ||
        (p1Choice === 'scissors' && p2Choice === 'paper')
    ) {
        return 'player1';
    } else {
        return 'player2';
    }
}

// Auto-moderation
client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    // Spam detection
    const userId = message.author.id;
    const userMessages = spamDetection.get(userId) || [];
    userMessages.push(message.createdTimestamp);
    spamDetection.set(userId, userMessages);
    
    // Remove old messages
    const now = Date.now();
    const recentMessages = userMessages.filter(timestamp => now - timestamp < SPAM_TIME);
    
    if (recentMessages.length > MAX_SPAM) {
        message.member.timeout(60 * 1000, 'Spamming messages')
            .then(() => message.channel.send(`${message.author} has been muted for spamming.`))
            .catch(console.error);
        return;
    }
    
    // Banned words detection
    const content = message.content.toLowerCase();
    const foundWord = bannedWords.find(word => content.includes(word));
    
    if (foundWord) {
        message.delete();
        message.channel.send(`${message.author}, your message contained a banned word.`);
        return;
    }
    
    // Hangman game logic
    if (hangmanGames.has(userId)) {
        const game = hangmanGames.get(userId);
        
        if (message.content.length !== 1 || !/[a-z]/i.test(message.content)) {
            message.reply('Please guess a single letter!').then(msg => setTimeout(() => msg.delete(), 3000));
            return;
        }
        
        const guess = message.content.toLowerCase();
        
        if (game.word.includes(guess)) {
            let newHidden = game.hiddenWord.split(' ');
            for (let i = 0; i < game.word.length; i++) {
                if (game.word[i] === guess) {
                    newHidden[i] = guess;
                }
            }
            game.hiddenWord = newHidden.join(' ');
            
            if (!game.hiddenWord.includes('_')) {
                const winEmbed = new EmbedBuilder()
                    .setTitle('Hangman - You Won!')
                    .setDescription(`The word was: ${game.word}`)
                    .setColor('#00ff00');
                message.channel.send({ embeds: [winEmbed] });
                hangmanGames.delete(userId);
                return;
            }
        } else {
            if (!game.wrongGuesses.includes(guess)) {
                game.wrongGuesses.push(guess);
                game.attemptsLeft--;
                
                if (game.attemptsLeft <= 0) {
                    const loseEmbed = new EmbedBuilder()
                        .setTitle('Hangman - You Lost!')
                        .setDescription(hangmanStages[6])
                        .addFields(
                            { name: 'The word was', value: game.word }
                        )
                        .setColor('#ff0000');
                    message.channel.send({ embeds: [loseEmbed] });
                    hangmanGames.delete(userId);
                    return;
                }
            }
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Hangman Game')
            .setDescription(hangmanStages[6 - game.attemptsLeft])
            .addFields(
                { name: 'Word', value: game.hiddenWord },
                { name: 'Wrong Guesses', value: game.wrongGuesses.length > 0 ? game.wrongGuesses.join(', ') : 'None' },
                { name: 'Attempts Left', value: game.attemptsLeft.toString() }
            )
            .setFooter({ text: 'Type a letter to guess!' });
            
        message.channel.send({ embeds: [embed] });
        message.delete();
        return;
    }
    
    // Command handling
    if (!message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    if (utilityCommands[commandName]) {
        utilityCommands[commandName].execute(message, args);
    } else if (gameCommands[commandName]) {
        gameCommands[commandName].execute(message, args);
    } else if (moderationCommands[commandName]) {
        moderationCommands[commandName].execute(message, args);
    } else {
        message.reply('Unknown command! Type `!help` for a list of commands.');
    }
});

// Button interactions (for games)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    // Tic-Tac-Toe button handling
    if (interaction.customId.startsWith('ttt_')) {
        const position = parseInt(interaction.customId.split('_')[1]) - 1;
        const gameId = [...tttGames.keys()].find(key => 
            key.includes(interaction.user.id) && 
            tttGames.get(key).messageId === interaction.message.id
        );
        
        if (!gameId) {
            interaction.reply({ content: 'This game is no longer active.', ephemeral: true });
            return;
        }
        
        const game = tttGames.get(gameId);
        const currentPlayerId = game.players[game.currentPlayer];
        
        if (interaction.user.id !== currentPlayerId) {
            interaction.reply({ content: 'It\'s not your turn!', ephemeral: true });
            return;
        }
        
        if (['X', 'O'].includes(game.board[position])) {
            interaction.reply({ content: 'That position is already taken!', ephemeral: true });
            return;
        }
        
        game.board[position] = game.currentPlayer === 0 ? 'X' : 'O';
        const winner = checkTTTWin(gameId);
        
        if (winner) {
            const embed = new EmbedBuilder()
                .setTitle('Tic-Tac-Toe')
                .setDescription(winner === 'draw' ? 
                    'The game ended in a draw!' : 
                    `Congratulations <@${game.players[winner === 'X' ? 0 : 1]}>, you won!`)
                .addFields(
                    { name: 'Final Board', value: generateTTTBoard(gameId) }
                );
                
            await interaction.update({ 
                embeds: [embed], 
                components: [] 
            });
            tttGames.delete(gameId);
            return;
        }
        
        game.currentPlayer = game.currentPlayer === 0 ? 1 : 0;
        const nextPlayer = game.players[game.currentPlayer];
        
        const embed = new EmbedBuilder()
            .setTitle('Tic-Tac-Toe')
            .setDescription(`${interaction.message.embeds[0].description.split(' vs ')[0]} vs ${interaction.message.embeds[0].description.split(' vs ')[1]}`)
            .addFields(
                { name: 'Current Board', value: generateTTTBoard(gameId) }
            )
            .setFooter({ text: `It's <@${nextPlayer}>'s turn!` });
            
        await interaction.update({ embeds: [embed] });
    }
    
    // Rock-Paper-Scissors button handling
    if (interaction.customId.startsWith('rps_')) {
        const choice = interaction.customId.split('_')[1];
        const gameId = [...rpsGames.keys()].find(key => 
            key.includes(interaction.user.id) && 
            rpsGames.get(key).messageId === interaction.message.id
        );
        
        if (!gameId) {
            interaction.reply({ content: 'This game is no longer active.', ephemeral: true });
            return;
        }
        
        const game = rpsGames.get(gameId);
        const playerIndex = game.players.indexOf(interaction.user.id);
        
        if (playerIndex === -1) {
            interaction.reply({ content: 'You\'re not part of this game!', ephemeral: true });
            return;
        }
        
        if (game.choices[playerIndex] !== null) {
            interaction.reply({ content: 'You\'ve already made your choice!', ephemeral: true });
            return;
        }
        
        game.choices[playerIndex] = choice;
        
        if (game.choices[0] !== null && game.choices[1] !== null) {
            const result = determineRPSWinner(gameId);
            let resultText = '';
            
            if (result === 'draw') {
                resultText = 'The game ended in a draw!';
            } else {
                const winnerIndex = result === 'player1' ? 0 : 1;
                resultText = `Congratulations <@${game.players[winnerIndex]}>, you won with ${game.choices[winnerIndex]}!`;
            }
            
            const embed = new EmbedBuilder()
                .setTitle('Rock-Paper-Scissors - Results')
                .setDescription(`${interaction.message.embeds[0].description}\n\n${resultText}`)
                .addFields(
                    { name: `<@${game.players[0]}>'s choice`, value: game.choices[0], inline: true },
                    { name: `<@${game.players[1]}>'s choice`, value: game.choices[1], inline: true }
                );
                
            await interaction.update({ 
                embeds: [embed], 
                components: [] 
            });
            rpsGames.delete(gameId);
        } else {
            await interaction.reply({ 
                content: `You chose ${choice}. Waiting for the other player...`, 
                ephemeral: true 
            });
        }
    }
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);