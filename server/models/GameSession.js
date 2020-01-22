/**
 * @Stake v4
 *
 * GameSession Model
 * @module models
 * @class GameSession
 * @author Johnny Richardson
 *
 * ==========
 */


const keystone = require('keystone');

const {
  Types,
} = keystone.Field;

/**
 * GameSession Model
 * ==========
 */
const GameSession = new keystone.List('GameSession', {
  editable: false,
  cancreate: false,
});
/**
 * Model Fields
 * @main GameSession
 */
GameSession.add({

  accessCode: {
    type: String,
    required: true,
    initial: true,
    hidden: true,
  },
  deckId: {
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


GameSession.schema.pre('save', (next) => {
  this.dateCreated = new Date();

  next();
});

/**
 * Registration
 */
GameSession.register();
exports = module.exports = GameSession;