export const getSearchQuery = (search: string) => {
  if (search) {
    const parseSearchParams = search.split(';');
    const conditions = [];
    for (const searchParam of parseSearchParams) {
      const [key, value] = searchParam.split(':');
      conditions.push({ key: { $regex: value, $options: 'i' } });
    }

    return {
      $or: conditions,
    };
  }

  return {};
};
