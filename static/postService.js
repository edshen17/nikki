const formComponent = new Vue({
    el: '#formComponent',
    data: {
        userTitle: '',
        userContent: ''
    }
});

const profileComponent = new Vue({
    el: '#profileComponent',
    data: {
        posts: [{title: 'test', content: 'testesttest'}]
    }
});

