const buildOverlay = () => ({
    'links': {
        'self': '',
        'first': '',
        'last': '',
        'next': '',
        'prev': ''
    },
    'data': [],
});

const addPermission = (event, hasWritePermission = false) => {
    event.attributes.authorities = ['can-read'];
    if (hasWritePermission) {
        event.attributes.authorities.push('can-write');
    }

    return event;
};

const createEventScope = (type = 'scope', id, name = 'test', hasWritePermission = false, scopeType) => {
    const event = {
        type,
        id,
        attributes: {
            name,
        }
    };
    if (scopeType) {
        event.attributes.scopeType = scopeType;
    }
    return addPermission(event, hasWritePermission);
};

const addUserScope = (overlay, userId, name = 'user scope name') => {
    overlay.data.push(createEventScope('user', userId, name, true));
    return overlay;
};

const addCourseScope = (overlay, courseId, name, hasWritePermission = false) => {
    overlay.data.push(createEventScope('scope', courseId, name, hasWritePermission, 'course'));
    return overlay;
};

const addClassScope = (overlay, classId, name, hasWritePermission = false) => {
    overlay.data.push(createEventScope('scope', classId, name, hasWritePermission, 'class'));
    return overlay;
};

const createOverlayWithDefaultScopes = ({
    userId = '59898b4a26ffc20c510cfcf0',
    classReadId = '5db838ff8517be0028847d1d',
    classWriteId = '5d63d2738e9031001a53f82f',
    courseReadId = '58f735e4014bbf45f0be2502',
    courseWriteId = '5b51d6a582cf210011bedcb1',
} = {}) => {
    const overlay = buildOverlay();
    addUserScope(overlay, userId);
    addClassScope(overlay, classReadId, 'class read scope name');
    addClassScope(overlay, classWriteId, 'class write scope name', true);
    addCourseScope(overlay, courseReadId, 'course read scope name');
    addCourseScope(overlay, courseWriteId, 'course write scope name', true);
    return overlay;
};

module.exports = {
    createEventScope,
    buildOverlay,
    addUserScope,
    addCourseScope,
    addClassScope,
    createOverlayWithDefaultScopes,
};