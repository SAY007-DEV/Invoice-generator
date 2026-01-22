import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    invoiceNumber: String,
    customerId: mongoose.Schema.Types.ObjectId,
    customerName: String,
    items: Array,
    subtotal: Number,
    taxPercentage: Number,
    taxAmount: Number,
    discountPercentage: Number,
    discountAmount: Number,
    total: Number,
    status: {
      type: String,
      enum: ["paid", "unpaid", "overdue"],
      default: "unpaid"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
