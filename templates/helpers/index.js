const hbs = require('handlebars');

module.exports = () => {
  const _helpers = {};

  /**
   * @Stake v3 HBS Helpers
   * ===================
   */

  // Get time in minutes for provided seconds
  _helpers.getMinutes = (strSeconds) => {
    const intSeconds = parseInt(strSeconds, 10);
    const secondsRemainder = (intSeconds % 60);
    const displaySeconds = (secondsRemainder < 10) ? (`0${secondsRemainder}`) : secondsRemainder;

    return `${Math.round(intSeconds / 60)}:${displaySeconds}`;
  };

  _helpers.limit = (ary, max, options) => {
    if (!ary || ary.length === 0) return options.inverse(this);

    const result = [];
    for (let i = 0; i < max && i < ary.length; i += 1) result.push(options.fn(ary[i]));

    return result.join('');
  };

  _helpers.ellipsis = (limit, currentText) => {
    if (currentText) return `${currentText.substr(0, limit)}...`;
  };

  _helpers.checkEven = (num) => ((num % 2 === 0) ? 'even' : 'odd');

  _helpers.namePossessive = (strName) => ((strName.charAt(strName.length - 1) === 's') ? `${strName}'` : `${strName}'s`);

  // Concatenate all passed in strings (combine is alias)
  // eslint-disable-next-line no-multi-assign
  _helpers.combine = _helpers.concat = () => {
    let strCombined = '';

    // Skip the last argument.
    for (let i = 0; i < arguments.length - 1; i += 1) strCombined += arguments[i];

    return strCombined;
  };

  // Given component params, generate classes that make up its display mode
  _helpers.showHide = (attr) => {
    let strClasses = '';

    // Is this component only visible to decider?
    if (attr.decider && attr.decider === true) strClasses = 'decider';

    // For non-decider
    else {
      if (attr.all_players === undefined || attr.all_players === false) strClasses = 'player';

      // Is this component only visible to active players or not?
      if (attr.active_player !== undefined) strClasses += (attr.active_player === true) ? ' showing' : ' hiding';

      else if (attr.inactive_player !== undefined) strClasses += (attr.inactive_player === true) ? ' showing' : ' hiding';
    }

    return strClasses;
  };

  // Given decider's speech component params, generate event that fires when 'next' is hit
  _helpers.nextEvent = (attr) => {
    let strEvent = 'game:';

    // Is this speech bubble's button...
    // ... advancing to next phase?
    if (attr.advance && attr.advance === true) strEvent += 'next';

    // ... advancing to a timer?
    else if (attr.timer && attr.timer === true) strEvent += 'start_timer';

    // ... just moving to next bubble?
    else strEvent += 'next_screen';

    return strEvent;
  };

  // Given agenda item's placement in lineup of all items, decide data-next event
  _helpers.nextAgendaEvent = (playerCount, index, lastItem) => {
    let strEvent = '';

    if ((playerCount - 1 === index) && lastItem) strEvent = 'next_screen';
    else strEvent = 'next_modal';

    return strEvent;
  };

  // Given agenda item's reward given item's index
  _helpers.agendaReward = function (rewards, index) {
    if (!rewards) throw new Error('No agenda item rewards defined!');

    return rewards[index];
  };

  // Get ordinal affix for number
  _helpers.ordinalPosition = (index) => {
    const affixes = ['th', 'st', 'nd', 'rd'];
    const remainder = (index + 1) % 100;

    return (index + 1) + (affixes[(remainder - 20) % 10] || affixes[remainder] || affixes[0]);
  };

  // Get number sign (if number is negative, positive, or zero) as string
  _helpers.numSignString = (number) => {
    let type = 'positive';

    if (number === 0) type = 'zero';
    else if (number < 0) type = 'negative';

    return type;
  };

  // Get number sign (if number is negative, positive, or zero)
  _helpers.numSign = (number) => {
    let type = '';

    if (number > 1) type = '+';
    else if (number < 0) type = '-';

    return type + number;
  };

  //  ### int addition helper
  // Used for increasing int by amount
  //
  //  @amt: Amount to offset
  //
  //  *Usage example:*
  //  `{{sum @index 3}}

  _helpers.sum = (ind, amt) => parseInt(ind, 10) + amt;

  return _helpers;
};
