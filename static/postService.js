Vue.use(VueRouter);

Vue.component('posts', {
    props: ['post', 'liked'],
    template: `
        <div class='blog-post py-2'>
            <h3> {{post.title}} </h3>
            <p> {{post.likedBy}}</p>
            <h6> {{post.postedBy}} </h6>
            <div v-html='post.content'></div>
            <span class='likes'>
            <i class='far fa-heart py-2' v-on:click='likePost(post)' v-bind:class='{far: !post.liked, fas: post.liked, colorRed: post.liked}'></i>
            {{post.likedBy.length}} 
            </span>
            <span class='comments'>
            <i class='far fa-comment-dots ml-3'></i>
            {{post.comments.length}}
            </span>
        </div>
    `,
    methods: {
        likePost: function(post) {
            this.$emit('like-post', this.post)
        }
    }
});
      
const postComponent = new Vue({
    el: '#posts',
    data: {
        posts: null
    }, 
    methods: {
        like: function(post) {
            post.liked = !post.liked
            post.likedBy.push('test')
        }
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

