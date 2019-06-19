Vue.use(VueRouter);

Vue.component('user', {
    props: ['name', 'title', 'content', 'date'],
    template: 
       `<div class='blog-posts'> 
       <h1>{{title}}</h1>
         <p>{{content}}</p>
         <p>{{name}}</p>
         <p>{{date}}</p>
         </div>
       `     
});
      
const profileComponent = new Vue({
    el: '#profile',
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

