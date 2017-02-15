<template>
  <div class="content-wrapper" id="home-wrapper">
    <v-banner v-if="stock"
      v-show="!currentBuyer"
      :is-document-ready="isDocumentReady"
      :is-ofi-sent="isOfiSent"
      :office-id="officeId"
      :user-id="userId"
      :stock="stock"
      :inspections="inspections"
      :email-body="emailBody"
      :prepared-inspection-report-addressees="prepared_inspection_report_addressees"
      v-on:inspectionDateChanged="inspectionDateUpdated($event)">
    </v-banner>

    <v-buyers-listing
      v-show="!currentBuyer"
      :inspections="inspections"
      :office-id="officeId"
      :user-id="userId"
      :property-id="propertyId"
      v-on:initCurrentBuyerEvent="initCurrentBuyer"
      v-on:loadLocalBuyerToEdit="loadLocalBuyerToEdit($event)"></v-buyers-listing>
    <!-- New Ofi Form -->
    <!-- Transition animation -->
    <transition
      name="custom-classes-transition"
      enter-active-class="animated slideInUp"
      leave-class="animated slideOutLeft"
    >
      <v-buyer-form  v-show="currentBuyer"
        v-on:newOfiCreated="saveBuyer($event)"
        :office-id="officeId"
        :user-id="userId"
        :property-id="propertyId"
        :current-buyer="currentBuyer"
        :frequent-text-options="frequentText"
        ></v-buyer-form>
    </transition>
  </div>
</template>
<script src="./functions.js" type="text/ecmascript-6" />
