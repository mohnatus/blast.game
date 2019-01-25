<template>
    <div class="wrapper">
        <div class="playground">
            <Progress 
                v-bind:points="points" 
                v-bind:target="target" />
            <div class="field">
                <Field v-bind:width="fieldWidth"/>
                <Result v-if="showResult"/>
            </div>
        </div>
        <div class="info">
            <div class="level">
                {{ level }} уровень
            </div>
            <div class="stats">
                <div class="step">{{ steps }}</div>
                <div class="points">
                    <span>Цель:</span>
                    <span class="count">{{ target }}</span>
                </div>
                <div class="points">
                    <span>Очки:</span>
                    <span class="count">{{ points }}</span>
                </div>
            </div>
            <div class="bonuses">
                Бонусы
                <div class="bonuses-items">
                    <div class="bonus" v-for="(count,bonus) in bonuses" v-bind:data-bonus="bonus.type">
                        <div class="bonus-icon">{{ bonus }}</div>
                        <div class="bonus-count">{{ count }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
  .bonuses { color: violet; }
</style>

<script>
import Progress from './progress.component.vue';
import Field from './field.component.vue';
import Result from './result.component.vue';

export default {
    components: { Progress, Field, Result },
    data () {
        return {
            points: 23,
            target: 50,
            fieldWidth: 400,
            showResult: false,
            level: 1,
            steps: 37,
            bonuses: {
                'bomb': 0,
                'mix': 0,
            }
        }
    }
}
</script>

