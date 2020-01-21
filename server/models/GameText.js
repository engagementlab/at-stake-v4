/**
 * @Stake v3
 *
 * GameText Model
 * @module models
 * @class GameText
 * @author Johnny Richardson
 *
 * ==========
 */


const keystone = require('keystone');

const {
  Types,
} = keystone.Field;

/**
 * GameText Model
 * ==========
 */
const GameText = new keystone.List('GameText', {});
/**
 * Model Fields
 * @main GameText
 */
GameText.add({

  phaseName: {
    type: Types.Select,
    label: 'Phase',
    options: 'meet, pitch, deliberate, vote',
    required: true,
    initial: true,
  },

  moderatorInstructionText: {
    type: String,
    required: true,
    initial: true,
    hidden: true,
  },
  playerInstructionText: {
    type: String,
    required: true,
    initial: true,
    hidden: true,
  },
  moderatorBubbleText: {
    type: String,
    required: true,
    initial: true,
    hidden: true,
  },
  playerBubbleText: {
    type: String,
    required: true,
    initial: true,
    hidden: true,
  },

  dateCreated: {
    type: Date,
    noedit: true,
  },

});


GameText.schema.pre('save', (next) => {
  this.dateCreated = new Date();

  next();
});

/**
 * Registration
 */
GameText.register();
exports = module.exports = GameText;
