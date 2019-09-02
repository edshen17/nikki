/* eslint-disable */

Vue.use(VueRouter);

Vue.component('posts', {
    props: ['post', 'loggedUser'],
    template: `
        <div class='blog-post py-2'>
            <h2 class='title'> {{post.title}} </h2>
            <h6> Posted by {{post.postedBy}} on {{formatCompat(post.createdAt)}} </h6>
            <div v-if='!post.isEditing' v-html='post.content' class='py-2 text'></div>
            <div class="md-form">
            <textarea class="md-textarea form-control" rows="15" :value='post.content' :disabled='!post.isEditing' v-if='post.isEditing'></textarea>
            </div>
            <div class='edit'>
                <button v-if="post.isEditing" class='btn btn-primary'>
                     Save
                </button>
                <button class='btn btn-secondary' v-if="post.isEditing" @click="post.isEditing = false; post.likedBy.push();">Cancel</button>
            </div>
                <p> Liked by: {{post.likedBy}}</p> 
                <p> Comments: {{post.comments}}</p>
            <span class='likes'>
                <i class='far fa-heart py-2' v-on:click='likePost(post)' v-bind:class='{far: !post.liked, fas: post.liked, colorRed: post.liked}'></i>
                {{post.likedBy.length}} 
            </span>
            <span class='comments'>
                <i class='far fa-comment-dots ml-2' v-on:click='showModal(post)' data-toggle="modal" :data-target="'#post' + post._id"></i>
                {{post.comments.length}}
            </span>
            <span class='more'>
                <i class="fas fa-chevron-down ml-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-show='loggedUser'></i>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <a class="dropdown-item" id='edit' v-on:click='showMore(post, $event)'>Edit post</a>
                  <a class="dropdown-item" id='delete' v-on:click='showMore(post, $event)'>Delete post</a>
                </div>
            </span>
            <modal v-if='loggedUser' v-bind:post='post'></modal> 
    </div>
    `,
    methods: {
        addLoggedUser(user, funcName, post) {
            // adding properties to the post object by getting post prop values
            if (user) { // if there is a user logged in, create prop in post object
                post.loggedUser = JSON.parse(user);
                post.isEditing = false;
            }
            this.$emit(funcName, this.post, event.currentTarget.id); 
        },
        likePost(post) {
            this.addLoggedUser(this.loggedUser, 'like-post', post);
        },
        showModal(post) {
            this.addLoggedUser(this.loggedUser, 'show-modal', post);
        },
        showMore(post) {
            this.addLoggedUser(this.loggedUser, 'show-more', post);
        },
        formatCompat(dateStr) { // formats mongoose date string into something nicer
            let date = new Date(dateStr);
            let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${month[date.getMonth()]} ${date.getDate()}  ${date.getFullYear()}`;
        }
    }
});

Vue.component('modal', {
    props: ['post'],
    data() {
        return {
            message: '',
        }
    },
    methods: {
        onSubmit(post) {
            axios.post(`http://www.nikkiblog.live/users/${username}/posts/${post._id}/comment`, {
                    postedBy: post.loggedUser,
                    content: this.message,
                })
                .then(res => {
                    post.comments.push(res.data);
                    updatedCommentList(post);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    },
    template: `
        <div class="modal fade" :id="'post' + post._id" tabindex="-1" role="dialog" aria-labelledby="commentModalLabel" aria-hidden="true" >
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="commentModalLabel">Comment on {{post.postedBy}}'s post! ({{post.title}})</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                    <textarea id='commentText' name='commentText' form="commentForm"　rows="10" class="form-control" v-model="message" placeholder="Comment"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" v-on:click='onSubmit(post)' class="btn btn-primary" data-dismiss="modal" aria-label="Close">Post Comment!</button>                 
                    </div>
                </div>
            </div>
        </div>
    `
})

// update comments array (will refactor later)
function updatedCommentList(post) {
    axios.post(`http://www.nikkiblog.live/users/${username}/posts/${post._id}/comment`, {
            comments: post.comments,
        })
        .catch(function (error) {
            console.log(error);
        });
}

// updates the list of likes by updating the db and replacing the db's array of likes with the current one
function updatedLikeList(post) {
    axios.post(`http://www.nikkiblog.live/users/${username}/posts/${post._id}/like`, {
            likedBy: post.likedBy,
        })
        .catch(function (error) {
            console.log(error);
        });
}


const postComponent = new Vue({
    el: '#posts',

    data: {
        posts: null,
    },

    methods: {
        like(post) {
            if (post.loggedUser && !post.liked) { // if logged in and post has not been liked by this user
                post.liked = !post.liked; // likes or unlikes by flipping post.liked property
                post.likedBy.push(post.loggedUser);
                updatedLikeList(post);
            } else if (post.liked) { //user unliking the post
                post.liked = !post.liked; 
                post.likedBy.pop();
                updatedLikeList(post);
            }
            this.show(post);
        },

        show(post) {
            if (!post.loggedUser) {
                alert('You must be logged in to like or comment on a post');
            }
        },

        more(post, eventID) {
            if (post.loggedUser && eventID === 'delete' && confirm(`Are you sure you want to delete this post? (${post.title})`)) {
                axios.delete(`http://www.nikkiblog.live/users/${username}/posts/${post._id}`)
                .then(res => {
                    location.reload(); // refresh page
                })
                .catch(function (error) {
                    console.log(error);
                });
            }

            if (post.loggedUser && eventID == 'edit' && confirm(`Are you sure you want to edit this post? (${post.title})`)) {
                post.isEditing = !post.isEditing;
                post.likedBy.push(); // temp for now. Makes variable reactive.
            }
            
        }
    },
    mounted() {
        axios.get(`http://www.nikkiblog.live/users/${username}/posts`)
            .then(response => {
                this.posts = response.data;
                if (loggedUser) {
                    // for each post, check if loggedUser already liked it (to color in the icons)
                    for (let i = 0; i < this.posts.length; i++) {
                        this.posts[i].isEditing = false;
                        for (let j = 0; j < this.posts[i].likedBy.length; j++) {
                            if (this.posts[i].likedBy.some(likedUser => likedUser.username === loggedUser.username)) {
                                this.posts[i].liked = true;
                            } else {
                                this.posts[i].liked = false;
                            }
                        }
                    }
                }
            })
    }
});