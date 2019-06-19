Vue.use(VueRouter);

Vue.component('posts', {
    props: ['post'],
    template: `
        <div class='blog-post py-2'>
            <h3> {{post.title}} </h3>
            <h6> {{post.postedBy}} </h6>
            <div v-html='post.content'></div>
            <i class="far fa-heart py-2"></i>
            <i class="far fa-comment-dots mx-3"></i>
        </div>
    
    `  
});
      
const postComponent = new Vue({
    el: '#posts',
    data: {
        posts: null
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

