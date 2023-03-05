export const getSearchQuery = (search: string, searchJoin: string = 'or') => {
  if (search) {
    const parseSearchParams = search.split(';');
    const conditions = [];
    for (const searchParam of parseSearchParams) {
      const [key, value] = searchParam.split(':');
      if(isNaN(parseFloat(value))) {
        conditions.push({ [key]: { $regex: value, $options: 'i' } });
      } else {
        conditions.push({ [key]: +value});
      }
    }

    if(searchJoin === 'and') {
      return {
        $and: conditions,
      };
    }
    return {
      $or: conditions,
    };
  }

  return {};
};
