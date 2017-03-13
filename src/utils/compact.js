function compact(array) {
    return array.reduce((compacted, element) => {
        if (element === null || typeof element === 'undefined')
            return compacted;
        return [...compacted, element];
    }, []);
}

module.exports = compact;
