let  {rule, shield, and, or} = require("graphql-shield")


const isAuthenticated = rule()((parent, args, {currentUser})=>{
    console.log('currentUser')
    console.log(currentUser)
    return currentUser != null
})


module.exports = shield({
    Query:{
        findMovies: isAuthenticated,
        findMovieById: isAuthenticated
    }
})