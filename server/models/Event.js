/**
 * @Stake v4
 *
 * Event Model
 * @module models
 * @class Event
 * @author Johnny Richardson
 *
 * ==========
 */


const keystone = require('keystone');

const {
  Types,
} = keystone.Field;

/**
 * Event Model
 * ==========
 */
const Event = new keystone.List('Event', {
  label: 'Event',
  map: {
    name: 'text',
  },
});
/**
 * Model Fields
 * @main Event
 */
Event.add({

  text: {
    type: String,
    label: 'Event Text',
    required: true,
    initial: true,
  },
  dateCreated: {
    type: Date,
    noedit: true,
  },

});


Event.schema.pre('save', function (next) {
  this.dateCreated = new Date();

  next();
});

/**
 * Registration
 */
Event.register();
exports = module.exports = Event;