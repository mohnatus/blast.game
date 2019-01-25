<template>
    <div class="wrapper">
        <div class="playground">
            <Progress 
                v-bind:scores="scores" 
                v-bind:target="target" />
            <div class="field">
                <Field ref="field"
                    v-on:ready="start"
                    v-on:delete="onDelete"
                    v-bind:gameActive="active" />
                <transition name="fade">
                    <Result 
                        v-if="!active" 
                        v-bind:scores="scores"
                        v-bind:target="target"
                        v-bind:maxLevel="maxLevel"
                        v-bind:level="level"
                        v-on:restart="restart"
                        v-on:next="next" />
                </transition>
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
                    <span class="count">{{ scores }}</span>
                </div>
            </div>
            <div class="bonuses">
                Бонусы
                <div class="bonuses-items">
                    <div class="bonus" v-for="(count,bonus) in bonuses" v-bind:key="bonus">
                        <div class="bonus-icon">{{ bonus }}</div>
                        <div class="bonus-count">{{ count }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">

</style>

<script>
import Progress from './progress.component.vue';
import Field from './field.component.vue';
import Result from './result.component.vue';

import { levels } from '../js/levels.js'; // настройки уровней
import { itemScore, addScores } from '../js/scores.js'; // начисление очков


export default {
    components: { Progress, Field, Result },

    props: [
        'startLevel', // начальный уровень
        'startBonuses', // доступные бонусы
    ],

    data () {
        return {
            active: false, // игра идет

            scores: 0, // набрано очков
            target: 0, // цель уровня
            steps: 0, // осталось шагов

            level: 1, // уровень
            maxLevel: levels.length, // максимальный уровень

            bonuses: { // количество бонусов
                'bomb': 0,
                'mix': 0,
            },

            results: {
                'success': 1,
                'fail': 2
            },

            
        }
    },

    mounted: function() {
        // настроить параметры уровня
        this.initLevel(this.startLevel);

        // установить доступные бонусы
        if (this.startBonuses) {
            this.bonuses = this.startBonuses || [];
        }

        this.active = true;
    },

    methods: {
        // стартовые настройки игры в зависимости от уровня
        initLevel: function(level) { 
            
            this.level = level || 1; 

            let settings = levels[this.level - 1];

            this.target = settings.target; // сколько очков нужно набрать
            this.steps = settings.steps; // максимальное количество шагов

            this.scores = 0;

            this.$refs.field.update(settings); // Обновить поле
        },

        // запустить уровень
        start: function() {
            this.$refs.field.start();
            this.active = true;
        },

        onDelete: function(count) {
            // проверить на конец игры
            this.scores += this.countScores(count);
            this.steps--;

            if (this.steps == 0 || this.scores >= this.target) {
                this.active = false;
                return;
            }

            
        },

        countScores: function(count) {
            let scores = count * itemScore;

            for (let i = 0, count = addScores.length; i < count; i++) {
                if (count >= addScores[i].min) {
                    scores += addScores[i].factor * itemScore;
                    break;
                }
            }

            return scores;
        },

        next: function() {
            if (this.level < this.maxLevel) {
                this.initLevel(this.level + 1);
                this.start();
            }
        },

        restart: function() {
            this.initLevel(this.level);
            this.start();
        }
    }
}
</script>

