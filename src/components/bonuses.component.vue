<template>
    <div class="bonuses">
        Бонусы
        <div class="bonuses-items">
            <div class="bonus"  
                v-for="(count,bonus) in bonuses" 
                v-bind:key="bonus"
                v-bind:data-bonus="bonus"
                v-on:click="apply(bonus)">
                <div class="bonus-icon">{{ bonus }}</div>
                <div class="bonus-count">{{ count }}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['bonuses'],

    methods: {
        apply: function(type) {
            if (this.bonuses[type]) this.$emit('apply', type);
        }
    }
}
</script>

