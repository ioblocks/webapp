// Copyright 2016-2017 Gabriele Rigo

/*
import { renderAccounts } from './accountSelector';

export default from './accountSelector';
export {
  renderAccounts
};
*/

import AccountSelect from './accountSelector';
import { renderAccounts } from './accountSelector';

export default {
  AccountSelect: AccountSelect,
  renderAccounts: renderAccounts
};