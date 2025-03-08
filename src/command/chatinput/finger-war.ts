import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, EmbedBuilder, Interaction, ButtonInteraction } from 'discord.js';

type HandState = { left: number; right: number };

export default {
  command: new SlashCommandBuilder()
    .setName('finger-war')
    .setDescription('指を叩くと増えるやつ'),

  async execute(interaction: ChatInputCommandInteraction) {
    let userHands: HandState = { left: 1, right: 1 };
    let botHands: HandState = { left: 1, right: 1 };

    // 最初のメッセージ送信
    const message = await interaction.reply({
      embeds: [generateEmbed(userHands, botHands, '攻撃する手を選んでください！')],
      components: [attackButtons()],
      fetchReply: true
    });

    // コレクター設定（ボタンの応答を受け付ける）
    const filter = (i: Interaction) => i.isButton() && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    let selectedHand: keyof HandState | null = null;

    collector.on('collect', async (btnInteraction: ButtonInteraction) => {
      await btnInteraction.deferUpdate();

      if (!selectedHand) {
        // ① 攻撃する手を選択
        selectedHand = btnInteraction.customId as keyof HandState;
        await interaction.editReply({
          embeds: [generateEmbed(userHands, botHands, '攻撃対象の手を選んでください！')],
          components: [targetButtons()]
        });
      } else {
        // ② 攻撃対象を選択
        const targetHand = btnInteraction.customId as keyof HandState;
        playTurn(userHands, botHands, selectedHand, targetHand);

        // Botの行動
        const botAttack: keyof HandState = Math.random() < 0.5 ? 'left' : 'right';
        const userTarget: keyof HandState = Math.random() < 0.5 ? 'left' : 'right';
        playTurn(botHands, userHands, botAttack, userTarget);

        // 勝敗判定
        const userLose = userHands.left === 0 && userHands.right === 0;
        const botLose = botHands.left === 0 && botHands.right === 0;

        let statusMessage = '👉 次のターンへ！';
        if (userLose) statusMessage = '😢 **あなたの負け！**';
        else if (botLose) statusMessage = '🎉 **あなたの勝ち！**';

        // 結果を更新
        await interaction.editReply({
          embeds: [generateEmbed(userHands, botHands, statusMessage)],
          components: userLose || botLose ? [] : [attackButtons()]
        });

        if (userLose || botLose) collector.stop();
        selectedHand = null; // リセット
      }
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] }).catch(() => {});
    });
  }
};

// 指の増減を処理する関数
function playTurn(attacker: HandState, defender: HandState, attackHand: keyof HandState, targetHand: keyof HandState) {
  defender[targetHand] += attacker[attackHand];
  if (defender[targetHand] >= 5) defender[targetHand] = 0; // 5本以上なら脱落
}

// Embedの生成
function generateEmbed(userHands: HandState, botHands: HandState, message: string) {
  return new EmbedBuilder()
    .setTitle('🖐️ 指を叩くと増えるやつ！')
    .setDescription(
      `**あなたの手:**\n👈 左手: ${userHands.left}本指 | 右手: ${userHands.right}本指 👉\n\n` +
      `**Botの手:**\n👈 左手: ${botHands.left}本指 | 右手: ${botHands.right}本指 👉\n\n` +
      `**${message}**`
    )
    .setColor(Colors.Blue);
}

// 攻撃する手を選ぶボタン
function attackButtons() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('left').setLabel('左手で攻撃').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('right').setLabel('右手で攻撃').setStyle(ButtonStyle.Primary)
  );
}

// 攻撃対象を選ぶボタン
function targetButtons() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('left').setLabel('相手の左手').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('right').setLabel('相手の右手').setStyle(ButtonStyle.Danger)
  );
}
