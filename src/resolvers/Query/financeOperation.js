const R = require('ramda');

const { getUserId } = require('../../utils');
const { makeSelectionList, formatPrimitiveFields } = require('../interfaces');

const makeSelection = info =>
  R.compose(
    fields => `{ ${R.join(' ')(fields)} }`,
    makeSelectionList
  )(info);

const financeOperation = {
  financeOperations(parent, args, ctx, info) {
    const userId = getUserId(ctx);
    return ctx.db.query
      .financeOperations(
        {
          where: { owner: { id: userId } },
          orderBy: 'date_DESC'
        },
        makeSelection(info)
      )
      .then(R.map(formatPrimitiveFields));
  }
};

module.exports = financeOperation;
