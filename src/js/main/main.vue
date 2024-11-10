<script lang="ts" setup>
import { evalES } from "../lib/utils/bolt";

const makeMaxOrbe = () => {
  evalES("createMaxOrbe()");
};
</script>

<template>
  <div class="flex justify-start items-center">
    <button class="bg-black text-white mx-2 px-2 py-2" @click="makeMaxOrbe">
      Make
    </button>
  </div>
</template>
