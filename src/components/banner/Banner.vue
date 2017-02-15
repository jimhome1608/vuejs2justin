<template>
  <div class="wm-banner-wrapper">
    <div class="block">
      <span v-if="stock" class="address-line">{{ stock.address }}</span>
      <el-date-picker
        v-model="inspectionDate"
        v-on:change="inspectionDateChanged($event)"
        type="date"
        format="dd-MM-yyyy"
        :clearable="false"
        :editable="false"
        placeholder="Today">
      </el-date-picker>
    </div>
    <div class="doc-download-link-wrapper" v-if="isDocumentReady">
      <a target="_blank" :href="documentLink" class="doc-download-link"><i class="icon-file-text"></i>Docs. YES</a>
    </div>

    <div class="send-ofi-btn-wrapper">
      <p>
        Vendor: {{ stock.vendor_firstname }} {{ stock.vendor_surname }}
      </p>
      <br>
      <p>
        <el-button-group>
          <a v-if="stock.vendor_mobile" :href="'tel:'+stock.vendor_mobile" class="el-button el-button--default el-button--small">
            <i class="icon-phone"></i>Call
          </a>
          <a v-if="stock.vendor_email" :href="'mailto:'+stock.vendor_email" class="el-button el-button--default el-button--small">
            <i class="icon-mail"></i>Email
          </a>
          <a v-if="preparedInspectionReportAddressees"
            :href="'mailto:'+preparedInspectionReportAddressees+additions_to_email"
            class="el-button el-button--default el-button--small">
            <i class="icon-file-pdf"></i>Send Inspection Report
          </a>
        </el-button-group>
      </p>
    </div>

    <br>
    <div class="doc-download-link-wrapper">
      <div class="pull-left">
        <el-button-group>
          <el-button v-if="isOfiSent || isOfiSentOK" size="small" :disabled="true">
            All Sent
          </el-button>
          <el-button v-else size="small" @click="sendMessageDocsToBuyers($event)">
            Send Message/Docs. To Buyers
          </el-button>
        </el-button-group>
        <a class="help-link" target="_blank" href="http://www.multilink.com.au/wip/weblink/index.php/helper/ofi_sms_email_vendor_attendees">
          &nbsp;<i class="icon-question"></i>
        </a>
      </div>
      <div class="pull-right mr20">
        <el-tag v-if="inspections && inspections.length>0" type="success">
          <span v-if="inspections && inspections.length==1">Attendee: </span>
          <span v-else>Attendees: </span>
          <span class="total">{{ inspections.length }}</span>
        </el-tag>
      </div>
      <div class="clearfix">

      </div>
    </div>
  </div>
</template>
<script src="./functions.js" type="text/ecmascript-6" />
