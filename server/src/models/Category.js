const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
      index: true
    },
    icon: {
      type: String,
      default: 'tag',
      trim: true
    },
    color: {
      type: String,
      default: '#3978D4',
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

categorySchema.index({ owner: 1, type: 1, isArchived: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
