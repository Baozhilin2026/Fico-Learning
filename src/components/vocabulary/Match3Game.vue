<template>
  <div class="match3-game">
    <!-- Game Start Screen -->
    <div v-if="gameState === 'start'" class="start-screen">
      <div class="start-content">
        <h2>消消乐</h2>
        <p class="subtitle">点击两张中英文含义相同的卡片进行消除匹配</p>

        <el-button type="primary" size="large" @click="startGame">
          <el-icon><VideoPlay /></el-icon>
          开始游戏
        </el-button>
      </div>
    </div>

    <!-- Game Board -->
    <div v-else-if="gameState === 'playing'" class="game-board-screen">
      <div class="board-container">
        <div
          v-for="(cell, index) in board"
          :key="cell ? cell.id : `empty-${index}`"
          class="game-cell"
          :class="{ 'empty': !cell, 'selected': selectedCell === index, 'matched': cell?.matched }"
          @click="handleCellClick(index)"
        >
          <div v-if="cell" class="cell-content" :class="cell.type">
            <div v-if="cell.type === 'english'" class="card-text">{{ cell.vocab.英文 }}</div>
            <div v-else class="card-text">{{ cell.vocab.中文翻译 }}</div>
          </div>
        </div>

        <div v-if="combo >= 3" class="combo-display">
          <div class="combo-text">{{ combo }} 连消！</div>
        </div>
      </div>
    </div>

    <!-- Level Complete Screen -->
    <div v-else-if="gameState === 'levelComplete'" class="level-complete-screen">
      <!-- Debug: Show game state -->
      <div style="position: absolute; top: 10px; left: 10px; background: yellow; color: black; padding: 10px; z-index: 9999;">
        DEBUG: gameState = {{ gameState }}
      </div>

      <el-button class="close-overlay-btn" :icon="Close" circle @click="exitGame" />

      <div class="celebration-container">
        <!-- Celebratory Animation -->
        <div class="celebration-animation">
          <div class="confetti" v-for="i in 50" :key="i" :style="{ animationDelay: `${i * 0.03}s` }"></div>
          <div class="trophy-icon">🏆</div>
          <div class="sparkles">
            <div class="sparkle" v-for="i in 8" :key="i" :style="{ animationDelay: `${i * 0.2}s` }"></div>
          </div>
        </div>

        <div class="level-complete-content">
          <h2 class="complete-title">太棒了！🎉</h2>
          <p class="complete-message">恭喜你完成了所有卡片的消除！</p>

          <div class="complete-stats">
            <div class="stat-item">
              <div class="stat-label">最终得分</div>
              <div class="stat-value">{{ score }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">完成关卡</div>
              <div class="stat-value">{{ level }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">消除数量</div>
              <div class="stat-value">{{ matches }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">用时</div>
              <div class="stat-value">{{ formatTime(gameTime) }}</div>
            </div>
          </div>

          <div class="complete-actions">
            <el-button type="primary" size="large" @click="restartGame">
              <el-icon><RefreshLeft /></el-icon>
              再来一次
            </el-button>
            <el-button size="large" @click="exitGame">
              <el-icon><Close /></el-icon>
              退出
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { VideoPlay, RefreshLeft, Close } from '@element-plus/icons-vue'
import type { VocabularyEntry } from '@/types'

interface Props {
  vocabularies: VocabularyEntry[]
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

type GameState = 'start' | 'playing' | 'levelComplete'

interface Cell {
  vocab: VocabularyEntry
  id: number
  matched: boolean
  type: 'english' | 'chinese'
}

// Game state
const gameState = ref<GameState>('start')
const score = ref(0)
const level = ref(1)
const moves = ref(0)
const gameTime = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const matches = ref(0)
const learnedWords = ref<VocabularyEntry[]>([])

const board = ref<(Cell | null)[]>([])
const selectedCell = ref<number | null>(null)

// Timer
const timerInterval = ref<number | null>(null)

// Audio context for sound effects
const audioContext = ref<AudioContext | null>(null)

// Board size
const boardSizes = {
  rows: 5,
  cols: 5
}

function getBoardSize() {
  return boardSizes
}

// Create board from vocabularies
function createBoard() {
  const pairCount = 10
  const selectedVocabs = [...props.vocabularies].sort(() => Math.random() - 0.5).slice(0, pairCount)

  const newCells: (Cell | null)[] = []
  let idCounter = 0

  // Create pairs: each vocab gets exactly 2 cards (1 English + 1 Chinese)
  for (const vocab of selectedVocabs) {
    // English card
    newCells.push({
      vocab: vocab,
      id: idCounter++,
      matched: false,
      type: 'english'
    })

    // Chinese card
    newCells.push({
      vocab: vocab,
      id: idCounter++,
      matched: false,
      type: 'chinese'
    })

    // Track learned word
    if (!learnedWords.value.find(w => w.序号 === vocab.序号)) {
      learnedWords.value.push(vocab)
    }
  }

  // Fill remaining with empty cells
  const totalCells = boardSizes.rows * boardSizes.cols
  while (newCells.length < totalCells) {
    newCells.push(null)
  }

  // Shuffle cells
  for (let i = newCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newCells[i], newCells[j]] = [newCells[j], newCells[i]]
  }

  board.value = newCells
  selectedCell.value = null
}

function getTotalCells() {
  return boardSizes.rows * boardSizes.cols
}

function startGame() {
  gameState.value = 'playing'
  score.value = 0
  level.value = 1
  moves.value = 0
  gameTime.value = 0
  combo.value = 0
  maxCombo.value = 0
  matches.value = 0
  learnedWords.value = []

  createBoard()
  startTimer()
  playSound('start')
}

function restartGame() {
  stopTimer()
  startGame()
}

function exitGame() {
  stopTimer()
  emit('close')
}

// Timer functions
function startTimer() {
  timerInterval.value = window.setInterval(() => {
    gameTime.value++
  }, 1000)
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Cell click handler
async function handleCellClick(index: number) {
  if (gameState.value !== 'playing') return

  const cell = board.value[index]
  if (!cell || cell.matched) return

  playSound('click')

  if (selectedCell.value === null) {
    // First selection
    selectedCell.value = index
  } else if (selectedCell.value === index) {
    // Deselect
    selectedCell.value = null
  } else {
    // Try to match
    await handleMatchOrSelect(selectedCell.value, index)
  }
}

async function handleMatchOrSelect(index1: number, index2: number) {
  const cell1 = board.value[index1]
  const cell2 = board.value[index2]
  if (!cell1 || !cell2) return

  moves.value++

  const isSame = cell1.vocab.序号 === cell2.vocab.序号

  if (isSame) {
    // Same vocab - mark both as matched
    playSound('match')
    cell1.matched = true
    cell2.matched = true
    score.value += 10
    matches.value++

    // Track learned word
    const vocab = cell1.vocab
    if (!learnedWords.value.find(w => w.序号 === vocab.序号)) {
      learnedWords.value.push(vocab)
    }

    selectedCell.value = null

    // Check for group of 3+
    await checkAndMatchGroup(index1, index2)

    // Check if game is complete (all cards matched)
    await checkGameComplete()
  } else {
    // Different - just select new cell
    selectedCell.value = index2
  }
}

async function checkAndMatchGroup(startIndex1: number, startIndex2: number) {
  const size = getBoardSize()
  const sameVocabId = board.value[startIndex1]!.vocab.序号

  // Find all adjacent same cells using BFS
  const adjacentIndices = await findAllAdjacentSame(startIndex1, startIndex2, sameVocabId)

  if (adjacentIndices.length >= 3) {
    // Match all adjacent
    await processMatch([...adjacentIndices, startIndex1, startIndex2])
  }
}

async function findAllAdjacentSame(startIndex1: number, startIndex2: number, vocabId: number): Promise<number[]> {
  const size = getBoardSize()
  const visited = new Set<number>()
  const queue: number[] = [startIndex1, startIndex2]
  visited.add(startIndex1)
  visited.add(startIndex2)

  while (queue.length > 0) {
    const current = queue.shift()!
    const cell = board.value[current]

    if (!cell || cell.matched || cell.vocab.序号 !== vocabId) continue

    // Add adjacent cells
    const row = Math.floor(current / size.cols)
    const col = current % size.cols

    const adjacent = [
      row > 0 ? current - size.cols : null, // up
      row < size.rows - 1 ? current + size.cols : null, // down
      col > 0 ? current - 1 : null, // left
      col < size.cols - 1 ? current + 1 : null // right
    ].filter(n => n !== null && !visited.has(n!))

    for (const adj of adjacent) {
      if (adj !== null) {
        queue.push(adj)
        visited.add(adj)
      }
    }
  }

  return Array.from(visited)
}

async function processMatch(indices: number[]) {
  for (const idx of indices) {
    const cell = board.value[idx]
    if (cell && !cell.matched) {
      cell.matched = true
      score.value += 5
      matches.value++
    }
  }

  combo.value = indices.length
  if (combo.value > maxCombo.value) {
    maxCombo.value = combo.value
  }

  await checkGameComplete()
}

async function checkGameComplete() {
  const totalCells = getTotalCells()
  const matchedCells = board.value.filter(c => c && c.matched).length
  const totalCards = board.value.filter(c => c !== null).length

  console.log('checkGameComplete:', { matchedCells, totalCards, gameState: gameState.value })

  // All cards have been matched
  if (matchedCells === totalCards && totalCards > 0) {
    console.log('Game complete! Setting state to levelComplete')
    stopTimer()
    playSound('levelUp')
    gameState.value = 'levelComplete'
  }
}

// Sound effects
function playSound(type: 'click' | 'match' | 'levelUp' | 'start') {
  try {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)

    const sounds = {
      click: { freq: 800, duration: 0.1 },
      match: { freq: 523, duration: 0.2 },
      levelUp: { freq: 659, duration: 0.3 },
      start: { freq: 440, duration: 0.2 }
    }

    const sound = sounds[type]
    oscillator.frequency.value = sound.freq
    gainNode.gain.value = 0.3

    oscillator.start(audioContext.value.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + sound.duration)
    oscillator.stop(audioContext.value.currentTime + sound.duration)
  } catch (e) {
    console.warn('Sound play failed:', e)
  }
}

// Cleanup
onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped lang="scss">
.match3-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.start-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: $spacing-xl;

  .start-content {
    text-align: center;
    background: $bg-primary;
    padding: $spacing-2xl;
    border-radius: $border-radius-xl;
    box-shadow: $shadow-xl;
    max-width: 500px;

    h2 {
      color: $primary;
      margin-bottom: $spacing-sm;
    }

    .subtitle {
      color: $text-secondary;
      margin-bottom: $spacing-xl;
    }
  }
}

.game-board-screen {
  padding: $spacing-xl;
}

.game-header {
  background: $bg-primary;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-sm;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.game-info {
  display: flex;
  gap: $spacing-lg;
  flex-wrap: wrap;

  .info-item {
    text-align: center;

    .label {
      display: block;
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-bottom: $spacing-xs;
    }

    .value {
      display: block;
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      color: $primary;
    }
  }
}

.board-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-xl;
  margin: 0 auto;
  max-width: 1400px;
  padding: $spacing-2xl;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $border-radius-xl;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.game-cell {
  aspect-ratio: 1;
  background: transparent;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &.empty {
    cursor: default;
  }

  &:not(.empty):hover {
    transform: scale(1.05);
    z-index: 2;
  }

  &.selected {
    background: rgba($primary, 0.2);
    box-shadow: 0 4px 12px rgba($primary, 0.4);
    transform: scale(1.08);
    z-index: 3;
  }

  &.matched {
    animation: matchDisappear 0.4s ease-out forwards;
    pointer-events: none;
  }
}

.cell-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &.english {
    background: linear-gradient(135deg, #f0f9ff 0%, #e3f2fd 100%);
    border: 3px solid #3b82f6;
  }

  &.chinese {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 3px solid #f59e0b;
  }

  .card-text {
    font-size: 24px;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    line-height: 1.4;
    text-align: center;
    word-wrap: break-word;
    word-break: break-word;
  }
}

@keyframes matchDisappear {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.combo-display {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
  animation: comboPopup 0.5s ease-out;
}

.combo-text {
  font-size: 36px;
  font-weight: $font-weight-bold;
  color: #ff6b6b;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: comboShake 0.5s ease-in-out infinite;
}

@keyframes comboPopup {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes comboShake {
  0%, 100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

// Level Complete Screen
.level-complete-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  padding: $spacing-xl;

  .close-overlay-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1001;
    width: 48px;
    height: 48px;
    font-size: 20px;
    background: rgba(255, 255, 255, 0.95);
    color: #606266;
    border: 2px solid #dcdfe6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    &:hover {
      background: #fff;
      color: #f56c6c;
      border-color: #f56c6c;
      transform: rotate(90deg);
    }
  }
}

.celebration-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;

  // Hide scrollbar
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.celebration-animation {
  position: relative;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}

.trophy-icon {
  font-size: 120px;
  animation: trophyBounce 1s ease-in-out infinite;
  position: relative;
  z-index: 2;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

@keyframes trophyBounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
  }
}

// Color palette for confetti
$colors: #f44336, #e91e63, #9c27b0, #ffeb3b, #00bcd4, #ff6b6b;

// Confetti
.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: confettiFall 3s ease-in-out infinite;

  @for $i from 0 to 50 {
    &:nth-child(#{$i + 1}) {
      left: #{random(100)}%;
      top: -10px;
      background: #{$colors[$i % length($colors)]};
      animation-delay: #{$i * 0.03}s;
    }
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

// Sparkles
.sparkles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: sparkleAnim 2s ease-in-out infinite;
}

@keyframes sparkleAnim {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
}

.level-complete-content {
  background: $bg-primary;
  border-radius: $border-radius-xl;
  padding: $spacing-2xl;
  box-shadow: $shadow-xl;
  text-align: center;
  position: relative;
  z-index: 10;
  max-width: 650px;
  margin: 0 auto;
  pointer-events: auto;
  overflow-y: auto;
  max-height: 85vh;

  // Hide scrollbar
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  .complete-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $primary;
    margin: 0 0 $spacing-lg;
    animation: titlePulse 1s ease-in-out infinite;
  }

  @keyframes titlePulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .complete-message {
    font-size: $font-size-xl;
    color: $text-secondary;
    margin-bottom: $spacing-2xl;
  }
}

.complete-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-lg;
  margin-bottom: $spacing-2xl;

  .stat-item {
    background: $bg-secondary;
    padding: $spacing-lg;
    border-radius: $border-radius-lg;

    .stat-label {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-bottom: $spacing-xs;
    }

    .stat-value {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $primary;
    }
  }
}

.learned-words-section {
  text-align: left;
  margin-bottom: $spacing-2xl;

  h4 {
    margin: 0 0 $spacing-md;
    color: $text-primary;
    text-align: center;
  }
}

.learned-words-list {
  display: grid;
  gap: $spacing-sm;
  max-height: 200px;
  overflow-y: auto;

  // Hide scrollbar
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.learned-word-item {
  background: $bg-secondary;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .learned-english {
    font-weight: $font-weight-semibold;
    color: $primary;
  }

  .learned-chinese {
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}

.complete-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
  position: relative;
  z-index: 1001 !important;
  margin-top: $spacing-xl !important;
  padding: $spacing-lg;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  pointer-events: auto !important;

  .el-button {
    min-width: 160px;
    height: 48px;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
  }
}
</style>
