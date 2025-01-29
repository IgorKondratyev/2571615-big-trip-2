export const adaptToServer = (point, isAdd = false) => {

  const result = {
    'base_price': +point.basePrice,
    'date_from': point.dateFrom,
    'date_to': point.dateTo,
    'destination': point.destination.id,
    'is_favorite': point.isFavorite,
    'offers': point.offers,
    'type': point.type
  };

  if(!isAdd) {
    result.id = point.id;
  }
//console.log(result)
  return result;

};
