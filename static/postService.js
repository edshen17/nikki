Vue.use(VueRouter);

Vue.component('posts', {
    props: ['post', 'loggedUser'],
    template: `
        <div class='blog-post py-2'>
            <h3> {{post.title}} </h3>
            <h6> Posted by {{post.postedBy}} on {{formatCompat(post.createdAt)}} </h6>
            <div v-html='post.content'></div>
            <span class='likes'>
            <i class='far fa-heart py-2' v-on:click='likePost(post)' v-bind:class='{far: !post.liked, fas: post.liked, colorRed: post.liked}'></i>
            {{post.likedBy.length}} 
            </span>
            <span class='comments'>
            <i class='far fa-comment-dots ml-3' v-on:click='commentPost(post)' data-toggle="modal" :data-target="'#post' + post._id"></i>
            {{post.comments.length}}
            </span>
            <p> {{post.likedBy}}</p> 
            <p> {{post.comments}}</p>
            <modal v-if='loggedUser' v-bind:post='post' v-bind:title='post.title'></modal>
        </div>
    `,
    methods: {
        addLoggedUser(user, funcName, post) {
            // adding properties to the post object by getting post prop values
            if (user) { // if there is a user logged in, create prop in post object
                post.loggedUser = user
            }
            this.$emit(funcName, this.post)
        },
        likePost(post) {
            this.addLoggedUser(this.loggedUser, 'like-post', post);
        },
        commentPost(post) {
            this.addLoggedUser(this.loggedUser, 'comment-post', post);
        },
        formatCompat(dateStr) { // formats mongoose date string into something nicer
            let date = new Date(dateStr);
            let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${month[date.getMonth()]} ${date.getDate()}  ${date.getFullYear()}` 
        }
    }
});

Vue.component('modal', {
    props: ['post', 'title'],
    template: `
        <div class="modal fade" :id="'post' + post._id" tabindex="-1" role="dialog" aria-labelledby="commentModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="commentModalLabel">Comment on {{post.postedBy}}'s post! ({{title}})</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div class="modal-body">
            ...
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Save changes</button>
            </div>
        </div>
        </div>
        </div>
    `
})

// updates the list of likes by updating the db and replacing the db's array of likes with the current one
function updatedLikeList(post) {
    axios.post(`http://localhost:3000/users/${username}/posts/${post._id}/like`, {likedBy: post.likedBy})
        .catch(function (error) {
            console.log(error);
        });
}

      
const postComponent = new Vue({
    el: '#posts',

    data: {
        posts: null
    },

    methods: {
        like(post) {
            post.liked = !post.liked //likes or unlikes by flipping post.liked property
            if (post.loggedUser && !post.likedBy.includes(post.loggedUser)) { // if logged in and post has not been liked by this user
                post.likedBy.push(JSON.parse(JSON.stringify(post.loggedUser)));
                updatedLikeList(post);
            } else if (!post.loggedUser)  {
                alert('You have to be logged in to like or comment on a post');
            } else if (!post.liked) { //user unliking the post
                post.likedBy.pop();
                updatedLikeList(post);
            }
        },

        comment(post) {
            if (post.loggedUser) {
                this.showModal = true;
            } else {
                alert('You must be logged in to like or comment on a post');
            }
        }
    },
    mounted () {
        axios.get(`http://localhost:3000/users/${username}/posts`)
            .then(response => {
                this.posts = response.data;
                if (loggedUser) {
                    // for each post, check if loggedUser already liked it (to color in the icons)
                    for (let i = 0; i < this.posts.length; i++) {
                        for(let j=0; j < this.posts[i].likedBy.length; j++) {
                            if (JSON.parse(this.posts[i].likedBy[j]).username === loggedUser.username) {
                                this.posts[i].liked = true
                            } else {
                                this.posts[i].liked = false;
                            }
                        }
                    }
                }     
        })
    }
});
