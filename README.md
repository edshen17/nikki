# Nikki (日記)
This website was inspired by Twitter and HelloTalk. I wanted to make a website where natives and language learners can write and share their ideas in different languages. So far, Nikki has become a semi-blog style website, where users can log in, post content, like other posts, and make comments. This is still a work in progress, so I'd like to add some extra features, such as allowing users to have followers, upload profile pictures, etc. 

The website uses Vue.js, Passport.js, Bootstrap, MongoDB, and was designed RESTfully (API routes at [routes/users.js](../routes/users.js)). I have yet to complete the REST API and implement API keys/tokens, but users can access their own JSON data and get objects that are structured like Twitter's user/tweet objects. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites/dependencies
* Node.js/Express
* Vue.js
* MongoDB

### Installing
1. ```git clone https://github.com/edshen17/nikki.git ```
2. Start up Command Prompt or Terminal and navigate to the directory: ```cd <clone directory>```
3. Install all the dependences by typing: ```npm install ``` 
4. Input your mongo server's address/password in ```config/keys.js```
5. Type ```nodemon app.js``` to start the website (which is on port 3000 by default)

## Built With

* [Node.js](https://nodejs.org/en/) 
* [Express.js](https://expressjs.com/) 
* [Vue.js](https://vuejs.org/)
* [Passport.js](http://www.passportjs.org/)
* [MongoDB](https://www.mongodb.com/)
* [Axios](https://www.npmjs.com/package/axios)
* [Bootstrap](https://getbootstrap.com/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Special thanks to the staff at Metrokids Preschool and JP House Discord server users.


