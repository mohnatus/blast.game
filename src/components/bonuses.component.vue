<template>
    <div class="bonuses">
        <div class="bonuses-items">
            <div class="bonus"  
                v-for="(count,bonus) in bonuses" 
                v-bind:key="bonus"
                v-bind:data-bonus="bonus"
                v-bind:class="{inactive: count == 0}"
                v-on:click="apply(bonus)">
                <div class="bonus-icon"></div>
                <div class="bonus-count">{{ count }}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['bonuses', 'gameActive'],

    methods: {
        apply: function(type) {
            if (this.gameActive && this.bonuses[type]) this.$emit('apply', type);
        }
    }
}
</script>

