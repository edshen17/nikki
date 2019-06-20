Vue.use(VueRouter);

Vue.component('posts', {
    props: ['post', 'logged' , 'liked', 'loggedUser'],
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
            // adding properties to the post object by getting post prop values
            post.logged = this.logged;
            if (this.loggedUser) post.loggedUser = this.loggedUser
            this.$emit('like-post', this.post)
        }
    }
});

// updates the list of likes by updating the db and replacing the db's array of likes with the current one
function updatedLikeList(post) {
    axios.post(`http://localhost:3000/users/${username}/posts/${post._id}/like`, {likedBy: post.likedBy})
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
}
      
const postComponent = new Vue({
    el: '#posts',
    data: function() {
        let data = {
            posts: null
        }

        return data;
    }, 
    methods: {
        like: function(post) {
            post.liked = !post.liked //likes or unlikes by flipping post.liked property
            if (post.logged && !post.likedBy.includes(post.loggedUser)) { // if logged in and post has not been liked by this user
                post.likedBy.push(post.loggedUser);
                updatedLikeList(post);
            } else if (!post.logged)  {
                alert('You have to be logged in to like or comment on a post');
            } else if (!post.liked) { //user unliking the post
                post.likedBy.shift();
                updatedLikeList(post);
            }
        }
    },
    mounted () {
      axios
        .get(`http://localhost:3000/users/${username}/posts`)
        .then(response => {
            this.posts = response.data;
        })
    }
    
});

