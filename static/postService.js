// const formComponent = new Vue({
//     el: '#formComponent',
//     data: {
//         userTitle: '',
//         userContent: ''
//     }
// });

const profileComponent = new Vue({
    el: '#profileComponent',
    data: {
        posts: []
    }, 
    mounted () {
      axios
        .get('https://api.coindesk.com/v1/bpi/currentprice.json')
        .then(response => (this.info = response))
    }
});

