export const getSearchQuery = (search: string, searchJoin: string = 'or') => {
  if (search) {
    const parseSearchParams = search.split(';');
    const conditions = [];
    for (const searchParam of parseSearchParams) {
      const [key, value] = searchParam.split(':');
      if (isNaN(parseFloat(value))) {
        conditions.push({ [key]: { $regex: value, $options: 'i' } });
      } else {
        conditions.push({ [key]: +value });
      }
    }

    if (conditions.length === 1) {
      return conditions[0];
    } else if (searchJoin === 'and') {
      return {
        $and: conditions,
      };
    } else
      return {
        $or: conditions,
      };
  }

  return {};
};
