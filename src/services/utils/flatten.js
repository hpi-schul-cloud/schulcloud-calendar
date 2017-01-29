/**
 * flatten result of results and filter empty results
 * @param collection
 * @returns {*}
 */
function flatten(collection) {
    return collection.reduce((flattened, current) => {
        return current.length > 0
            ? [...flattened, ...current]
            : flattened;
    }, [])
}

module.exports = flatten;
