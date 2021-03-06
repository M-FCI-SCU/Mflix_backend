var jwt = require('jsonwebtoken');
var UserClass = require('./models/User')
var MovieClass = require('./models/Movie')
var CommentClass = require('./models/Comment')
var User = new UserClass()
var Movie = new MovieClass()
var Comment = new CommentClass()
var { ObjectId } = require('mongodb');
var { PubSub, withFilter } = require('graphql-subscriptions');
var cloudinary = require("./cloudinary")
var ffmpeg = require("fluent-ffmpeg")
var fs = require('fs');
var path = require('path');
const { GraphQLUpload } = require('graphql-upload');
//const { finished } = require('stream/promises');

const pubsub = new PubSub();
module.exports = {
    Upload: GraphQLUpload,
    Subscription: {
        CommentsSubscribe: {
            // More on pubsub below
            subscribe: withFilter(
                () => pubsub.asyncIterator('COMMENT_SUBSCRIBE'),
                (payload, variables) => {
                    // Only push an update if the comment is on
                    // the correct repository for this operation
                    let index = variables.moviesIds.findIndex(movieid => movieid == payload.CommentsSubscribe.movie_id)
                    console.log('index')
                    console.log(index)
                    return index != -1 ? true : false;
                },
            ),

        },
    },
    Query: {
        createSnapshots: async () => {
            // let stream =   fs.createReadStream(path.join(__dirname, '../videos') + '/WatchDiscover.mp4')
            // ffmpeg.ffprobe(require('fs').createReadStream('../videos/WatchDiscover.mp4'), function(err, metadata) {
            //     console.log('metadata');
            //     console.log(metadata);
            //     console.log(err);
            // });
            ffmpeg("https://res.cloudinary.com/radlz/video/upload/v1642247846/hboiuprf7spv6ctz1rbz.mp4").screenshots({
                // timestamps: [30.5, '50%', '01:10.123'],
                // filename: 'thumbnail-at-%s-seconds.png',
                count: 3,
                folder: '.',
                size: '320x240'
            }).on('end', function () {
                console.log('Screenshots taken');
                return true
            }).on('error', function (error) {
                console.log('Screenshots error');
                console.log(error);
            })
        },
        checkUserExist: async (_, __, { req }) => {
            var decoded = jwt.verify(req.headers.authorization, process.env.JWTSECRETKEY);
            let results = await User.findUserByEmail(decoded.email)
            if (results) {
                return results
            } else {
                return null
            }
        },
        login: async (_, { email, password }, { req }) => {
            let res = await User.login(email, password)
            if (res.email) {
                var token = await jwt.sign({ email: res.email }, process.env.JWTSECRETKEY);
                res.token = token
            }
            return res
        },
        findMovies: async (_, { skip, limit }) => {
            let res = await Movie.findMovies(skip, limit)
            return res
        },
        findMovieById: async (_, { id }) => {
            let res = await Movie.findMovieById(id)
            return res
        },
    },
    Mutation: {
        singleUpload: async (parent, { files }, { req }) => {
            try {
                /*******************Upload Video Files********************/
                // const { createReadStream, filename, mimetype, encoding } = await file.file;
                // const stream = createReadStream({ highWaterMark: 1000000 });
                // var upload_stream = cloudinary.v2.uploader.upload_stream(
                //     {
                //         resource_type: "video",
                //         // public_id: "myfolder/mysubfolder/dog_closeup",
                //         chunk_size: 6000000,
                //         // eager: [
                //         //     { width: 300, height: 300, crop: "pad", audio_codec: "none" },
                //         //     { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" }],
                //         // eager_async: true,
                //         // eager_notification_url: "https://mysite.example.com/notify_endpoint"
                //     },
                //     function (error, result) {

                //         console.log(result, error)
                //     });
                // stream.pipe(upload_stream)
                /*******************Upload files and saved it locally********************/
                // const stream = createReadStream();
                // const out = require('fs').createWriteStream('local-file-output.png');
                // stream.pipe(out);
                // await finished(out);
                // const result = await cloudinary.v2.uploader.upload(file, {
                //     allowed_formats: ["jpg", "png"],
                //     public_id: `first_${new Date().getTime()}`,
                //     folder: "commentsImages",
                // });
                /*******************Upload files with stream into cloud services********************/
                console.log('files')
                console.log(files)
                for (let upload of files) {
                    console.log('upload')
                    const { createReadStream, filename, mimetype, encoding } = await upload;
                    console.log(filename, mimetype, encoding)
                    const stream = createReadStream();
                    var upload_stream = cloudinary.v2.uploader.upload_stream({
                        allowed_formats: ["jpg", "png"],
                        public_id: `${filename}_${new Date().getTime()}_id`,
                        folder: "commentsImages",
                    }, function (error, result) {
                        console.log(result, error)
                    });
                    stream.pipe(upload_stream)
                }
                return { filename: 'filename', mimetype: 'mimetype', encoding: 'encoding', url: null };

            } catch (e) {
                //returns an error message on image upload failure.
                console.log(`Image could not be uploaded:${e}`)
                console.log(e)
                return { filename: 'null', mimetype: 'null', encoding: 'null' }
            }

        },
        register: async (_, { name, email, password }) => {
            let res = await User.register({ name, email, password })
            return res
        },
        createComment: async (_, { content }) => {
            let { name, email, movie_id, text } = content
            let res = await Comment.createComment({ name, email, movie_id, text })

            if (res._id) {
                pubsub.publish('COMMENT_SUBSCRIBE', { CommentsSubscribe: { ...res, action: "COMMENT_CREATED" } });
            }
            return res
        },
        deleteComment: async (_, { movieId, commentId }) => {
            let res = await Comment.deleteComment(movieId, commentId)
            console.log("COMMENT_DELETED==========================================")
            if (res._id) {
                console.log({ ...res, action: "COMMENT_DELETED" })
                pubsub.publish('COMMENT_SUBSCRIBE', { CommentsSubscribe: { ...res, action: "COMMENT_DELETED" } });
            }
            return res
        },

    },
    // Movie: {
    //     comments(parent) {
    //         console.log('parent')
    //         console.log(parent)
    //         return [...parent.comments]
    //     }
    // }
};
