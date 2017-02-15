<template>
  <div class="main">
    <div class="wm-buyers-listing">
      <div v-if="inspections" class="ofi-cards-wrap" id="listContainer">
          <div v-for="(inspection, index) in inspections" class="ofi-card has-shadow" v-on:click="loadLocalBuyerToEdit(index)">
            <div class="content">
              <p class="name">
                <el-badge v-if="inspection.interested" value="In" class="item">
                  <span>{{inspection.name}} {{inspection.surname}}</span>
                </el-badge>
                <span v-else>{{inspection.name}} {{inspection.surname}}</span>
              </p>
            </div>
          </div>
      </div>
    </div>
    <div id="wm-buyers-footer-button">
      <v-buyers-footer-buttons v-on:newBuyerCreated="initBuyerForm" :office-id="officeId" :user-id="userId" :property-id="propertyId"></v-buyers-footer-buttons>
    </div>
  </div>
</template>
<script src="./functions.js" type="text/ecmascript-6" />
