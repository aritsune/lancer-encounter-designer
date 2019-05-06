<template>
    <b-modal
        centered
        class="system-modal"
        hide-header-close
        hide-header
        hide-footer
        ref="modal"
    >
        <h5
            class="system-modal-title mb-0"
            :class="`text-system--${system.type}`"
        >
            {{ system.name }}
        </h5>
        <h6
            class="system-modal-type my-1"
            :class="`text-system--${system.type}`"
        >
            {{ system.type }}
            <template v-if="system.action">
                — {{ actionName(system.action) }}
            </template>
        </h6>
        <template v-if="system.type === 'weapon'">
            <hr />
            <div class="font-weight-bold font-italic">
                {{ system.weapon_type.join(' ') }}
            </div>
            <div style="font-size: 0.8em" class="my-0">
                <b-badge
                    v-for="tag in system.tags"
                    :key="tag.id"
                    class="mr-1 py-1 text-align-center"
                    >{{ renderTag(tag, npc && npc.tier) }}</b-badge
                >
            </div>
            <div>
                <dice-multiple-icon
                    style="font-size: 24px; vertical-align: text-bottom;"
                />
                {{ printRoll(system.weapon_roll, system.smart) }}
            </div>
            <div>
                <vector-line-icon
                    style="font-size: 24px; vertical-align: text-bottom;"
                />
                {{ printRange(system.weapon_range) }}
            </div>
            <div v-if="system.damage">
                <flare-icon
                    style="font-size: 24px; vertical-align: text-bottom;"
                />
                {{ printDamage(system.damage) }}
            </div>
        </template>
        <template v-else-if="system.tags || system.action">
            <hr />
            <div style="font-size: 0.8em" class="my-1">
                {{ system.tags }}
            </div>
        </template>
        <template v-if="system.effect">
            {{ system.effect }}
        </template>
    </b-modal>
</template>

<script lang="ts">
import Vue from 'vue';

import { NPCSystem } from '@/logic/interfaces/NPCSystem';

import DiceMultipleIcon from 'vue-material-design-icons/DiceMultiple.vue';
import VectorLineIcon from 'vue-material-design-icons/VectorLine.vue';
import FlareIcon from 'vue-material-design-icons/Flare.vue';

import renderTag from '@/logic/rendertag';

export default Vue.extend({
    components: { DiceMultipleIcon, VectorLineIcon, FlareIcon },
    props: {
        system: { type: Object, required: true },
        npc: { type: Object, required: false }
    },
    methods: {
        renderTag,
        actionName: (s: string): string => {
            const map = {
                free: 'Free Action',
                quick: 'Quick Action',
                full: 'Full Action',
                protocol: 'Protocol',
                reaction: 'Reaction',
                quicktech: 'Quick Tech',
                fulltech: 'Full Tech',
            } as any;
            return map[s];
        },
        printRoll(rollObj: NPCSystem.Roll, tech: boolean) {
            const { flat, accdiff } = rollObj;
            let output = '';
            if (flat) {
                if (flat.val > -1) output += '+';
                output += flat.val;
            } else {
                output += '0';
            }
            output += tech ? ' vs e-defense' : ' vs evasion';
            if (flat && flat.pertier) {
                output += '/tier';
            }
            if (accdiff) {
                const word = accdiff.val > -1 ? '+' : '-';
                output += ` with +${Math.abs(accdiff.val)} ${word}`;
                if (accdiff.pertier) {
                    output += '/tier';
                }
            }
            return output;
        },
        printDamage(damageAry: { val: [number, number, number]; type: string }[]) {
            return damageAry
                .map(damageObj => `${damageObj.val.join('/')} ${damageObj.type}`)
                .join(' + ');
        },
        printRange(rangeAry: { val: number; type: string }[]) {
            return rangeAry.map(r => `${r.type} ${r.val}`).join(' ');
        },
        show() {
            (this.$refs.modal as any).show()
        },
    },
})
</script>
