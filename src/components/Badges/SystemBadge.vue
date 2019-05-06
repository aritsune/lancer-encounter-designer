<template>
    <div>
        <b-button
            size="small"
            :variant="`outline-system--${system.type}`"
            :id="system.name"
            @closed="$emit('closed')"
            @added="$emit('added')"
            v-bind="$props"
            @click="showModal"
            class="sysbadge d-flex"
            style="padding-top: 0; padding-bottom: 0"
            :style="{
                paddingRight: closable || addable ? 0 : null,
                opacity: incompatible ? 0.7 : 1,
                'pointer-events': incompatible ? 'none' : null,
            }"
            :class="{ incompatible }"
        >
            <div style="height: 30px; line-height: 30px">
                {{ system.name }}
            </div>
            <div
                style="height: 30px; line-height: 30px; padding-left: 7px; padding-right: 7px; margin-left: 7px;"
                @click.stop="emitEvent"
                class="buttonwrapper"
                v-if="closable || addable"
                :class="`border-${system.type}`"
            >
                <span v-if="incompatible">
                    <plus-circle-outline-icon class="badgebutton" />
                </span>
                <template v-else>
                    <span v-if="closable">
                        <minus-circle-icon class="badgebutton" />
                    </span>
                    <span v-else-if="addable">
                        <plus-circle-icon class="badgebutton" />
                    </span>
                </template>
            </div>
        </b-button>
        <SysModal :system="system" ref="sysmodal" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';


import SysModal from '../SysModal.vue';

import MinusCircleIcon from 'vue-material-design-icons/MinusCircle.vue';
import PlusCircleIcon from 'vue-material-design-icons/PlusCircle.vue';
import PlusCircleOutlineIcon from 'vue-material-design-icons/PlusCircleOutline.vue';

import { NPCSystem } from '@/logic/interfaces/NPCSystem';

export default Vue.extend({
  name: 'system-button',
  components: { SysModal, MinusCircleIcon, PlusCircleIcon, PlusCircleOutlineIcon },
  props: {
    system: { type: Object, required: true },
    closable: { type: Boolean, default: false },
    addable: { type: Boolean, default: false },
    incompatible: { type: [Array, Boolean], default: false },
  },
  methods: {
    showModal() {
      (this.$refs.sysmodal as any).show();
    },
    emitEvent() {
      if (this.$props.closable) this.$emit('closed');
      else if (this.$props.addable) this.$emit('added');
    },
  }
});
</script>

<style lang="scss">
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

.sysbadge {
  text-transform: uppercase;
  white-space: nowrap;
  font-size: 0.7em !important;
  padding: 0 0.75em;
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
.badgebutton {
  font-size: 13px;
  transition: opacity 200ms ease;
  &:hover {
    opacity: 0.8;
  }
}
.buttonwrapper {
  border-radius: 0 4px 4px 0;
  transition: all 200ms ease;
  border-left: 1px solid transparent;
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.badgebutton:hover .buttonwrapper {
  border-color: white;
}

.incompatible {
  opacity: 0.7;
}
</style>
