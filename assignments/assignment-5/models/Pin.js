/**
 * Image model
 * Defines the schema for storing user pins
 */
const mongoose = require('mongoose');

const PinSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        // Removed index to avoid creation issues
        trim: true,
    },
    description: {
        type: String,
        required: false,
        // Removed index to avoid creation issues
        trim: true,
    },
    tags: {
        type: String,
        required: false,
    },
    data: {
        type: Buffer,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      }

});

module.exports = mongoose.model('Pin', PinSchema);