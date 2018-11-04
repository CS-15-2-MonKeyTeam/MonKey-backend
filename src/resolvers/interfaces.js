const R = require('ramda');

const interfaces = {
  FinanceOperation: {
    __resolveType(obj) {
      // resolve the type of the incoming interface data
      if (obj.payee !== null) {
        return 'Expense';
      } else if (obj.place !== null) {
        return 'Income';
      }
      return 'Transfer';
    }
  }
};

const unpackSelectionFromAST = R.map(s => {
  switch (s.kind) {
    case 'Field':
      if (!s.selectionSet) {
        return s.name.value;
      }
      return `${s.name.value} { ${unpackSelectionFromAST(s.selectionSet.selections)} }`;

    case 'InlineFragment':
      switch (s.typeCondition.kind) {
        case 'NamedType':
          return R.compose(
            R.map(field => `${R.toLower(s.typeCondition.name.value)}_${field}`),
            R.reject(R.startsWith('__')), // apollo client compatibility (__typename)
            unpackSelectionFromAST
          )(s.selectionSet.selections);
        default:
          console.error(`${s.typeCondition.kind} unknown in selections AST`);
          break;
      }
      break;
    default:
      console.error(`${s.kind} unknown in selections AST`);
      break;
  }
});

const makeSelectionList = info =>
  R.compose(
    R.reject(R.isNil),
    R.flatten,
    unpackSelectionFromAST,
    R.prop('selections'),
    R.prop('selectionSet'),
    R.head,
    R.prop('fieldNodes')
  )(info);

const formatPrimitiveFields = R.compose(
  R.fromPairs,
  R.map(([k, v]) => [R.replace(/^.*_/, '', k), v]),
  R.toPairs
);

module.exports = { interfaces, makeSelectionList, formatPrimitiveFields };
