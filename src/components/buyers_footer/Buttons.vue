<template>
  <div class="content">
    <el-row>
      <el-col :span="12">
        <a class="bottom-btn add-new-btn txt-center" v-on:click="needNewBuyer">
          <i class="el-icon-plus"></i>&nbsp;New
        </a>
      </el-col>
      <el-col :span="12">
        <a class="bottom-btn done-btn txt-center" v-on:click="saveAllAndCloseWindow">
          <i class="el-icon-check"></i>
          Done
        </a>
      </el-col>
    </el-row>
  </div>
</template>
<script src="./functions.js" type="text/ecmascript-6" />
