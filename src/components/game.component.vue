<template>
    <div class="wrapper">
        <div class="playground">
            <Progress 
                v-bind:scores="scores" 
                v-bind:target="target" />
            <div class="field" v-bind:data-bonus="bonus">
                <Field ref="field"
                    v-on:ready="start"
                    v-on:delete="onDelete"
                    v-on:bonusApplied="bonus = null"
                    v-bind:gameActive="active"
                    v-bind:bonus="bonus" />
                <transition name="fade">
                    <Result 
                        v-if="!active" 
                        v-bind:scores="scores"
                        v-bind:target="target"
                        v-bind:maxLevel="maxLevel"
                        v-bind:level="level"
                        v-on:new="newGame"
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
                    <span class="count active">{{ target }}</span>
                </div>
                <div class="points">
                    <span>Очки:</span>
                    <span class="count" v-bind:class="{active: scores >= target}">{{ scores }}</span>
                </div>
            </div>
            <Bonuses 
                v-bind:bonuses="bonuses"
                v-on:apply="applyBonus"/>
        </div>
    </div>
</template>

<style lang="scss">

</style>

<script>
import Progress from './progress.component.vue';
import Field from './field.component.vue';
import Result from './result.component.vue';
import Bonuses from './bonuses.component.vue';

import { levels } from '../js/levels.js'; // настройки уровней
import { itemScore, addScores } from '../js/scores.js'; // начисление очков


export default {
    components: { Progress, Field, Result, Bonuses },

    props: [
        'startLevel', // начальный уровень
        'startBonuses', // доступные бонусы
    ],

    data () {
        return {
            active: true, // игра идет

            scores: 0, // набрано очков
            target: 0, // цель уровня
            steps: 0, // осталось шагов

            bonusLast: { // последнее обработанное количество очков
                bomb: 0,
                mix: 0,
            }, 

            bonusSettings: {
                'bomb': {
                    step: 100
                },
                'mix': {
                    step: 150,
                }
            },

            level: 1, // уровень
            maxLevel: levels.length, // максимальный уровень

            bonuses: { // количество бонусов
                'bomb': 1,
                'mix': 1,
            },
            bonus: null, // текущий бонус
           
        }
    },

    mounted: function() {
        // настроить параметры уровня
        this.initLevel(this.startLevel);

        // установить доступные бонусы
        if (this.startBonuses) {
            this.bonuses = this.startBonuses;
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

        // удаление группы клеток
        onDelete: function(count) {
            // проверить на конец игры
            this.scores += this.countScores(count);
            this.steps--;

            this.countBonuses();

            if (this.steps == 0 || this.scores >= this.target) {
                this.active = false;
                return;
            }
        },

        countBonuses: function() {

            for (let bonus in this.bonuses) {
                let last = this.bonusLast[bonus] || 0;
                let step = this.bonusSettings[bonus].step;
                let count = Math.floor((this.scores - last) / step);
                console.log(123, count, this.scores, last, step, bonus)
                if (count) {
                    this.bonusLast[bonus] += bonus.step * count;
                    this.bonuses[bonus] += count;
                }
                
            }
        },

        // вычисление количества очков
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

        // следующий уровень
        next: function() {
            if (this.level < this.maxLevel) {
                this.initLevel(this.level + 1);
                this.start();
            }
        },

        // переиграть уровень
        restart: function() {
            this.initLevel(this.level);
            this.start();
        },

        // начать игру сначала
        newGame: function() {
            this.initLevel(1);
            this.start();
        },

        // применить бонус
        applyBonus: function(bonusType) {
            this.bonus = bonusType;
            this.bonuses[bonusType]--;

            if (bonusType == 'mix') {
                this.$refs.field.mix();
                this.bonus = null;
            }
        }
    }
}
</script>

