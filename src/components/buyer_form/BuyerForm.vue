<template>
  <div class="buyer-form-wrapper">
    <el-form ref="form" :model="buyerForm" :rules="valicationRules" label-width="100px">
      <div class="basic-fields-wrapper">
        <div class="save-button-wrapper">
          <el-button @click="newBuyerFormSubmit($event)" type="success" size="large">Save<i class="el-icon-upload el-icon--right"></i></el-button>
        </div>

        <el-form-item label="First Name">
          <el-input v-model="buyerForm.name" placeholder="First Name"></el-input>
        </el-form-item>
        <el-form-item label="Surname">
          <el-input v-model="buyerForm.surname" placeholder="Surname"></el-input>
        </el-form-item>
        <el-form-item label="Phone">
          <el-input
            v-model="buyerForm.phone"
            placeholder="Contact number"
            class="phone-input"
          ></el-input>
          <a v-bind:href="'tel:'+buyerForm.phone" class="call-btn-wrapper">
            <i class="icon-phone call-btn" v-bind:class="{ 'call-btn-active' : buyerForm.phone.length>7 }"></i>
          </a>
          <a href="#" class="call-btn-wrapper">
            <i class="el-icon-loading" v-bind:class="{ 'hidden' : !buyerForm.checkingPhoneInProgress }"></i>
          </a>
        </el-form-item>
        <el-form-item label="Email">
          <el-input
          v-model="buyerForm.email"
          placeholder="Email"
          class="email-input"
          ></el-input>
          <a v-bind:href="'mailto:'+buyerForm.email" class="call-btn-wrapper">
            <i class="icon-mail call-btn" v-bind:class="{ 'call-btn-active' : buyerForm.email.length>8 }"></i>
          </a>
        </el-form-item>
      </div>

      <!-- Transition animation -->
      <transition
        name="full-form-classes-transition"
        enter-active-class="animated flipInY"
        leave-active-class="animated flipOutY"
      >

        <div class="extra-fields-wrapper" v-show="buyerForm.showAllFields">
        <div class="show-more-btn-wrapper">
          <p class="txt-center show-more-btn" v-on:click="toggleShowAllFields">
            <i v-if="buyerForm.showAllFields" class="el-icon-caret-top"></i>
            <i v-else="buyerForm.showAllFields" class="el-icon-caret-bottom"></i>
            {{ buyerForm.showAllFields ? 'Hide' : 'More' }}
          </p>
        </div>

        <el-form-item label="Activity Type">
          <el-select v-model="buyerForm.activity_type" name="activity_type" placeholder="Activity Type">
            <el-option
              v-for="item in buyerForm.activityTypeOptions"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Price">
          <el-input v-model="buyerForm.price" placeholder="Price"></el-input>
        </el-form-item>

        <el-form-item label="Frequent text">
          <el-select v-model="buyerForm.frequentText" name="frequentText" placeholder="">
            <el-option
              v-for="item in frequentTextOptions"
              :label="item.text"
              :value="item.text">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Comments">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 6}"
            placeholder="Comments to Include in Property Activity Report"
            v-model="buyerForm.notes"
            name="notes"
          >
          </el-input>
        </el-form-item>

        <div class="el-radio-group-wrapper txt-center">
          <el-radio-group v-model="buyerForm.interest_type" @change="changeInterestHandler">
            <el-radio-button label="Not Interested"></el-radio-button>
            <el-radio-button label="Maybe"></el-radio-button>
            <el-radio-button label="Interested"></el-radio-button>
          </el-radio-group>
        </div>

        <div class="clearfix mb20">

        </div>

        <el-form-item label="Want Docs?">
          <el-switch
            v-model="buyerForm.wants_sect32"
            on-color="#13ce66"
            off-color="#ff4949"
            on-text="YES"
            off-text="NO"
          >
          </el-switch>
        </el-form-item>

        <div class="separator-line"></div>

        <el-form-item label="My Contact Notes">
          <el-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5}"
            placeholder="Notes relating to attendees"
            v-model="buyerForm.myContactNotes"
            name="myContactNotes"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="Frequent text">
          <el-select v-model="buyerForm.frequentTextTwo" name="frequentTextTwo" placeholder="">
            <el-option
              v-for="item in frequentTextOptions"
              :label="item.text"
              :value="item.text">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Potential Seller">
          <el-switch
            v-model="buyerForm.potential_seller"
            on-text="YES"
            off-text="NO"
            on-color="#13ce66"
          >
          </el-switch>
        </el-form-item>

        <div class="subtitle">
          <h2 class="pre-existing-title">Pre-existing Notes</h2>
          <p class="pre-existing-content">{{ buyerForm.pre_existing_notes }}</p>
        </div>
      </div>

      </transition>

      <div class="show-more-btn-wrapper">
        <p class="txt-center show-more-btn" v-on:click="toggleShowAllFields">
          <i v-if="buyerForm.showAllFields" class="el-icon-caret-top"></i>
          <i v-else="buyerForm.showAllFields" class="el-icon-caret-bottom"></i>
          {{ buyerForm.showAllFields ? 'Hide' : 'More' }}
        </p>
      </div>

      <div v-show="buyerForm.showAllFields" class="save-button-wrapper">
        <el-button @click="newBuyerFormSubmit($event)" type="success" size="large">Save<i class="el-icon-upload el-icon--right"></i></el-button>
      </div>
    </el-form>
  </div>
</template>
<script src="./functions.js" type="text/ecmascript-6" />
