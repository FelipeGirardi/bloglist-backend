const blogsRouter = require('express').Router()
const middleware = require('../utils/middleware')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  if (request.body.title === undefined) {
    return response.status(400).send('No title')
  }

  if (request.body.url === undefined) {
    return response.status(400).send('No URL')
  }

  if (!request.user) {
    return response.status(401).json({ error: 'Invalid token' })
  }
  const user = await User.findById(request.user)
  const body = request.body
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const updatedBlog = {
    title: body.title,
    url: body.url,
    author: body.author,
    likes: body.likes,
    user: body.user
  }

  const updatedBlogResponse = await Blog.findByIdAndUpdate(
    request.params.id,
    updatedBlog,
    { new: true, runValidators: true, context: 'query' }
  )

  response.status(204).json(updatedBlogResponse)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'Not found' })
  }

  if (!request.user) {
    return response.status(401).json({ error: 'Token invalid' })
  }

  const user = await User.findById(request.user)
  const userId = user.id
  if (blog.user.toString() !== userId.toString()) {
    return response.status(401).json({ error: 'Cannot delete another user\'s blog' })
  }

  blog.remove()
    .then(() => response.status(204).end())
    .catch(() => response.status(404).end())
})

module.exports = blogsRouter