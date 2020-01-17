/**
 * @Stake v3
 *
 * Intro Model
 * @module models
 * @class Intro
 * @author Johnny Richardson
 *
 * ==========
 */


const keystone = require('keystone');

const {
  Types,
} = keystone.Field;

/**
 * Intro Model
 * ==========
 */
const Intro = new keystone.List('Intro', {
  label: 'Intro Text',
  singular: 'Intro Text',
});
/**
 * Model Fields
 * @main Intro
 */
Intro.add({

  text: {
    type: Types.TextArray,
    label: 'Intro Text',
    note: 'One string per screen.',
    required: true,
    initial: true,
  },
  dateCreated: {
    type: Date,
    noedit: true,
  },

});


Intro.schema.pre('save', (next) => {
  this.dateCreated = new Date();

  next();
});

/**
 * Registration
 */
Intro.register();
exports = module.exports = Intro;
