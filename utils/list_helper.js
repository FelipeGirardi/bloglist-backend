var _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (max, blog) => {
    return max.likes > blog.likes ? max : blog
  }
  const blog = blogs.reduce(reducer, 0)
  return blog === 0 ? {} : { 'title': blog.title, 'author': blog.author, 'likes': blog.likes }
}

const mostBlogs = (blogs) => {
  var result =
    _(blogs)
      .countBy('author')
      .entries()
      .maxBy(_.last)
  return _.isEmpty(blogs) ? {} : { 'author': result[0], 'blogs': result[1] }
}

const mostLikes = (blogs) => {
  var result =
    _(blogs)
      .groupBy('author')
      .map((objs, key) => ({
        'author': key,
        'likes': _.sumBy(objs, 'likes') }))
      // .value()
      .maxBy('likes')
  return _.isEmpty(blogs) ? {} : result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}