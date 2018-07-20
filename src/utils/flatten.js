/**
 * flatten result of results and filter empty results
 * offset and limit parameter from request are passed to slice the result
 * @param collections
 * @returns {*}
 */
function flatten(collections,filter) {
    let data = collections.reduce((flattened, current) => {
        return (current || []).length > 0
            ? [...flattened, ...current]
            : flattened;
    }, []);
	
	if( filter['$offset'] && filter['$limit'] ){
		const total=data.length;
		data=data.slice(filter['$offset'],filter['$offset']+filter['$limit']);
		data[0].total=total;
	}
	return data
}



module.exports = flatten;
