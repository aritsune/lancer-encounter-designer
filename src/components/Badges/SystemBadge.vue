<template>
    <base-badge
        :variant="`system--${system.type}`"
        :id="system.name"
        @closed="$emit('closed')"
        @added="$emit('added')"
        v-bind="$props"
    >
        <template v-slot:button>
            {{ system.name }}
        </template>
        <SysModal :system="system" />
    </base-badge>
</template>

<script lang="ts">
import Vue from 'vue';


import BaseBadge from './BaseBadge.vue';
import SysModal from '../SysModal.vue';

import { NPCSystem } from '@/logic/interfaces/NPCSystem';

export default Vue.extend({
  name: 'system-button',
  components: { BaseBadge, SysModal },
  props: {
    system: { type: Object, required: true },
    closable: { type: Boolean, default: false },
    addable: { type: Boolean, default: false },
    incompatible: { type: [Array, Boolean], default: false },
  },
});
</script>

<style>
.system-btn {
  text-transform: uppercase;
  white-space: nowrap;
  font-size: 0.7em !important;
}
.modal-header {
  border-top-left-radius: 4px !important;
  border-top-right-radius: 4px !important;
}
.system-modal-title {
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
h6.system-modal-type {
  font-size: 0.7em;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.5em;
}
.system-modal {
  white-space: initial;
}
body,
body.modal-open {
  padding: 0 !important;
  overflow-y: auto;
}
</style>
