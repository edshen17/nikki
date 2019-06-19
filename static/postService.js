Vue.use(VueRouter);

Vue.component('posts', {
    props: ['post', 'liked'],
    template: `
        <div class='blog-post py-2'>
            <h3> {{post.title}} </h3>
            <h6> {{post.postedBy}} </h6>
            <div v-html='post.content'></div>
            <span class='likes'>
            <i class='far fa-heart py-2' v-on:click='like' v-bind:class='{far: !liked, fas: liked, colorRed: liked}'></i>
            {{post.likedBy.length}} 
            </span>
            <span class='comments'>
            <i class='far fa-comment-dots ml-3'></i>
            {{post.comments.length}}
            </span>
        </div>
    `,  
    methods: {
        like: function() {
            this.liked = !this.liked
        }
    }
});
      
const postComponent = new Vue({
    el: '#posts',
    data: {
        posts: null
    }, 
    // methods: {
    //     alert: function(event) {
    //         alert('button has been clicked')
    //     }
    // },
    mounted () {
      axios
        .get(`http://localhost:3000/users/${username}/posts`)
        .then(response => {
            this.posts = response.data;
            console.log(this.posts)
        })
    }
    
});

