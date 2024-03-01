const testtask = {
    'title': 'TEST TASK',
    'categories': ['ORVITASKS', 'PERSONAL'],
    'completed': false,
    'description': '',
    'due_date': null,
    'creation_date': new Date(),
    'edit' : false,
    'comment': 'Test comment',
    'userId': 'SwE4CNlaBInllQrtgTGa',

    'subtasks': [
        {
            'index': 1,
            'completed': true,
            'title': 'Subtask 1'
        },
        {
            'index': 2,
            'completed': false,
            'title': 'Subtask 2'
        },
        {
            'index': 3,
            'completed': true,
            'title': 'Subtask 3'
        }
    ]
}

export { testtask }