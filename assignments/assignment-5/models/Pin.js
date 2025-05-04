/**
 * Image model
 * Defines the schema for storing user profile images
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
    }
});

module.exports = mongoose.model('Pin', PinSchema);