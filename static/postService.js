// const formComponent = new Vue({
//     el: '#formComponent',
//     data: {
//         userTitle: '',
//         userContent: ''
//     }
// });
Vue.use(VueRouter);

Vue.component('user', {
    props: ['text'],
    template: '<h1>Hello {{ text  }}!</h1>'
});
    

const User = {
    template: '<div>User</div>'
  }
  
 
const profileComponent = new Vue({
    el: '#profileComponent',
    data: {
        posts: null,
        user: null
    }, 
    mounted () {
      axios
        .get(`http://localhost:3000/users/${username}/posts`)
        .then(response => {
            this.posts = response.data;
            console.log(this.posts)
        })
    }
});

