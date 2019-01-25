<template>
    <div class="wrapper">
        <div class="playground">
            <div class="progress" >
                Прогресс {{points}}
                <div class="progress-line">
                    <div class="progress-value" data-progress></div>
                </div>
            </div>
            <div class="field">
                <canvas id="game-field" width="400"></canvas>
                <div class="finish">
                    <div class="status"></div>
                    <div class="finish-button">
                        <button class="restart">Restart</button>
                        <button class="next-level">Next Level</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="info">
            <div class="level">
                <span data-bind="level"></span>
                &nbsp;уровень
            </div>
            <div class="stats">
                <div class="step" data-bind="steps"></div>
                <div class="points">
                    <span>Цель:</span>
                    <span class="count" data-bind="roundPoints"></span>
                </div>
                <div class="points">
                    <span>Очки:</span>
                    <span class="count" data-bind="points"></span>
                </div>
            </div>
            <div class="bonuses">
                Бонусы

                <div class="bonuses-items">
                    <div class="bonus">
                        <div class="bonus-icon"></div>
                        <div class="bonus-count"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
  h2 { color: violet; }
</style>

<script>
export default {
    data () {
        return {
            test: "world"
        }
    }
}
</script>

