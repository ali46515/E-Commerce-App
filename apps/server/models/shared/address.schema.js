import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    fullName: String,

    phoneNumber: String,

    addressLine1: String,

    addressLine2: String,

    city: String,

    state: String,

    postalCode: String,

    country: String,
  },
  { _id: false },
);

export default addressSchema;
