const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['application/pdf'],
    },
    fileSize: {
      type: Number,
      required: true,
      max: 10 * 1024 * 1024,
    },
    /**
     * Store the PDF bytes in MongoDB (BSON binary).
     * Kept out of list queries via projection in documentService.
     */
    fileData: {
      type: Buffer,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'completed', 'failed'],
      default: 'draft',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
