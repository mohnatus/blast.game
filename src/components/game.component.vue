<template>
    <div class="wrapper">
        <div class="playground">
            <Progress 
                v-bind:points="points" 
                v-bind:target="target" />
            <div class="field">
                <Field ref="field"
                    v-bind:gameActive="active" />
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

</style>

<script>
import Progress from './progress.component.vue';
import Field from './field.component.vue';
import Result from './result.component.vue';

import levels from '../js/levels.js'; // настройки уровней
import colors from '../js/colors.js'; // доступные цвета тайлов


export default {
    components: { Progress, Field, Result },

    props: [
        'startLevel', // начальный уровень
        'startBonuses', // доступные бонусы
    ],

    data () {
        return {
            active: false, // поле реагирует на действия

            points: 0, // набрано очков
            target: 0, // цель уровня

            level: 1, // уровень
           
            showResult: false, // игра закончена, показать результат

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

    created: function() {
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
            this.level = level - 1; 

            let settings = levels[this.level];
            this.target = settings.target; // сколько очков нужно набрать

            this.$refs.field.update(settings); // Обновить поле
            
            this.startLevel();
        },

        // запустить уровень
        startLevel: function() {
            this.$refs.field.start();
            this.active = true;
        },
    }
}
</script>

